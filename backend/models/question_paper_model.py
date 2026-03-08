from database.db_config import get_collection
from bson import ObjectId
import datetime

def get_question_papers_collection():
    return get_collection('question_papers')

def qp_to_dict(qp: dict) -> dict:
    return {
        'id': str(qp['_id']),
        'title': qp.get('title', ''),
        'subject': qp.get('subject', ''),
        'semester': qp.get('semester', ''),
        'fileUrl': qp.get('file_url', ''),
        'uploaded_at': qp.get('uploaded_at', '')
    }

def create_question_paper(data: dict) -> dict:
    data['uploaded_at'] = datetime.datetime.utcnow()
    result = get_question_papers_collection().insert_one(data)
    data['_id'] = result.inserted_id
    return qp_to_dict(data)

def get_all_question_papers(page=1, limit=10, semester=None) -> dict:
    query = {}
    if semester:
        query['semester'] = {'$in': [semester, f"Semester {semester}"]}
        
    total = get_question_papers_collection().count_documents(query)
    cursor = get_question_papers_collection().find(query).sort('uploaded_at', -1).skip((page - 1) * limit).limit(limit)
    items = [qp_to_dict(qp) for qp in cursor]
    return {
        'items': items,
        'total': total,
        'page': page,
        'limit': limit,
        'pages': (total + limit - 1) // limit
    }

def delete_question_paper(qp_id: str) -> bool:
    result = get_question_papers_collection().delete_one({'_id': ObjectId(qp_id)})
    return result.deleted_count > 0

def update_question_paper(qp_id: str, data: dict) -> dict:
    if 'id' in data: del data['id']
    if '_id' in data: del data['_id']
    get_question_papers_collection().update_one({'_id': ObjectId(qp_id)}, {'$set': data})
    updated = get_question_papers_collection().find_one({'_id': ObjectId(qp_id)})
    return qp_to_dict(updated) if updated else None
