# Use the official Rasa image
FROM rasa/rasa:3.6.20

# Use root user to set up the environment
USER root

# Install any specialized dependencies (if needed, e.g., Spacy or custom libraries)
# RUN pip install --no-cache-dir some-library

# Create working directory
WORKDIR /app

# Copy the entire rasa_bot directory into the container
COPY . /app

# Ensure the start script is executable
RUN chmod +x /app/start_rasa.sh

# The user 1001 is standard for Rasa images
USER 1001

# Default port for Rasa
EXPOSE 5005

# Run the startup script that starts both Rasa and Action Server
ENTRYPOINT ["/app/start_rasa.sh"]
