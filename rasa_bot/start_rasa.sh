#!/bin/bash

# Start the Rasa Action Server in the background
echo "Starting Rasa Action Server on port 5055..."
rasa run actions --actions actions -p 5055 &

# Start the Rasa Server in the foreground
echo "Starting Rasa Server on port ${PORT:-5005}..."
rasa run --enable-api --cors "*" --port ${PORT:-5005}
