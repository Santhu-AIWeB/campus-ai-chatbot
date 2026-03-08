from database.db_config import get_collection
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId

def get_users():
    return get_collection('users')

def create_user(name: str, email: str, password: str, semester: str = '', role: str = 'student') -> dict:
    col = get_users()
    user = {
        'name': name,
        'email': email,
        'password_hash': generate_password_hash(password),
        'role': role,
        'semester': semester,
    }
    result = col.insert_one(user)
    user['_id'] = str(result.inserted_id)
    return user

def find_user_by_email(email: str) -> dict | None:
    user = get_users().find_one({'email': email})
    return user

def check_user_password(user: dict, password: str) -> bool:
    return check_password_hash(user.get('password_hash', ''), password)

def user_to_dict(user: dict) -> dict:
    return {
        'id': str(user['_id']),
        'name': user['name'],
        'email': user['email'],
        'role': user['role'],
        'semester': user.get('semester', ''),
    }
