import os
from pymongo import MongoClient
from pymongo.database import Database

_client: MongoClient = None
_db: Database = None

def get_db() -> Database:
    global _client, _db
    if _db is None:
        # Fetch env vars inside the function so they are ready after load_dotenv()
        uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        db_name = os.getenv("DB_NAME", "campus_ai_chatbot")

        # Create a safe version for logging (hides password)
        safe_uri = uri.split("@")[-1] if "@" in uri else uri
        print(f"[DB] Initializing connection to: ...@{safe_uri}")

        if "cluster.mongodb.net" in uri:
            print("[DB] WARNING: Still using a placeholder 'cluster.mongodb.net' URI!")

        # Add a 5 second timeout so it doesn't hang in production
        _client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        _db = _client[db_name]
    return _db

def get_collection(name: str):
    return get_db()[name]
