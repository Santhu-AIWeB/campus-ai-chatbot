#!/bin/bash

# Start the Rasa Action Server in the background (Internal only)
echo "Starting Rasa Action Server on localhost:5055..."
rasa run actions --actions actions -h 127.0.0.1 -p 5055 &

# Start the Rasa Server in the foreground
echo "Starting Rasa Server on port ${PORT:-5005}..."
rasa run --enable-api --cors "*" --port ${PORT:-5005}
