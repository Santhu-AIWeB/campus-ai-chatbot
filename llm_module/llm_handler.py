import os
import json

# ─── Option A: Use OpenAI (gpt-3.5-turbo / gpt-4) ───────────────────────────
# pip install openai
# Set env: OPENAI_API_KEY=<your-key>

# ─── Option B: Use a local model via Ollama (no API key needed) ──────────────
# Install Ollama: https://ollama.com  then run: ollama run mistral
# pip install requests

KNOWLEDGE_BASE_PATH = os.path.join(os.path.dirname(__file__), '..', 'knowledge_base', 'faq_data.json')

def load_knowledge_base() -> str:
    """Load FAQ data as a context string for the LLM."""
    try:
        with open(KNOWLEDGE_BASE_PATH, 'r') as f:
            faqs = json.load(f)
        return "\n".join([f"Q: {item['question']}\nA: {item['answer']}" for item in faqs])
    except Exception:
        return ""


def query_llm(user_message: str) -> str:
    """
    Query the LLM with campus context. Defaults to OpenAI.
    Switch PROVIDER to 'ollama' for local model.
    """
    PROVIDER = os.environ.get('LLM_PROVIDER', 'openai')   # 'openai' or 'ollama'
    context = load_knowledge_base()

    system_prompt = (
        "You are a helpful campus AI assistant for a college. "
        "Answer student questions about events, materials, fees, timetables, and campus life. "
        "Be concise and friendly.\n\n"
        f"Campus Knowledge Base:\n{context}"
    )

    if PROVIDER == 'openai':
        return _openai_chat(system_prompt, user_message)
    elif PROVIDER == 'ollama':
        return _ollama_chat(system_prompt, user_message)
    elif PROVIDER == 'groq':
        return _groq_chat(system_prompt, user_message)
    else:
        return "LLM provider not configured. Please set the LLM_PROVIDER environment variable."


def _openai_chat(system_prompt: str, user_message: str) -> str:
    try:
        from openai import OpenAI
        client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            max_tokens=300,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"OpenAI error: {str(e)}"


def _groq_chat(system_prompt: str, user_message: str) -> str:
    """Use Groq's cloud API (Free Tier)."""
    try:
        import requests
        api_key = os.environ.get('GROQ_API_KEY', '').strip()
        if not api_key:
            return "Groq API Key missing. Please set GROQ_API_KEY."
        
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "mixtral-8x7b-32768",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "max_tokens": 300
        }
        res = requests.post(url, json=payload, timeout=30)
        data = res.json()
        if 'choices' in data:
            return data['choices'][0]['message']['content'].strip()
        return f"Groq Error: {json.dumps(data)}"
    except Exception as e:
        return f"Groq error: {str(e)}"


def _ollama_chat(system_prompt: str, user_message: str) -> str:
    """Use local Ollama REST API."""
    try:
        import requests
        base_url = os.environ.get('OLLAMA_BASE_URL', 'http://localhost:11434').rstrip('/')
        payload = {
            "model": os.environ.get('OLLAMA_MODEL', 'mistral'),
            "prompt": f"{system_prompt}\n\nUser: {user_message}\nAssistant:",
            "stream": False
        }
        res = requests.post(f"{base_url}/api/generate", json=payload, timeout=300)
        return res.json().get('response', 'No response from Ollama.')
    except Exception as e:
        return f"Ollama error: {str(e)}"
