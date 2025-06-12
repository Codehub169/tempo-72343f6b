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

# Upgrade pip
echo "Upgrading pip..."
python -m pip install --upgrade pip

if [ ! -f "requirements.txt" ]; then
    echo "Error: 'backend/requirements.txt' not found."
    if command -v deactivate &> /dev/null; then # Check if deactivate command exists
        deactivate # Deactivate venv if requirements are missing and we exit
    fi
    exit 1
fi
echo "Installing Python dependencies from requirements.txt..."
pip install -r requirements.txt

# Deactivate virtual environment if it was activated by this script before changing directory
# This is optional, as the script is about to exec into a process that uses the venv, or exit.
# However, for clarity or if more commands were to follow outside backend, it's good practice.
# deactivate # Commented out as 'exec' will replace the shell process anyway.

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

# echo "Updating npm to a recent stable version..."
# npm install -g npm@11.4.1 # Updating to the version mentioned in logs - This line caused the EBADENGINE error.
# The existing npm version (e.g., 10.8.2 with Node 18.20.8) should be sufficient.
# If a specific npm version compatible with Node 18 is needed, it should be specified here, e.g. npm install -g npm@10
echo "Using existing npm version. Verifying npm version..."
npm -v

echo "Installing Node.js dependencies from package.json..."
# This will create package-lock.json if it doesn't exist
npm install

echo "Addressing npm vulnerabilities..."
# Changed from 'npm audit fix --force' to 'npm audit fix' to avoid forced breaking changes.
# This will attempt to fix vulnerabilities without forcing major version upgrades unless necessary and un-forced.
# If vulnerabilities persist after dependency updates (e.g., in package.json), this might still report them.
npm audit fix

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
# Ensure app.main:app exists and is executable by uvicorn.
if [ ! -f "app/main.py" ]; then
    echo "Error: 'backend/app/main.py' not found. Cannot start Uvicorn server."
    # If the virtual environment was activated (likely from the first backend setup block),
    # attempt to deactivate it before exiting. This is mainly for cleanup if run in an interactive shell.
    if command -v deactivate &> /dev/null; then
        deactivate
    fi
    exit 1
fi

# Activate virtual environment again before exec, ensuring uvicorn runs in the correct environment.
# This is a safeguard in case the shell environment from the first activation was lost or if running parts of the script in subshells.
source venv/bin/activate

# Ensure Python output is unbuffered, which helps with logging in Docker
export PYTHONUNBUFFERED=1

echo "Attempting to start Uvicorn server..."
# Use exec to replace the shell process with the uvicorn process.
# This makes uvicorn the main process in the container (if this script is PID 1)
# and ensures signals are handled correctly.
# Using the venv's python to run uvicorn module for potentially better robustness.
exec ./venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port "$APP_PORT" --log-level debug

# Lines below this 'exec' will not be reached as the script process is replaced.
# This is the intended behavior for running a long-lived service like uvicorn as the main container process.

# echo -e "\n\ud83d\udc4b Application stopped."
