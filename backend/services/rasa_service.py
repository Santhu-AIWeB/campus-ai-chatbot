import requests

RASA_URL = 'http://localhost:5005/webhooks/rest/webhook'

def get_rasa_response(message: str, semester: str = None) -> str | None:
    """Send message to Rasa server, return first text response or None."""
    try:
        print(f"DEBUG: Sending message to Rasa: {message} (Semester: {semester})")
        # Use a session to bypass system proxies if they are interfering
        session = requests.Session()
        session.trust_env = False
        
        payload = {'sender': 'user', 'message': message}
        if semester:
            payload['metadata'] = {'semester': semester}
            
        res = session.post(RASA_URL, json=payload, timeout=30)
        responses = res.json()
        print(f"DEBUG: Rasa response: {responses}")
        if responses:
            return "\n\n".join([r.get('text', '') for r in responses if r.get('text')])
    except Exception as e:
        print(f"DEBUG: Rasa service error: {e}")
    return None
