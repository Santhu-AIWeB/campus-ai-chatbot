import jwt
import os
from functools import wraps
from flask import request, jsonify

SECRET = os.environ.get('JWT_SECRET', 'campus-secret-key')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, SECRET, algorithms=['HS256'])
            # We return the whole data dict (contains sub, email, role, etc)
            current_user = data
        except Exception as e:
            return jsonify({'error': f'Token is invalid: {str(e)}'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated
