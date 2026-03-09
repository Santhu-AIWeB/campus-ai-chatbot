import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables
load_dotenv()

MONGO_URI = os.environ.get('MONGO_URI')
DB_NAME = os.environ.get('DB_NAME', 'campus_ai_chatbot')
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
materials_col = db['materials']
users_col = db['users']

with open('debug_output.txt', 'w') as f:
    f.write("--- ALL MATERIALS ---\n")
    materials = list(materials_col.find())
    for m in materials:
        f.write(f"ID: {m['_id']}, Title: {m.get('title')}, Semester: '{m.get('semester')}', Status: '{m.get('status')}', Type: '{m.get('type')}'\n")

    f.write(f"\nTotal materials: {len(materials)}\n")

    f.write("\n--- RECENT USERS ---\n")
    users = list(users_col.find().sort('_id', -1).limit(20))
    for u in users:
        f.write(f"ID: {u['_id']}, Email: {u.get('email')}, Semester: '{u.get('semester')}', Role: '{u.get('role')}'\n")

print("Debug output updated in debug_output.txt")
client.close()
