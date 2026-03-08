from flask import Blueprint, request, jsonify
from models.user_model import (
    find_user_by_email, create_user, check_user_password, user_to_dict
)
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
            
        user = create_user(
            name=data.get('name', ''),
            email=email,
            password=data.get('password', ''),
            semester=data.get('semester', ''),
            role=data.get('role', 'student')
        )
        print(f"[REGISTER] SUCCESS — created user id={user['_id']}")
        return jsonify({'message': 'User created', 'id': user['_id']}), 201
    except Exception as e:
        print(f"[REGISTER] CRASH: {str(e)}")
        return jsonify({'error': f'Internal Server Error: {str(e)}'}), 500
