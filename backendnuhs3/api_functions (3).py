import requests
from typing import List, Dict
import csv
import json
from pydantic import BaseModel
from dotenv import dotenv_values
import pandas as pd
from datetime import datetime, timedelta
from llm import *
from fastapi import FastAPI, HTTPException
import time

config = dotenv_values(".env")
bot_token=config["bot_token"]

class Message(BaseModel):
    chat_id: str
    message_thread_id: str
    text: str

CSV_FILE_PATH = 'sent_messages.csv'
CSV_FILE_PATH_UPDATES = 'telegram_updates.csv'
USER_DETAILS_FILE_PATH = 'user_details.csv'
FAQ_FILE_PATH = 'faq.csv'
CATEGORIES_FILE_PATH = 'categories.csv'

# Initialize with a very early timestamp to ensure all records are returned on the first call
last_request_timestamp = 0

def get_user_details_by_id(user_id, file_path):
    try:
        with open(file_path, mode='r', newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                if str(user_id) == row.get('id'):
                    # Convert the row to JSON
                    return json.dumps(row)
        return json.dumps({"error": "User not found"})  # Return an error message if the user is not found
    except FileNotFoundError:
        return json.dumps({"error": "File not found"})
    
# def read_new_updates(file_path: str, last_update_id: int) -> List[Dict]:
#     """Read and return updates newer than `last_update_id`."""
#     new_updates = []
#     with open(file_path, mode='r', newline='', encoding='utf-8') as file:
#         reader = csv.DictReader(file)
#         for row in reader:
#             if int(row['update_id']) > last_update_id:
#                 new_updates.append(row)
#     return new_updates
    

def read_new_updates(file_path: str, last_update_id: int) -> List[Dict]:
    """Read and return updates newer than `last_update_id`, removing duplicates."""
    # Read the CSV file into a DataFrame
    df = pd.read_csv(file_path)
    
    # Remove duplicate rows based on the 'update_id' column, keeping the last occurrence
    df = df.drop_duplicates(subset=['update_id'], keep='last')
    
    # Filter updates newer than `last_update_id`
    new_updates_df = df[df['update_id'] > last_update_id]
    
    # Convert the filtered DataFrame back into a list of dictionaries
    new_updates = new_updates_df.to_dict('records')
    
    return new_updates

def save_message_to_csv(message_data: Message):
    """Save the message data to a CSV file."""
    with open(CSV_FILE_PATH, mode='a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        # Write headers if the file is newly created
        if file.tell() == 0:
            writer.writerow(['timestamp', 'chat_id', 'message_thread_id', 'text'])
        current_timestamp = int(datetime.now().timestamp())
        writer.writerow([current_timestamp, message_data.chat_id, message_data.message_thread_id, message_data.text])

def save_message_to_csv_flask(message_data: Message):
    """Save the message data to a CSV file."""
    with open(CSV_FILE_PATH, mode='a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        # Write headers if the file is newly created
        if file.tell() == 0:
            writer.writerow(['timestamp', 'chat_id', 'message_thread_id', 'text'])
        writer.writerow([datetime.now().isoformat(), message_data['chat_id'], message_data['message_thread_id'], message_data['text']])

def save_message_to_csv_llm(message_data: dict):
    """Save the message data to a CSV file."""
    with open(CSV_FILE_PATH, mode='a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        # Write headers if the file is newly created
        if file.tell() == 0:
            writer.writerow(['timestamp', 'chat_id', 'message_thread_id', 'text'])
        current_timestamp = int(datetime.now().timestamp())
        # Access dictionary values with keys
        writer.writerow([current_timestamp, message_data['chat_id'], message_data['message_thread_id'], message_data['text']])

# Function to read and filter messages from the last week
def get_recent_messages():
    df = pd.read_csv(CSV_FILE_PATH_UPDATES)
    # Convert Unix timestamp to datetime
    df['message_date'] = pd.to_datetime(df['message_date'], unit='s')
    one_week_ago = datetime.now() - timedelta(days=7)
    # Filter messages from the last week
    recent_df = df[df['message_date'] > one_week_ago]
    return recent_df

# Pseudo-function to generate topics from text
def generate_topics(texts: List[str]):
    # Here you would integrate with an AI model to analyze texts and extract topics
    # This is placeholder logic
    topics = ["Topic 1", "Topic 2", "Topic 3"]
    return topics

# Pseudo-function to generate FAQs from text
def generate_faqs(texts: List[str]):
    # Integrate with an AI model to generate FAQs based on the provided texts
    # Placeholder logic
    faqs = [{"question": "Sample Question 1?", "answer": "Sample Answer 1."}]
    return faqs

def generate_ai_response(conversation: List[Dict], question: str) -> str:
    # Placeholder for RAG or embedding search logic
    # Here, you would analyze the conversation and the question to generate a response
    return "This is a placeholder response based on the question and conversation context."

def all_incoming_outgoing_messages():
    # Read the telegram updates, drop duplicates
    telegram_updates = pd.read_csv(CSV_FILE_PATH_UPDATES).drop_duplicates(subset=['update_id'])
    # Add a flag column for incoming messages
    telegram_updates['direction'] = 'INCOMING'
    
    # Read the sent messages
    sent_messages = pd.read_csv(CSV_FILE_PATH)
    # Add a flag column for outgoing messages
    sent_messages['direction'] = 'OUTGOING'
    sent_messages["timestamp"] = sent_messages["timestamp"].astype(int)
    
    # Rename columns to unify them
    telegram_updates.rename(columns={'message_date': 'timestamp'}, inplace=True)
    
    sent_messages['update_id'] = 'NA'  # Since sent messages don't have update_id
    sent_messages['message_id'] = 'NA'  # Assuming message_id is not relevant for sent messages
    sent_messages['user_id'] = 'NA'  # If user_id is not applicable for sent messages
    sent_messages['is_bot'] = 'NA'
    sent_messages['first_name'] = 'NA'
    sent_messages['username'] = 'NA'
    sent_messages['language_code'] = 'NA'
    sent_messages['chat_type'] = 'NA'
    
    # Merge the dataframes
    merged_df = pd.concat([telegram_updates, sent_messages], sort=False).fillna('NA')
    
    # Sort by timestamp
    merged_df.sort_values(by='timestamp', inplace=True)
    return merged_df

def all_new_incoming_outgoing_messages():
    global last_request_timestamp

    # Ensure telegram_updates' message_date is converted to Unix timestamp format
    telegram_updates = pd.read_csv(CSV_FILE_PATH_UPDATES).drop_duplicates(subset=['update_id'])
    telegram_updates['direction'] = 'INCOMING'
    
    sent_messages = pd.read_csv(CSV_FILE_PATH)
    sent_messages['direction'] = 'OUTGOING'
    # Assuming the timestamp in sent_messages is already in Unix timestamp format
    sent_messages["timestamp"] = sent_messages["timestamp"].astype(int)
    # Rename columns to unify the timestamp column
    telegram_updates.rename(columns={'message_date': 'timestamp'}, inplace=True)
    # Add placeholder columns to sent_messages to match telegram_updates
    for column in ['update_id', 'message_id', 'user_id', 'is_bot', 'first_name', 'username', 'language_code', 'chat_type']:
        sent_messages[column] = 'NA'

    # Concatenate and filter for new records
    merged_df = pd.concat([telegram_updates, sent_messages], ignore_index=True, sort=False)
    
    merged_df = merged_df[merged_df['timestamp'] > last_request_timestamp].fillna('NA')

    # Update last_request_timestamp to the latest timestamp seen
    if not merged_df.empty:
        last_request_timestamp = merged_df['timestamp'].max()

    merged_df.sort_values(by='timestamp', inplace=True)
    
    return merged_df.to_dict(orient='records')


def process_chat_updates(updates):

    # all_messages = all_incoming_outgoing_messages()
    # print(all_messages.head())
    print(updates)
    for update in updates:
        message = update.get('message', {})
        chat_id = message.get('from', {}).get('id')
        latest_message = message.get('text', '')
        print(latest_message)

        llm_response = llm_answer(latest_message)

        send_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload = {
            "chat_id": str(chat_id),
            "message_thread_id" : "Test",
            "text": llm_response
        }
        response = requests.post(send_url, data=payload)
        
        if response.status_code == 200:
            save_message_to_csv_llm(payload)
            return {"message": "Message sent successfully"}
        else:
            raise HTTPException(status_code=response.status_code, detail="Failed to send message")
        
def get_statistic():
    # Define paths to the files
    current_time = datetime.now()
    one_week_ago = current_time - timedelta(days=7)

    # Read the CSV files
    user_details = pd.read_csv(USER_DETAILS_FILE_PATH)
    user_details = user_details.drop_duplicates()
    sent_messages = pd.read_csv(CSV_FILE_PATH)
    sent_messages = sent_messages.drop_duplicates()
    telegram_updates = pd.read_csv(CSV_FILE_PATH_UPDATES)
    telegram_updates = telegram_updates.drop_duplicates()

    # Convert epoch timestamps to datetime objects
    sent_messages['timestamp'] = pd.to_datetime(sent_messages['timestamp'], unit='s')
    telegram_updates['message_date'] = pd.to_datetime(telegram_updates['message_date'], unit='s')

    # Proceed with calculations as before...
    total_users = user_details['id'].nunique()

    # user_details['join_date'] = pd.to_datetime(user_details['join_date'])
    # new_users_weekly = user_details[user_details['join_date'] > one_week_ago]['id'].nunique()

    total_messages = len(sent_messages) + len(telegram_updates)
    new_messages = len(sent_messages[sent_messages['timestamp'] > one_week_ago]) + \
                   len(telegram_updates[telegram_updates['message_date'] > one_week_ago])

    active_users = pd.concat([
        sent_messages[sent_messages['timestamp'] > one_week_ago]['chat_id'],
        telegram_updates[telegram_updates['message_date'] > one_week_ago]['user_id']
    ]).nunique()

    if total_users > 0:
        avg_messages_per_user = round(total_messages / total_users, 2)  # Rounded off
    else:
        avg_messages_per_user = 0

    return {
        "total_users": total_users,
        # "new_users_weekly": new_users_weekly,
        "total_messages": total_messages,
        "new_messages_last_7_days": new_messages,
        "active_users_last_7_days": active_users,
        "average_messages_per_user": avg_messages_per_user  # Rounded average
    }

# Function to read CSV and return DataFrame without the 'timestamp' column
def read_csv_exclude_timestamp(file_path):
    df = pd.read_csv(file_path)
    if 'timestamp' in df.columns:
        df = df.drop(columns=['timestamp'])
    return df
