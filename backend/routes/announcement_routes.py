from flask import Blueprint, request, jsonify
from models.announcement_model import (
    create_announcement, get_all_announcements, delete_announcement, update_announcement
)
from models.notification_model import create_notification
from utils.auth import token_required

announcement_bp = Blueprint('announcements', __name__)

@announcement_bp.route('/<ann_id>', methods=['PUT'])
@token_required
def edit_announcement(current_user, ann_id):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    res = update_announcement(ann_id, data)
    if res:
        return jsonify(res), 200
    return jsonify({'error': 'Announcement not found'}), 404

@announcement_bp.route('/', methods=['GET'])
def list_announcements():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    return jsonify(get_all_announcements(page, limit))

@announcement_bp.route('/', methods=['POST'])
@token_required
def add_announcement(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
    ann = create_announcement(data)
    
    # Trigger Notification
    create_notification(
        type='announcement',
        title='New Announcement!',
        message=f"{data.get('title')}: Check the announcements page for more details.",
        semester=data.get('semester', 'All'),
        link='/announcements'
    )
    
    return jsonify(ann), 201

@announcement_bp.route('/<ann_id>', methods=['DELETE'])
@token_required
def remove_announcement(current_user, ann_id):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    if delete_announcement(ann_id):
        return jsonify({'message': 'Deleted'}), 200
    return jsonify({'error': 'Announcement not found'}), 404
