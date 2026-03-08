from flask import Blueprint, request, jsonify
from services.router_service import route_message
from models.chat_model import save_message, get_all_history

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '')
    if not user_message:
        return jsonify({'error': 'Message is required'}), 400
    
    semester = data.get('semester')
    
    # Save user message
    save_message('user', user_message)
    
    response = route_message(user_message, semester)
    
    # Save bot response
    save_message('bot', response)
    
    return jsonify({'reply': response})

@chat_bp.route('/history', methods=['GET'])
def get_history():
    history = get_all_history()
    return jsonify(history)
