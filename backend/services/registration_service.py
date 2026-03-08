from models.registration_model import create_registration, get_registrations_by_event

def register_for_event(data: dict) -> dict:
    return create_registration(data)

def get_event_registrations(event_id: str) -> list:
    return get_registrations_by_event(event_id)
