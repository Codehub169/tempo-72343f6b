#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo -e "\ud83d\ude80 Starting Pythonic Snake Game setup..."

# --- Backend Setup ---
echo -e "\n\ud83d\udc0d Setting up backend..."
# Ensure script is run from project root, or adjust paths accordingly
if [ ! -d "backend" ]; then
    echo "Error: 'backend' directory not found. Please run this script from the project root directory."
    exit 1
fi
cd backend

# Create a virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv venv
fi

# Activate virtual environment
# Note: Activation syntax can vary slightly between shells. This is common for bash/zsh.
source venv/bin/activate

if [ ! -f "requirements.txt" ]; then
    echo "Error: 'backend/requirements.txt' not found."
    # Deactivate venv if created in this script run before exiting
    # Check if we are in a virtual environment (optional, as script exit might handle it)
    # if [ -n "$VIRTUAL_ENV" ]; then deactivate; fi 
    exit 1
fi
echo "Installing Python dependencies from requirements.txt..."
pip install -r requirements.txt

# Navigate back to project root
cd ..

# --- Frontend Setup ---
echo -e "\n\ud83c\udfa8 Setting up frontend..."
if [ ! -d "frontend" ]; then
    echo "Error: 'frontend' directory not found. Please run this script from the project root directory."
    exit 1
fi
cd frontend

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null
then
    echo -e "\n\ud83d\udea8 Node.js or npm is not installed. Please install them to continue."
    echo "Visit https://nodejs.org/ for installation instructions."
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "Error: 'frontend/package.json' not found."
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
# Removed --reload flag for more stable execution in container environments or production-like startups.
# Ensure app.main:app exists and is executable by uvicorn.
if [ ! -f "app/main.py" ]; then
    echo "Error: 'backend/app/main.py' not found. Cannot start Uvicorn server."
    exit 1
fi
uvicorn app.main:app --host 0.0.0.0 --port $APP_PORT

# Deactivate virtual environment on exit (optional, as script exit usually handles this)
# The script might be terminated before this line if uvicorn is ^C'd
# Consider a trap for cleanup if strict deactivation is needed.
# if [ -n "$VIRTUAL_ENV" ]; then deactivate; fi 

echo -e "\n\ud83d\udc4b Application stopped."
