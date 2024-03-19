from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from api_functions import *
from typing import List, Dict
import requests
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi import FastAPI, BackgroundTasks
import asyncio
import pandas as pd


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
    # Remove duplicate rows based on the 'update_id' column, keeping the last occurrence
    telegram_updates = telegram_updates.drop_duplicates(subset=['update_id'], keep='last')
    return telegram_updates.to_dict(orient="records")

# Endpoint to send all the sent messages to telegram
@app.get("/telegram/all_sent_updates")
async def all_sent_updates():
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
    
    merged_df = all_incoming_outgoing_messages()
    
    # Convert to JSON
    merged_data = merged_df.to_dict(orient='records')
    return JSONResponse(content=merged_data)

@app.get("/new_merge_messages")
async def new_merge_messages():
    
    merged_df = all_new_incoming_outgoing_messages()
    
    # Convert to JSON
    # merged_data = merged_df.to_dict(orient='records')
    return JSONResponse(content=merged_df)

@app.get("/stats")
async def get_stats():
    return get_statistic()

@app.get("/faqs", response_model=List[Dict])
async def get_faqs():
    faq_df = read_csv_exclude_timestamp(FAQ_FILE_PATH)
    faqs = faq_df.to_dict(orient='records')
    return faqs

@app.get("/categories", response_model=List[Dict])
async def get_categories():
    categories_df = read_csv_exclude_timestamp(CATEGORIES_FILE_PATH)
    categories = categories_df.to_dict(orient='records')
    return categories

# # app = FastAPI()

# # Store registered webhook URLs
# registered_webhooks: List[str] = []

# last_known_row_count_sent_messages = 0  # Keep track of the last known row count for sent messages
# last_known_row_count_telegram_updates = 0  # Keep track for telegram updates

# @app.post("/register_webhook/")
# async def register_webhook(webhook_url: str):
#     if webhook_url not in registered_webhooks:
#         registered_webhooks.append(webhook_url)
#         return {"message": "Webhook registered successfully."}
#     return {"message": "Webhook already registered."}

# # def check_for_new_entries():
# #     global last_known_row_count
# #     try:
# #         df = pd.read_csv(CSV_FILE_PATH)
# #         if len(df) > last_known_row_count:
# #             new_entries = df.iloc[last_known_row_count:]
# #             last_known_row_count = len(df)  # Update the row count
# #             return new_entries.to_dict(orient="records")
# #         return []
# #     except FileNotFoundError:
# #         print("CSV file not found")
# #         return []

# def check_for_new_entries():
#     global last_known_row_count_sent_messages, last_known_row_count_telegram_updates
#     new_entries = []

#     # Check SENT_MESSAGES_FILE_PATH for new entries
#     try:
#         df_sent = pd.read_csv(SENT_MESSAGES_FILE_PATH)
#         if len(df_sent) > last_known_row_count_sent_messages:
#             new_sent_entries = df_sent.iloc[last_known_row_count_sent_messages:].copy()
#             new_sent_entries['direction'] = 'OUTGOING'  # Tag as OUTGOING
#             new_entries.extend(new_sent_entries.to_dict(orient="records"))
#             last_known_row_count_sent_messages = len(df_sent)
#     except FileNotFoundError:
#         print("Sent messages CSV file not found")

#     # Check CSV_FILE_PATH_UPDATES for new entries
#     try:
#         df_updates = pd.read_csv(CSV_FILE_PATH)
#         if len(df_updates) > last_known_row_count_telegram_updates:
#             new_update_entries = df_updates.iloc[last_known_row_count_telegram_updates:].copy()
#             new_update_entries['direction'] = 'INCOMING'  # Tag as INCOMING
#             new_entries.extend(new_update_entries.to_dict(orient="records"))
#             last_known_row_count_telegram_updates = len(df_updates)
#     except FileNotFoundError:
#         print("Telegram updates CSV file not found")

#     return new_entries

# async def notify_webhooks(new_data: dict):
#     for webhook_url in registered_webhooks:
#         try:
#             response = await asyncio.to_thread(requests.post, webhook_url, json=new_data)
#             print(f"Notification sent to {webhook_url}: {response.status_code}")
#         except Exception as e:
#             print(f"Error notifying {webhook_url}: {str(e)}")

# async def periodic_check():
#     while True:
#         new_entries = check_for_new_entries()
#         if new_entries:
#             for new_data in new_entries:
#                 await notify_webhooks(new_data)
#         await asyncio.sleep(10)  # Wait for 10 seconds before the next check

# @app.on_event("startup")
# async def startup_event():
#     asyncio.create_task(periodic_check())  # Start the periodic check on startup