import requests
import csv
import os
import time
from dotenv import dotenv_values
from api_functions import *

config = dotenv_values(".env")
bot_token = config["bot_token"]
updates_url = f"https://api.telegram.org/bot{bot_token}/getUpdates"
csv_file_path = 'telegram_updates.csv'
user_details_csv_path = 'user_details.csv'

# Function to get updates from Telegram API
def get_updates(url, offset):
    response = requests.get(url, params={'offset': offset})
    if response.status_code == 200:
        return response.json()['result']
    return []

def user_id_exists(user_id, file_path):
    try:
        with open(file_path, mode='r', newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                if str(user_id) == row.get('id'):
                    return True
        return False
    except FileNotFoundError:
        return False

def fetch_user_info_from_telegram(user_id):
    url = f"https://api.telegram.org/bot{bot_token}/getChat"
    payload = {'chat_id': user_id}
    response = requests.post(url, data=payload)
    if response.status_code == 200:
        return response.json()  # Returns the JSON response containing user info
    else:
        return None

def save_user_details_to_csv(user_details, file_path):
    file_exists = os.path.isfile(file_path)
    with open(file_path, mode='a', newline='', encoding='utf-8') as file:
        fieldnames = ['id', 'first_name', 'username', 'type', 'photo', 'accent_color_id']
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()
        if user_details and user_details.get('ok'):
            user_info = user_details['result']
            writer.writerow({
                'id': user_info['id'],
                'first_name': user_info.get('first_name', ''),
                'username': user_info.get('username', ''),
                'type': user_info.get('type', ''),
                'photo': user_info.get('photo', {}).get('small_file_id', ''),
                'accent_color_id': user_info.get('accent_color_id', '')
            })

# Function to save updates to a CSV file
def save_updates_to_csv(updates, file_path):
    file_exists = os.path.isfile(file_path)
    with open(file_path, mode='a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        if not file_exists:
            writer.writerow(['update_id', 'message_id', 'user_id', 'is_bot', 'first_name', 'username', 'language_code', 'chat_type', 'message_date', 'text'])
        for update in updates:
            message = update.get('message', {})
            user = message.get('from', {})
            chat = message.get('chat', {})
            user_id = user.get('id', '')
            # Check if user_id exists in user_details.csv
            if not user_id_exists(user_id, user_details_csv_path):
                user_details = fetch_user_info_from_telegram(str(user_id))
                save_user_details_to_csv(user_details, user_details_csv_path)
            row = [
                update['update_id'],
                message.get('message_id', ''),
                user_id,
                user.get('is_bot', ''),
                user.get('first_name', ''),
                user.get('username', ''),
                user.get('language_code', ''),
                chat.get('type', ''),
                message.get('date', ''),
                message.get('text', '')
            ]
            writer.writerow(row)

# Main function to poll for updates and save new updates to CSV
def main():
    last_update_id = 0  # Keep track of the last update ID processed
    while True:
        updates = get_updates(updates_url, last_update_id + 1)
        if updates:
            new_update_ids = [update['update_id'] for update in updates]
            last_update_id = max(new_update_ids)
            save_updates_to_csv(updates, csv_file_path)
            process_chat_updates(updates)
            print(".")
        time.sleep(10)  # Adjust sleep as needed

if __name__ == "__main__":
    main()
