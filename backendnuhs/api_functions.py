import requests
from typing import List, Dict
import csv
import json
from pydantic import BaseModel
from dotenv import dotenv_values
import pandas as pd
from datetime import datetime, timedelta

config = dotenv_values(".env")
bot_token=config["bot_token"]
#'6776393031:AAGPyOaFqSvBvaTv2piShMG5M69uQNytu_I'
class Message(BaseModel):
    chat_id: str
    message_thread_id: str
    text: str

CSV_FILE_PATH = 'sent_messages.csv'
CSV_FILE_PATH_UPDATES = 'telegram_updates.csv'

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
