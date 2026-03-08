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
        _client = MongoClient(MONGO_URI)
        _db = _client[DB_NAME]
    return _db

def get_collection(name: str):
    return get_db()[name]
