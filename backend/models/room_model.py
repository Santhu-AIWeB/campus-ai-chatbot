from database.db_config import get_collection
from bson import ObjectId
import datetime

def get_rooms_collection():
    return get_collection('study_rooms')

def room_to_dict(r: dict) -> dict:
    return {
        'id': str(r['_id']),
        'name': r.get('name', ''),
        'description': r.get('description', ''),
        'topic': r.get('topic', 'General'),
        'participants': r.get('participants', 0), # This can be updated via sockets
        'created_by': r.get('created_by', ''),
        'created_at': r.get('created_at', '').isoformat() if isinstance(r.get('created_at'), datetime.datetime) else r.get('created_at', '')
    }

def create_room(data: dict) -> dict:
    data['created_at'] = datetime.datetime.utcnow()
    data['participants'] = 0
    result = get_rooms_collection().insert_one(data)
    data['_id'] = result.inserted_id
    return room_to_dict(data)

def get_all_rooms() -> list:
    cursor = get_rooms_collection().find().sort('created_at', -1)
    return [room_to_dict(r) for r in cursor]

def delete_room(room_id: str) -> bool:
    result = get_rooms_collection().delete_one({'_id': ObjectId(room_id)})
    return result.deleted_count > 0

def update_participant_count(room_id: str, delta: int):
    # This can be called from socket handlers
    get_rooms_collection().update_one(
        {'_id': ObjectId(room_id)},
        {'$inc': {'participants': delta}}
    )
