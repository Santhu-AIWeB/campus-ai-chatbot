from flask import Blueprint, request, jsonify
from models.placement_model import create_placement, fetch_all_placements, delete_placement, update_placement
from models.notification_model import create_notification

from models.placement_application_model import create_application, fetch_applications_by_placement, fetch_all_applications, update_application_status

placement_bp = Blueprint('placements', __name__)

@placement_bp.route('/<id>', methods=['PUT'])
def edit_placement(id):
    data = request.get_json()
    res = update_placement(id, data)
    if res:
        return jsonify(res), 200
    return jsonify({'error': 'Placement not found'}), 404

@placement_bp.route('/', methods=['GET'])
def get_placements():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    return jsonify(fetch_all_placements(page, limit))

@placement_bp.route('/', methods=['POST'])
def add_placement():
    data = request.get_json()
    if not data.get('company') or not data.get('role'):
        return jsonify({'error': 'Company and Role are required'}), 400
    res = create_placement(data)
    
    # Trigger Notification
    create_notification(
        type='placement',
        title='New Recruitment Drive!',
        message=f"{data.get('company')} is hiring for {data.get('role')}! Apply now.",
        semester=data.get('semester', 'All'),
        link='/placements'
    )
    
    return jsonify(res), 201

@placement_bp.route('/<id>', methods=['DELETE'])
def remove_placement(id):
    if delete_placement(id):
        return jsonify({'message': 'Placement deleted'})
    return jsonify({'error': 'Failed to delete'}), 404

@placement_bp.route('/apply', methods=['POST'])
def apply_placement():
    data = request.get_json()
    if not data.get('placement_id') or not data.get('student_email'):
        return jsonify({'error': 'Placement ID and Email are required'}), 400
    res = create_application(data)
    if not res:
        return jsonify({'error': 'You have already applied for this drive'}), 409
    return jsonify(res), 201

@placement_bp.route('/applications/<p_id>', methods=['GET'])
def get_apps(p_id):
    return jsonify(fetch_applications_by_placement(p_id))

@placement_bp.route('/applications', methods=['GET'])
def get_all_apps():
    return jsonify(fetch_all_applications())

@placement_bp.route('/applications/<id>/status', methods=['PUT'])
def set_app_status(id):
    data = request.get_json()
    status = data.get('status')
    if update_application_status(id, status):
        return jsonify({'message': f'Status updated to {status}'})
    return jsonify({'error': 'Failed to update status'}), 404
