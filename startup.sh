#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo -e "\ud83d\ude80 Starting Pythonic Snake Game setup..."

# --- Backend Setup ---
echo -e "\n\ud83d\udc0d Setting up backend..."
cd backend

# Create a virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv venv
fi

# Activate virtual environment
# Note: Activation syntax can vary slightly between shells. This is common for bash/zsh.
source venv/bin/activate

echo "Installing Python dependencies from requirements.txt..."
pip install -r requirements.txt

# Navigate back to project root
cd ..

# --- Frontend Setup ---
echo -e "\n\ud83c\udfa8 Setting up frontend..."
cd frontend

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null
then
    echo -e "\n\ud83d\udea8 Node.js or npm is not installed. Please install them to continue."
    echo "Visit https://nodejs.org/ for installation instructions."
    exit 1
fi

echo "Installing Node.js dependencies from package.json..."
# This will create package-lock.json if it doesn't exist
npm install

echo "Building frontend application..."
# This will create the 'dist' directory with static assets
npm run build

# Navigate back to project root
cd ..

# --- Run Application ---
echo -e "\n\u25b6\ufe0f Launching application..."
cd backend

# Ensure the port is 8000 for the main application access (FastAPI backend)
# This aligns with frontend proxy settings if Vite dev server is used (e.g., on port 9000 proxied to 8000)
APP_PORT=${PORT:-8000} # Use PORT environment variable if set, otherwise default to 8000

echo "Starting FastAPI server on http://0.0.0.0:$APP_PORT"
# The backend (app.main:app) will serve the frontend built in frontend/dist
uvicorn app.main:app --host 0.0.0.0 --port $APP_PORT --reload

# Deactivate virtual environment on exit (optional, as script exit usually handles this)
# deactivate # Uncomment if you want explicit deactivation within the script context

echo -e "\n\ud83d\udc4b Application stopped."
