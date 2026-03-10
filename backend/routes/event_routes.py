from flask import Blueprint, request, jsonify
from models.event_model import create_event, get_all_events, delete_event, update_event
from models.notification_model import create_notification
from utils.auth import token_required


event_bp = Blueprint('events', __name__)

@event_bp.route('/<event_id>', methods=['PUT'])
@token_required
def edit_event(current_user, event_id):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    res = update_event(event_id, data)
    if res:
        return jsonify(res), 200
    return jsonify({'error': 'Event not found'}), 404

@event_bp.route('/', methods=['GET'])
def list_events():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    return jsonify(get_all_events(page, limit))

@event_bp.route('/', methods=['POST'])
@token_required
def add_event(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
    event = create_event(data)
    
    # Trigger Notification
    create_notification(
        type='event',
        title='New Event Posted!',
        message=f"{data.get('title')} is coming up! Check the Events page for details.",
        semester=data.get('semester', 'All'),
        link='/events'
    )
    
    return jsonify(event), 201

@event_bp.route('/<event_id>', methods=['DELETE'])
@token_required
def remove_event(current_user, event_id):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    if delete_event(event_id):
        return jsonify({'message': 'Deleted'}), 200
    return jsonify({'error': 'Event not found'}), 404
