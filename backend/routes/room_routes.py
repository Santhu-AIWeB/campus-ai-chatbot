from flask import Blueprint, request, jsonify
from models.room_model import create_room, get_all_rooms, delete_room, room_to_dict, get_rooms_collection
from utils.auth import token_required
from bson import ObjectId

room_bp = Blueprint('rooms', __name__)

@room_bp.route('/<room_id>', methods=['GET'])
@token_required
def get_room(current_user, room_id):
    try:
        room = get_rooms_collection().find_one({'_id': ObjectId(room_id)})
        if room:
            return jsonify(room_to_dict(room)), 200
        return jsonify({'error': 'Room not found'}), 404
    except:
        return jsonify({'error': 'Invalid ID'}), 400

@room_bp.route('/', methods=['GET'])
@token_required
def list_rooms(current_user):
    rooms = get_all_rooms()
    return jsonify(rooms), 200

@room_bp.route('/', methods=['POST'])
@token_required
def add_room(current_user):
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Room name is required'}), 400
    
    new_room = {
        'name': name,
        'topic': data.get('topic', 'General Study'),
        'description': data.get('description', ''),
        'created_by': current_user.get('email')
    }
    
    try:
        room = create_room(new_room)
        return jsonify(room), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@room_bp.route('/<room_id>', methods=['DELETE'])
@token_required
def remove_room(current_user, room_id):
    # Only allow creator or admin to delete?
    if delete_room(room_id):
        return jsonify({'message': 'Room deleted'}), 200
    return jsonify({'error': 'Room not found'}), 404
