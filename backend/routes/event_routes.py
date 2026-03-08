from flask import Blueprint, request, jsonify
from models.event_model import create_event, get_all_events, delete_event, update_event
from models.notification_model import create_notification


event_bp = Blueprint('events', __name__)

@event_bp.route('/<event_id>', methods=['PUT'])
def edit_event(event_id):
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
def add_event():
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
def remove_event(event_id):
    if delete_event(event_id):
        return jsonify({'message': 'Deleted'}), 200
    return jsonify({'error': 'Event not found'}), 404
