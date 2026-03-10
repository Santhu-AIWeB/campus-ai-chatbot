#!/bin/bash

# Start the Rasa Action Server in the background
# --actions actions: Points to the actions directory
# -p 5055: Default port for action server
echo "Starting Rasa Action Server on port 5055..."
rasa run actions --actions actions -p 5055 &

# Start the Rasa Server in the foreground
# --enable-api: Allows REST API access
# --cors "*": Allows cross-origin requests
# --port 5005: Default port for Rasa server
echo "Starting Rasa Server on port 5005..."
rasa run --enable-api --cors "*" --port 5005
