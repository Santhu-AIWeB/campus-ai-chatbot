from database.db_config import get_collection
from bson import ObjectId
import datetime

def get_announcements():
    return get_collection('announcements')

def announcement_to_dict(a: dict) -> dict:
    created = a.get('created_at', datetime.datetime.utcnow())
    return {
        'id': str(a['_id']),
        'title': a.get('title', ''),
        'content': a.get('content', ''),
        'date': created.strftime('%Y-%m-%d') if isinstance(created, datetime.datetime) else '',
    }

def create_announcement(data: dict) -> dict:
    data['created_at'] = datetime.datetime.utcnow()
    result = get_announcements().insert_one(data)
    data['_id'] = result.inserted_id
    return announcement_to_dict(data)

def get_all_announcements(page=1, limit=10) -> dict:
    total = get_announcements().count_documents({})
    # Sort by creation time (descending)
    cursor = get_announcements().find().sort('created_at', -1).skip((page - 1) * limit).limit(limit)
    items = [announcement_to_dict(a) for a in cursor]
    return {
        'items': items,
        'total': total,
        'page': page,
        'limit': limit,
        'pages': (total + limit - 1) // limit
    }

def delete_announcement(ann_id: str) -> bool:
    result = get_announcements().delete_one({'_id': ObjectId(ann_id)})
    return result.deleted_count > 0

def update_announcement(ann_id: str, data: dict) -> dict:
    if 'id' in data: del data['id']
    if '_id' in data: del data['_id']
    get_announcements().update_one({'_id': ObjectId(ann_id)}, {'$set': data})
    updated = get_announcements().find_one({'_id': ObjectId(ann_id)})
    return announcement_to_dict(updated) if updated else None
