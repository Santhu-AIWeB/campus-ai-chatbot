import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'llm_module'))
from llm_handler import query_llm

def get_llm_response(message: str) -> str:
    """Delegate to the LLM handler module."""
    return query_llm(message)
