from database.db_config import get_collection
from bson import ObjectId
import datetime

def get_materials():
    return get_collection('materials')

def material_to_dict(m: dict) -> dict:
    return {
        'id': str(m['_id']),
        'title': m.get('title', ''),
        'subject': m.get('subject', ''),
        'type': m.get('type', ''),
        'semester': m.get('semester', ''),
        'fileUrl': m.get('file_url', ''),
        'status': m.get('status', 'approved'),
        'contributor_name': m.get('contributor_name', 'Admin'),
        'contributor_email': m.get('contributor_email', ''),
    }

def create_material(data: dict) -> dict:
    data['uploaded_at'] = datetime.datetime.utcnow()
    result = get_materials().insert_one(data)
    data['_id'] = result.inserted_id
    return material_to_dict(data)

def get_all_materials(page=1, limit=10, semester=None, mat_type=None, exclude_type=None, status=None) -> dict:
    query = {}
    if semester:
        # Support both Roman numerals (new) and display strings (legacy/buggy)
        query['semester'] = {'$in': [semester, f"Semester {semester}"]}
    
    if mat_type:
        query['type'] = mat_type
    elif exclude_type:
        query['type'] = {'$ne': exclude_type}
    
    # Filter by status (default to approved)
    query['status'] = status if status else 'approved'
        
    total = get_materials().count_documents(query)
    cursor = get_materials().find(query).sort('uploaded_at', -1).skip((page - 1) * limit).limit(limit)
    items = [material_to_dict(m) for m in cursor]
    return {
        'items': items,
        'total': total,
        'page': page,
        'limit': limit,
        'pages': (total + limit - 1) // limit
    }

def delete_material(material_id: str) -> bool:
    result = get_materials().delete_one({'_id': ObjectId(material_id)})
    return result.deleted_count > 0

def update_material(material_id: str, data: dict) -> dict:
    if 'id' in data: del data['id']
    if '_id' in data: del data['_id']
    get_materials().update_one({'_id': ObjectId(material_id)}, {'$set': data})
    updated = get_materials().find_one({'_id': ObjectId(material_id)})
    return material_to_dict(updated) if updated else None
