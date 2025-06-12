from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import os

from .database import create_db_and_tables # For DB initialization
from . import models # Ensures models are registered with SQLAlchemy's Base for table creation
from .routers import scores # Import the scores router

# Create FastAPI app instance
app = FastAPI(
    title="Pythonic Snake Game API",
    description="API for the Pythonic Snake Game, serving game logic and scoreboard, plus the frontend.",
    version="1.0.0"
)

# --- CORS Middleware --- 
# Added to allow frontend (e.g., Vite dev server on a different port) to communicate with the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for simplicity in dev (adjust for production)
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# --- API Routers --- 
# Corrected prefix to /api/scores to match frontend expectations
app.include_router(scores.router, prefix="/api/scores", tags=["Scores"])

@app.get("/api/health", tags=["General"])
async def health_check():
    """Basic health check endpoint."""
    return {"status": "ok", "message": "API is healthy"}

# --- Frontend Serving --- 
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FRONTEND_BUILD_DIR = os.path.join(PROJECT_ROOT, "frontend", "dist")

# Check if frontend build exists
if not os.path.exists(FRONTEND_BUILD_DIR):
    print(f"WARNING: Frontend build directory not found at {FRONTEND_BUILD_DIR}")
    print("Please build the frontend using 'npm run build' in the 'frontend' directory.")
    # Provide a placeholder page if frontend is not built
    @app.get("/{catchall:path}", response_class=HTMLResponse)
    async def serve_placeholder_frontend(request: Request):
        return """
        <html>
            <head><title>Pythonic Snake Game</title></head>
            <body style='font-family: sans-serif; text-align: center; padding-top: 50px;'>
                <h1>Pythonic Snake Game</h1>
                <p>Frontend not found. Please build the frontend application.</p>
                <p>Navigate to the <code>frontend</code> directory and run <code>npm install && npm run build</code>.</p>
            </body>
        </html>
        """
else:
    # Mount the 'assets' directory from the frontend build (common for Vite/React apps)
    assets_dir = os.path.join(FRONTEND_BUILD_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
    else:
        print(f"WARNING: Frontend assets directory not found at {assets_dir}. Static assets might not load correctly.")

    # Removed redundant /static-root mount as per CONF_UNC_001

    # Catch-all route to serve index.html or other static files from the root of the build directory
    @app.get("/{catchall:path}") # response_class removed from decorator as function can return FileResponse or HTMLResponse
    async def serve_react_app(request: Request, catchall: str):
        index_path = os.path.join(FRONTEND_BUILD_DIR, "index.html")
        # Construct path to the requested file within the frontend build directory
        # e.g., if catchall is 'favicon.ico', path is 'frontend/dist/favicon.ico'
        # e.g., if catchall is 'manifest.json', path is 'frontend/dist/manifest.json'
        # If catchall is empty (root path), potential_file_path will be FRONTEND_BUILD_DIR itself.
        potential_file_path = os.path.join(FRONTEND_BUILD_DIR, catchall)

        # Serve the file if it exists (e.g., favicon.ico, manifest.json, etc.)
        # os.path.isfile also checks for existence implicitly.
        if os.path.isfile(potential_file_path):
            return FileResponse(potential_file_path)

        # For any other path (SPA routes like /game, /scoreboard, or non-existent assets not caught by /assets mount),
        # serve the main index.html file, allowing the frontend router to handle the path.
        if os.path.exists(index_path):
            return FileResponse(index_path)
        
        # Fallback if index.html itself is not found (indicates a broken build or misconfiguration)
        return HTMLResponse(
            content="<html><head><title>Error</title></head><body><h1>Frontend Error</h1><p>index.html not found. Please rebuild the frontend.</p></body></html>",
            status_code=500
        )

# --- Database Initialization ---
@app.on_event("startup")
def on_startup(): # Can be a synchronous function if create_db_and_tables is sync
    # Ensure models are imported before create_db_and_tables if it relies on Base.metadata
    # The 'from . import models' at the top of the file handles this.
    print("Application startup: Initializing database...")
    create_db_and_tables() # Call the function from database.py to create tables
    print("Database tables checked/created.")

# To run directly (for development, though uvicorn command in startup.sh is preferred for deployment-like start):
if __name__ == "__main__":
    import uvicorn
    # Default port changed to 8000 to avoid conflict with Vite's default (e.g. 5173 or 9000 if configured)
    # and to match frontend proxy target if frontend dev server is used.
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
