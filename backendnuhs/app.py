from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from api_functions import *
from typing import List, Dict
import requests
from datetime import datetime, timedelta
import os 
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

# Update the utility function to convert NaN values to None, making it JSON serializable
def read_csv(file_name):
    # Use keep_default_na=False to prevent pandas from interpreting certain strings as NaN
    df = pd.read_csv(file_name, keep_default_na=False)
    # Convert NaN values to None, which is supported by JSON
    df = df.where(pd.notnull(df), None)
    return df

from dotenv import dotenv_values

config = dotenv_values(".env")
bot_token=config["bot_token"]

CSV_FILE_PATH = 'telegram_updates.csv'
USER_DETAILS_FILE_PATH = 'user_details.csv'
SENT_MESSAGES_FILE_PATH = 'sent_messages.csv'

last_served_update_id = 0

class Message(BaseModel):
    chat_id: str
    message_thread_id: str
    text: str

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/get_user_info/{user_id}")
def get_user_info(user_id: str):
    # Fetch user info from Telegram
    user_info = get_user_details_by_id(user_id, USER_DETAILS_FILE_PATH)

    # Return the user info
    return user_info

@app.get("/get_updates", response_model=List[Dict])
async def get_updates():
    global last_served_update_id
    new_updates = read_new_updates(CSV_FILE_PATH, last_served_update_id)
    if new_updates:
        last_served_update_id = max(int(update['update_id']) for update in new_updates)
    return new_updates

@app.post("/send_message")
async def send_message(message: Message):
    send_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": message.chat_id,
        "text": message.text
    }
    response = requests.post(send_url, data=payload)
    if response.status_code == 200:
        save_message_to_csv(message)
        return {"message": "Message sent successfully"}
    else:
        raise HTTPException(status_code=response.status_code, detail="Failed to send message")

# Endpoint to send all user details
@app.get("/users/all_user_details")
async def get_user_details():
    user_details = read_csv(USER_DETAILS_FILE_PATH)
    return user_details.to_dict(orient="records")

# Endpoint to send all the updates from telegram
@app.get("/telegram/all_incoming_updates")
async def get_telegram_updates():
    telegram_updates = read_csv(CSV_FILE_PATH)
    return telegram_updates.to_dict(orient="records")

# Endpoint to send all the sent messages to telegram
@app.get("/telegram/all_sent_updates")
async def get_telegram_updates():
    telegram_updates = read_csv(SENT_MESSAGES_FILE_PATH)
    return telegram_updates.to_dict(orient="records")

# Endpoint to send total number of unique users
@app.get("/users/total_user_count")
async def get_unique_user_count():
    user_details = read_csv(USER_DETAILS_FILE_PATH)
    unique_user_count = user_details["id"].nunique()
    return {"unique_user_count": unique_user_count}

# Endpoint to send the total number of messages received in the last seven days
@app.get("/messages/recent/last_seven_days_message_count")
async def get_recent_messages_count():
    telegram_updates = read_csv(CSV_FILE_PATH)
    # Assuming there's a 'date' column in yyyy-mm-dd format
    telegram_updates['message_date'] = pd.to_datetime(telegram_updates['message_date'], unit='s')
    recent_cutoff = datetime.now() - timedelta(days=7)
    recent_messages = telegram_updates[telegram_updates['message_date'] > recent_cutoff]
    return {"recent_messages_count": len(recent_messages)}

@app.get("/generate/topics")
def get_topics():
    recent_messages = get_recent_messages()
    texts = recent_messages['text'].tolist()
    topics = generate_topics(texts)
    return {"topics": topics}

@app.get("/generate/faqs")
def get_faqs():
    recent_messages = get_recent_messages()
    texts = recent_messages['text'].tolist()
    faqs = generate_faqs(texts)
    return {"faqs": faqs}

@app.get("/merge_messages")
async def merge_messages():
    # Read the telegram updates, drop duplicates
    telegram_updates = pd.read_csv(CSV_FILE_PATH).drop_duplicates(subset=['update_id'])
    # Add a flag column for incoming messages
    telegram_updates['direction'] = 'INCOMING'
    
    # Read the sent messages
    sent_messages = pd.read_csv(SENT_MESSAGES_FILE_PATH)
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
    
    # Convert to JSON
    merged_data = merged_df.to_dict(orient='records')
    return JSONResponse(content=merged_data)
