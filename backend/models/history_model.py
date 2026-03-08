from database.db_config import get_collection
from bson import ObjectId
import datetime

def get_history():
    return get_collection('history')

def history_to_dict(h: dict) -> dict:
    return {
        'id': str(h['_id']),
        'user_email': h.get('user_email', ''),
        'event_id': h.get('event_id', ''),
        'event_title': h.get('event_title', 'Unknown Event'),
        'event_date': h.get('event_date', ''),
        'type': h.get('type', 'registration'), # registration, attendance, etc.
        'timestamp': h.get('timestamp', h.get('created_at', '')),
        'status': h.get('status', 'confirmed'),
        'registration_id': h.get('registration_id', '')
    }

def create_history_entry(data: dict) -> dict:
    data['created_at'] = datetime.datetime.utcnow()
    # Simple default timestamp if not provided
    if 'timestamp' not in data:
        data['timestamp'] = data['created_at'].strftime("%Y-%m-%d %H:%M:%S")
    
    result = get_history().insert_one(data)
    data['_id'] = result.inserted_id
    return history_to_dict(data)

def get_user_history(email: str, limit: int = 50) -> list:
    cursor = get_history().find({'user_email': email}).sort('created_at', -1).limit(limit)
    return [history_to_dict(h) for h in cursor]

def get_all_history(limit: int = 100) -> list:
    cursor = get_history().find().sort('created_at', -1).limit(limit)
    return [history_to_dict(h) for h in cursor]
