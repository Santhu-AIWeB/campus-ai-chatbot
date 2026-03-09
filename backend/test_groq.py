import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

def test_groq():
    api_key = os.environ.get('GROQ_API_KEY', '').strip()
    print(f"Testing Key: '{api_key[:10]}...{api_key[-5:]}'")
    
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "user", "content": "Hello"}
        ],
        "max_tokens": 10
    }
    
    try:
        res = requests.post(url, json=payload, timeout=10)
        print(f"Status: {res.status_code}")
        print(f"Response: {res.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_groq()
