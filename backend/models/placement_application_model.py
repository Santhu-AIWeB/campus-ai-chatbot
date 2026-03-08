from database.db_config import get_collection
from bson import ObjectId
import datetime

def get_placement_applications():
    return get_collection('placement_applications')

def application_to_dict(a: dict) -> dict:
    return {
        'id': str(a['_id']),
        'placement_id': a.get('placement_id', ''),
        'student_name': a.get('student_name', ''),
        'student_email': a.get('student_email', ''),
        'status': a.get('status', 'Applied'),
        'applied_at': a.get('applied_at').isoformat() if a.get('applied_at') else None
    }

def create_application(data: dict) -> dict:
    # Check if already applied
    existing = get_placement_applications().find_one({
        'placement_id': data.get('placement_id'),
        'student_email': data.get('student_email')
    })
    if existing:
        return None
        
    data['applied_at'] = datetime.datetime.utcnow()
    result = get_placement_applications().insert_one(data)
    data['_id'] = result.inserted_id
    return application_to_dict(data)

def fetch_applications_by_placement(p_id: str) -> list:
    return [application_to_dict(a) for a in get_placement_applications().find({'placement_id': p_id})]

def fetch_all_applications() -> list:
    return [application_to_dict(a) for a in get_placement_applications().find().sort('applied_at', -1)]

def update_application_status(app_id: str, status: str) -> bool:
    result = get_placement_applications().update_one(
        {'_id': ObjectId(app_id)},
        {'$set': {'status': status}}
    )
    return result.modified_count > 0
