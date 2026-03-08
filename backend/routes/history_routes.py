from flask import Blueprint, request, jsonify
from models.history_model import get_user_history

history_bp = Blueprint('history', __name__)

@history_bp.route('/user/<email>', methods=['GET'])
def get_student_history(email):
    # In a real app, we'd verify the authenticated user matches the email
    # For now, we fetch by email provided in the route
    try:
        history = get_user_history(email)
        return jsonify(history), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

from utils.auth import token_required

@history_bp.route('/my-history', methods=['GET'])
@token_required
def get_my_history(current_user):
    try:
        email = current_user.get('email')
        if not email:
            return jsonify({'error': 'Email not found in token'}), 400
        history = get_user_history(email)
        return jsonify(history), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


