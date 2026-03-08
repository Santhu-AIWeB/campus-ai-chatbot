# 🎓 Campus AI Chatbot

A full-stack AI-powered campus assistant built with **React + Tailwind CSS** (frontend), **Flask** (backend), **Rasa NLU** (chatbot), and an **LLM fallback** (OpenAI / local Ollama).

---

## 📁 Project Structure

```
campus-ai-chatbot/
├── frontend/        # React + Tailwind + Vite
├── backend/         # Flask REST API + SQLite
├── rasa_bot/        # Rasa NLU models and training data
├── llm_module/      # LLM handler (OpenAI / Ollama)
└── knowledge_base/  # Campus FAQ and policy JSON files
```

---

## ⚡ Installation & Setup

### 1. Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| Python | 3.10 (for Rasa) | https://python.org |
| Git | Latest | https://git-scm.com |

---

### 2. Frontend Setup (React + Tailwind)

```bash
cd frontend
npm install
npm run dev
```
> App runs at **http://localhost:3000**

---

### 3. Backend Setup (Flask + MongoDB)

**Install MongoDB Community Server first:**
> Download from https://www.mongodb.com/try/download/community  
> After install, start MongoDB:
```bash
# Windows — MongoDB runs as a service automatically after install
# OR start manually:
mongod --dbpath C:\data\db
```

Then set up Flask:
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```
> API runs at **http://localhost:5000**  
> MongoDB runs at **mongodb://localhost:27017** (database: `campus_ai_chatbot`)

---

### 4. Rasa Bot Setup

> ⚠️ **Rasa requires Python 3.10** — use a separate virtual environment.

```bash
cd rasa_bot

# Create dedicated Rasa virtualenv (Python 3.10)
py -3.10 -m venv rasa_env
rasa_env\Scripts\activate

# Install Rasa
pip install rasa==3.6.20

# Train the model
rasa train

# Start Rasa server (in one terminal)
rasa run --enable-api --cors "*" --port 5005

# Start action server (in another terminal)
rasa run actions --port 5055
```

---

### 5. LLM Module Setup

**Option A — OpenAI (cloud):**
```bash
pip install openai
set OPENAI_API_KEY=sk-your-key-here
set LLM_PROVIDER=openai
```

**Option B — Ollama (local, free):**
```bash
# 1. Install Ollama from https://ollama.com
# 2. Pull a model
ollama pull mistral

# 3. Set env variable
set LLM_PROVIDER=ollama
set OLLAMA_MODEL=mistral
```

---

## 🚀 Running Everything Together

Open **4 terminals**:

| Terminal | Command |
|----------|---------|
| 1 — Frontend | `cd frontend && npm run dev` |
| 2 — Backend | `cd backend && python app.py` |
| 3 — Rasa Server | `cd rasa_bot && rasa run --enable-api --cors "*"` |
| 4 — Rasa Actions | `cd rasa_bot && rasa run actions` |

---

## 🧠 How the Chatbot Works

```
User Message
    │
    ▼
Flask /api/chat
    │
    ├──► Rasa NLU  ──► Known intent? ──► Rasa Response ──► User
    │
    └──► LLM Fallback (OpenAI / Ollama + FAQ context) ──► User
```

---

## 🔐 Environment Variables

Create a `.env` file in `backend/`:

```env
JWT_SECRET=your-super-secret-key
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxxxx
OLLAMA_MODEL=mistral
```

---

## 📄 License
MIT
