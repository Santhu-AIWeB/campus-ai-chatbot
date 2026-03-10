from flask import Blueprint, request, jsonify
from models.user_model import (
    find_user_by_email, create_user, check_user_password, user_to_dict
)
from utils.auth import token_required
import jwt, datetime, os

auth_bp = Blueprint('auth', __name__)
SECRET = os.environ.get('JWT_SECRET', 'campus-secret-key')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '')
    password = data.get('password', '')
    print(f"[LOGIN] Attempt: email='{email}'")

    user = find_user_by_email(email)
    if not user:
        print(f"[LOGIN] FAIL — no user found with email '{email}'")
        return jsonify({'error': 'Invalid credentials'}), 401

    pwd_ok = check_user_password(user, password)
    print(f"[LOGIN] User found: role={user.get('role')}, password_ok={pwd_ok}")
    if not pwd_ok:
        print(f"[LOGIN] FAIL — wrong password")
        return jsonify({'error': 'Invalid credentials'}), 401

    token = jwt.encode({
        'sub': str(user['_id']),
        'name': user.get('name', ''),
        'email': user.get('email', ''),
        'role': user['role'],
        'semester': user.get('semester', ''),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, SECRET, algorithm='HS256')
    print(f"[LOGIN] SUCCESS — token issued for {email}")
    return jsonify({'token': token, 'role': user['role']})


@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        print(f"[REGISTER] Attempt: email='{data.get('email')}', role='{data.get('role')}'")
        
        email = data.get('email', '')
        if find_user_by_email(email):
            print(f"[REGISTER] FAIL — email already exists")
            return jsonify({'error': 'Email already exists'}), 409
            
        role = data.get('role', 'student')
        if role == 'admin':
            admin_key = data.get('adminKey')
            secret_key = os.environ.get('ADMIN_REG_KEY', 'IARE_ADMIN_2026')
            if admin_key != secret_key:
                print(f"[REGISTER] FAIL — invalid admin key")
                return jsonify({'error': 'Invalid Admin Registration Key'}), 403

        user = create_user(
            name=data.get('name', ''),
            email=email,
            password=data.get('password', ''),
            semester=data.get('semester', ''),
            role=role
        )
        print(f"[REGISTER] SUCCESS — created user id={user['_id']}")
        return jsonify({'message': 'User created', 'id': user['_id']}), 201
    except Exception as e:
        print(f"[REGISTER] CRASH: {str(e)}")
        return jsonify({'error': f'Internal Server Error: {str(e)}'}), 500

@auth_bp.route('/users', methods=['GET'])
@token_required
def get_all_users(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    from models.user_model import get_users, user_to_dict
    users = list(get_users().find())
    return jsonify([user_to_dict(u) for u in users])

@auth_bp.route('/users/promote', methods=['POST'])
@token_required
def promote_user(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    user_id = data.get('userId')
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
        
    from models.user_model import get_users
    from bson import ObjectId
    result = get_users().update_one({'_id': ObjectId(user_id)}, {'$set': {'role': 'admin'}})
    
    if result.modified_count > 0:
        return jsonify({'message': 'User promoted to admin successfully'})
    return jsonify({'error': 'User not found or already admin'}), 404
