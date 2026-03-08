from flask_socketio import emit, join_room, leave_room
from flask import request
from models.room_model import update_participant_count

def register_socket_events(socketio):
    @socketio.on('connect')
    def handle_connect():
        print(f"Client connected: {request.sid}")

    @socketio.on('join')
    def on_join(data):
        username = data.get('username', 'Anonymous')
        room = data.get('room')
        if not room:
            return
            
        join_room(room)
        # Update DB count if it's a valid MongoDB ID
        if len(room) == 24:
            try:
                update_participant_count(room, 1)
            except: pass

        print(f"{username} joined room: {room}")
        emit('status', {'msg': f"{username} has entered the room."}, to=room)

    @socketio.on('leave')
    def on_leave(data):
        username = data.get('username', 'Anonymous')
        room = data.get('room')
        if not room:
            return
            
        leave_room(room)
        # Update DB count if it's a valid MongoDB ID
        if len(room) == 24:
            try:
                update_participant_count(room, -1)
            except: pass

        print(f"{username} left room: {room}")
        emit('status', {'msg': f"{username} has left the room."}, to=room)

    @socketio.on('message')
    def handle_message(data):
        room = data.get('room')
        msg = data.get('message')
        username = data.get('username', 'Anonymous')
        
        if room and msg:
            emit('message', {
                'username': username,
                'message': msg,
                'timestamp': data.get('timestamp')
            }, to=room)
