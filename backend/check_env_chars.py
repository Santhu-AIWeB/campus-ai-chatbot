import os

env_path = r"c:\PROJETCS\N\campus-ai-chatbot\backend\.env"
with open(env_path, 'rb') as f:
    content = f.read()

print(f"File content (hex): {content.hex()}")
print(f"File content (raw): {content}")

# Find GROQ_API_KEY
try:
    decoded = content.decode('utf-8')
    for line in decoded.splitlines():
        if "GROQ_API_KEY" in line:
            print(f"Line: '{line}'")
            print(f"Chars and codes:")
            for c in line:
                print(f"  '{c}': {ord(c)}")
except Exception as e:
    print(f"Decode error: {e}")
