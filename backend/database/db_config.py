import os
from pymongo import MongoClient
from pymongo.database import Database

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "campus_ai_chatbot")

_client: MongoClient = None
_db: Database = None

def get_db() -> Database:
    global _client, _db
    if _db is None:
        # Log a safe version of the URI for debugging (hides password)
        safe_uri = MONGO_URI.split("@")[-1] if "@" in MONGO_URI else MONGO_URI
        print(f"[DB] Connecting to: ...@{safe_uri}")
        
        # Add a 5 second timeout so it doesn't hang in production
        _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        _db = _client[DB_NAME]
    return _db

def get_collection(name: str):
    return get_db()[name]
