from flask import Blueprint, jsonify, request
from models.notification_model import get_latest_notifications
from utils.auth import token_required

notification_bp = Blueprint('notifications', __name__)

@notification_bp.route('/', methods=['GET'])
@token_required
def fetch_notifications(current_user):
    semester = current_user.get('semester', 'All')
    email = current_user.get('email')
    limit = request.args.get('limit', default=10, type=int)
    
    notifications = get_latest_notifications(semester, email, limit)
    return jsonify(notifications), 200

@notification_bp.route('/<id>/read', methods=['PUT'])
@token_required
def mark_read(current_user, id):
    from models.notification_model import mark_notification_as_read
    email = current_user.get('email')
    mark_notification_as_read(id, email)
    return jsonify({'message': 'Marked as read'}), 200
