from database.db_config import get_collection
from bson import ObjectId
import datetime

def get_registrations():
    return get_collection('registrations')

def registration_to_dict(r: dict) -> dict:
    return {
        'id': str(r['_id']),
        'name': r.get('name', ''),
        'email': r.get('email', ''),
        'event_id': r.get('event_id', ''),
        'event_title': r.get('event_title', ''),
        'attended': r.get('attended', False)
    }

def create_registration(data: dict) -> dict:
    data['registered_at'] = datetime.datetime.utcnow()
    result = get_registrations().insert_one(data)
    data['_id'] = result.inserted_id
    return registration_to_dict(data)

def get_registrations_by_event(event_id: str) -> list:
    return [registration_to_dict(r) for r in get_registrations().find({'event_id': event_id})]

def get_all_registrations() -> list:
    return [registration_to_dict(r) for r in get_registrations().find()]

def check_existing_registration(email: str, event_id: str) -> bool:
    return get_registrations().find_one({'email': email, 'event_id': event_id}) is not None

def delete_registration(reg_id: str) -> bool:
    result = get_registrations().delete_one({'_id': ObjectId(reg_id)})
    return result.deleted_count > 0

def update_registration(reg_id: str, update_data: dict) -> bool:
    result = get_registrations().update_one(
        {'_id': ObjectId(reg_id)},
        {'$set': update_data}
    )
    return result.matched_count > 0
