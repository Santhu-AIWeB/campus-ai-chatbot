---
description: How to run the Rasa Bot and Action Server
---

Follow these steps to start your Rasa chatbot environment:

### 1. Open a Terminal and Activate Environment
First, ensure you are in the correct environment:
```powershell
conda activate rasa-env
cd c:\PROJETCS\N\campus-ai-chatbot\rasa_bot
```

### 2. Run the Action Server (Required for Custom Logic)
In a separate terminal (with the same environment activated):
// turbo
```powershell
rasa run actions
```

### 3. Run the Rasa Bot Server
In your main terminal:
// turbo
```powershell
rasa run --enable-api --cors "*" --port 5005
```

### 4. Verify Operation
Once both servers are running, you can test if the model is loaded by opening this URL in your browser or using `curl`:
```powershell
curl http://localhost:5005/status
```
You should see `"status": "success"` or details about the loaded model.
