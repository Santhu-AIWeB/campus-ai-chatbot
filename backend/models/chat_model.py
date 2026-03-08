from datetime import datetime
from database.db_config import get_collection

def get_chat_collection():
    return get_collection("chat_history")

def save_message(sender: str, text: str):
    """Save a chat message to the history."""
    msg = {
        'sender': sender, # 'user' or 'bot'
        'text': text,
        'timestamp': datetime.utcnow()
    }
    get_chat_collection().insert_one(msg)

def get_all_history():
    """Retrieve the full chat history."""
    docs = get_chat_collection().find().sort('timestamp', 1)
    history = []
    for d in docs:
        history.append({
            'sender': d.get('sender'),
            'text': d.get('text'),
            'timestamp': d.get('timestamp').isoformat() if d.get('timestamp') else None
        })
    return history
