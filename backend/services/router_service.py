from services.rasa_service import get_rasa_response
from services.llm_service import get_llm_response

# Simple keyword routing: if Rasa confidence is low, fall back to LLM
def route_message(user_message: str, semester: str = None) -> str:
    rasa_response = get_rasa_response(user_message, semester)
    if rasa_response:
        return rasa_response
    return get_llm_response(user_message)
