from database.db_config import get_collection
from bson import ObjectId
import datetime

def get_placements():
    return get_collection('placements')

def placement_to_dict(p: dict) -> dict:
    return {
        'id': str(p['_id']),
        'company': p.get('company', ''),
        'role': p.get('role', ''),
        'eligibility': p.get('eligibility', ''),
        'package': p.get('package', ''),
        'location': p.get('location', ''),
        'deadline': p.get('deadline', ''),
        'description': p.get('description', ''),
        'job_link': p.get('job_link', ''),
        'semester': p.get('semester', 'All'),
        'created_at': p.get('created_at').isoformat() if p.get('created_at') else None
    }


def create_placement(data: dict) -> dict:
    data['created_at'] = datetime.datetime.utcnow()
    result = get_placements().insert_one(data)
    data['_id'] = result.inserted_id
    return placement_to_dict(data)

def fetch_all_placements(page=1, limit=10) -> dict:
    total = get_placements().count_documents({})
    cursor = get_placements().find().sort('created_at', -1).skip((page - 1) * limit).limit(limit)
    items = [placement_to_dict(p) for p in cursor]
    return {
        'items': items,
        'total': total,
        'page': page,
        'limit': limit,
        'pages': (total + limit - 1) // limit
    }

def delete_placement(p_id: str) -> bool:
    result = get_placements().delete_one({'_id': ObjectId(p_id)})
    return result.deleted_count > 0

def update_placement(p_id: str, data: dict) -> dict:
    if 'id' in data: del data['id']
    if '_id' in data: del data['_id']
    get_placements().update_one({'_id': ObjectId(p_id)}, {'$set': data})
    updated = get_placements().find_one({'_id': ObjectId(p_id)})
    return placement_to_dict(updated) if updated else None
