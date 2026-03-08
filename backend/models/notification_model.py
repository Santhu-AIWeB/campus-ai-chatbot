from database.db_config import get_collection
import datetime
from bson import ObjectId

def get_notifications():
    return get_collection('notifications')

def create_notification(type: str, title: str, message: str, semester: str = 'All', link: str = None) -> dict:
    col = get_notifications()
    notification = {
        'type': type, # 'event', 'material', 'placement', 'announcement'
        'title': title,
        'message': message,
        'semester': semester,
        'link': link,
        'read_by': [], # List of user emails who have read this
        'created_at': datetime.datetime.utcnow()
    }
    result = col.insert_one(notification)
    notification['_id'] = str(result.inserted_id)
    return notification

def get_latest_notifications(semester: str = 'All', current_user_email: str = None, limit: int = 10) -> list:
    query = {'$or': [{'semester': 'All'}, {'semester': semester}]}
    notifications = get_notifications().find(query).sort('created_at', -1).limit(limit)
    return [notification_to_dict(n, current_user_email) for n in notifications]

def mark_notification_as_read(notification_id: str, user_email: str):
    col = get_notifications()
    col.update_one(
        {'_id': ObjectId(notification_id)},
        {'$addToSet': {'read_by': user_email}}
    )

def notification_to_dict(n: dict, current_user_email: str = None) -> dict:
    # Fallback links for older notifications or if link is missing
    link = n.get('link')
    if not link:
        type_to_link = {
            'event': '/events',
            'material': '/materials',
            'placement': '/placements',
            'announcement': '/announcements'
        }
        link = type_to_link.get(n.get('type'), '/')

    return {
        'id': str(n['_id']),
        'type': n.get('type', 'general'),
        'title': n.get('title', ''),
        'message': n.get('message', ''),
        'semester': n.get('semester', 'All'),
        'link': link,
        'is_read': current_user_email in n.get('read_by', []) if current_user_email else False,
        'created_at': n.get('created_at').isoformat() if n.get('created_at') else None
    }
