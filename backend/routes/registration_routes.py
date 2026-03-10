from flask import Blueprint, request, jsonify
from models.registration_model import (
    create_registration, 
    get_registrations_by_event, 
    check_existing_registration, 
    get_all_registrations,
    delete_registration,
    update_registration,
    get_registrations
)
from models.history_model import create_history_entry
from utils.auth import token_required

registration_bp = Blueprint('registrations', __name__)

@registration_bp.route('/', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('name') or not data.get('email') or not data.get('event_id'):
        return jsonify({'error': 'name, email and event_id are required'}), 400

    # Prevent duplicate registration
    if check_existing_registration(data['email'], data['event_id']):
        return jsonify({'error': 'You are already registered for this event'}), 409

    # Semester-based restriction check
    from models.event_model import get_events
    from bson import ObjectId
    
    event = get_events().find_one({'_id': ObjectId(data['event_id'])})
    if event and event.get('semester') and event.get('semester') != 'All':
        target_semester = event.get('semester')
        # If student semester is provided (from authenticated user), validate it
        student_semester = data.get('semester')
        if student_semester and student_semester != target_semester:
            return jsonify({'error': f'This event is restricted to Semester {target_semester} students.'}), 403

    reg = create_registration(data)
    
    # Log to history
    try:
        if event:
            create_history_entry({
                'user_email': data['email'],
                'event_id': data['event_id'],
                'registration_id': reg['id'],
                'event_title': event.get('title', 'Unknown Event'),
                'event_date': event.get('date', ''),
                'type': 'registration',
                'status': 'confirmed'
            })
    except Exception as e:
        print(f"Error logging history: {e}")

    return jsonify(reg), 201

@registration_bp.route('/', methods=['GET'])
@token_required
def list_all_registrations(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    return jsonify(get_all_registrations())

@registration_bp.route('/event/<event_id>', methods=['GET'])
def list_registrations(event_id):
    return jsonify(get_registrations_by_event(event_id))

@registration_bp.route('/<reg_id>', methods=['DELETE'])
@token_required
def remove_registration(current_user, reg_id):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    if delete_registration(reg_id):
        return jsonify({'message': 'Registration deleted successfully'}), 200
    return jsonify({'error': 'Registration not found'}), 404

@registration_bp.route('/<reg_id>/attend', methods=['PUT'])
@token_required
def mark_attendance(current_user, reg_id):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Get registration to find student email and event info
    from bson import ObjectId
    reg = get_registrations().find_one({'_id': ObjectId(reg_id)})
    if not reg:
        return jsonify({'error': 'Registration not found'}), 404

    if update_registration(reg_id, {'attended': True}):
        # Log to history for the student
        try:
            from models.event_model import get_events
            event = get_events().find_one({'_id': ObjectId(reg.get('event_id'))})
            
            create_history_entry({
                'user_email': reg.get('email'),
                'event_id': reg.get('event_id'),
                'registration_id': reg_id,
                'event_title': event.get('title', 'Unknown Event') if event else 'Unknown Event',
                'event_date': event.get('date', '') if event else '',
                'type': 'attendance',
                'status': 'attended'
            })
        except Exception as e:
            print(f"Error logging attendance history: {e}")

        return jsonify({'message': 'Attendance marked successfully', 'id': reg_id}), 200
    return jsonify({'error': 'Registration not found'}), 404
