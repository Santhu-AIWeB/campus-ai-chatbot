import eventlet
eventlet.monkey_patch()

import os
from dotenv import load_dotenv
load_dotenv()
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from routes.chat_routes import chat_bp
from routes.auth_routes import auth_bp
from routes.event_routes import event_bp
from routes.material_routes import material_bp
from routes.announcement_routes import announcement_bp
from routes.registration_routes import registration_bp
from routes.placement_routes import placement_bp
from routes.question_paper_routes import question_paper_bp
from routes.notification_routes import notification_bp
from routes.history_routes import history_bp
from routes.room_routes import room_bp
from routes.socket_handlers import register_socket_events

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024   # 100 MB max upload size
socketio = SocketIO(app, cors_allowed_origins="*")

# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Disable trailing-slash redirects
app.url_map.strict_slashes = False

@app.route('/')
def health_check():
    return {"status": "healthy", "message": "Backend is running!"}, 200

@app.route('/api/health')
def api_health():
    return {"status": "healthy", "message": "API prefix is working!"}, 200

@app.before_request
def log_request_info():
    print(f"[LOG] {request.method} to {request.path}")

# Register blueprints
app.register_blueprint(chat_bp,          url_prefix='/api/chat')
app.register_blueprint(auth_bp,          url_prefix='/api/auth')
app.register_blueprint(event_bp,         url_prefix='/api/events')
app.register_blueprint(material_bp,      url_prefix='/api/materials')
app.register_blueprint(announcement_bp,  url_prefix='/api/announcements')
app.register_blueprint(registration_bp,  url_prefix='/api/registrations')
app.register_blueprint(placement_bp,     url_prefix='/api/placements')
app.register_blueprint(question_paper_bp, url_prefix='/api/question-papers')
app.register_blueprint(notification_bp,    url_prefix='/api/notifications')
app.register_blueprint(history_bp,         url_prefix='/api/history')
app.register_blueprint(room_bp,            url_prefix='/api/rooms')

register_socket_events(socketio)

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
