from database.db_config import get_collection
from bson import ObjectId
import datetime

def get_events():
    return get_collection('events')

def event_to_dict(event: dict) -> dict:
    return {
        'id': str(event['_id']),
        'title': event.get('title', ''),
        'description': event.get('description', ''),
        'date': event.get('date', ''),
        'location': event.get('location', ''),
        'image': event.get('image', ''),
        'semester': event.get('semester', 'All'),
    }

def create_event(data: dict) -> dict:
    data['created_at'] = datetime.datetime.utcnow()
    result = get_events().insert_one(data)
    data['_id'] = result.inserted_id
    return event_to_dict(data)

def get_all_events(page=1, limit=10) -> dict:
    total = get_events().count_documents({})
    cursor = get_events().find().sort('created_at', -1).skip((page - 1) * limit).limit(limit)
    items = [event_to_dict(e) for e in cursor]
    return {
        'items': items,
        'total': total,
        'page': page,
        'limit': limit,
        'pages': (total + limit - 1) // limit
    }

def delete_event(event_id: str) -> bool:
    result = get_events().delete_one({'_id': ObjectId(event_id)})
    return result.deleted_count > 0

def update_event(event_id: str, data: dict) -> dict:
    if 'id' in data: del data['id']
    if '_id' in data: del data['_id']
    get_events().update_one({'_id': ObjectId(event_id)}, {'$set': data})
    updated = get_events().find_one({'_id': ObjectId(event_id)})
    return event_to_dict(updated) if updated else None
