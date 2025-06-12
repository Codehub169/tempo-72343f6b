from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import logging

from .database import create_db_and_tables # For DB initialization
from . import models # Ensures models are registered with SQLAlchemy's Base for table creation
from .routers import scores # Import the scores router

# Initialize logger
# Configure logging to show level and message
logging.basicConfig(level=logging.INFO, format='%(levelname)s:     %(message)s')
logger = logging.getLogger(__name__)

# Create FastAPI app instance
app = FastAPI(
    title="Pythonic Snake Game API",
    description="API for the Pythonic Snake Game, serving game logic and scoreboard, plus the frontend.",
    version="1.0.0"
)

# --- Global Exception Handler ---
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception for request {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "An unexpected internal server error occurred."},
    )

# --- CORS Middleware --- 
# Added to allow frontend (e.g., Vite dev server on a different port) to communicate with the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # WARNING: Allows all origins. Restrict for production.
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# --- API Routers --- 
app.include_router(scores.router, prefix="/api/scores", tags=["Scores"])

@app.get("/api/health", tags=["General"])
async def health_check():
    """Basic health check endpoint."""
    return {"status": "ok", "message": "API is healthy"}

# --- Frontend Serving --- 
# Determine project root and frontend build directory paths
# __file__ is backend/app/main.py. os.path.dirname(__file__) is backend/app.
# First '..' goes to backend/. Second '..' goes to project_root/.
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FRONTEND_BUILD_DIR = os.path.join(PROJECT_ROOT, "frontend", "dist")

# Check if frontend build exists
if not os.path.isdir(FRONTEND_BUILD_DIR): # Check if it's a directory
    logger.warning(f"Frontend build directory not found at {FRONTEND_BUILD_DIR}")
    logger.warning("Please build the frontend using 'npm run build' in the 'frontend' directory.")
    
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
    logger.info(f"Serving frontend from: {FRONTEND_BUILD_DIR}")
    # Mount the 'assets' directory from the frontend build (common for Vite/React apps)
    assets_dir = os.path.join(FRONTEND_BUILD_DIR, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir, html=False), name="assets") # html=False as these are not html files
        logger.info(f"Mounted frontend assets from: {assets_dir}")
    else:
        logger.warning(f"Frontend assets directory not found at {assets_dir}. Static assets might not load correctly.")

    # Catch-all route to serve index.html or other static files from the root of the build directory
    @app.get("/{catchall:path}")
    async def serve_spa(request: Request, catchall: str):
        index_path = os.path.join(FRONTEND_BUILD_DIR, "index.html")
        # potential_file_path is relative to FRONTEND_BUILD_DIR
        # e.g. if catchall is "favicon.ico", path is "frontend/dist/favicon.ico"
        # if catchall is empty (root "/"), it means serve index.html

        if not catchall or catchall == "index.html":
            requested_file_path = index_path
        else:
            requested_file_path = os.path.join(FRONTEND_BUILD_DIR, catchall)
        
        # Security: Resolve the absolute path and ensure it's within FRONTEND_BUILD_DIR
        abs_requested_file_path = os.path.abspath(requested_file_path)
        
        if not abs_requested_file_path.startswith(FRONTEND_BUILD_DIR):
            logger.warning(
                f"Path traversal attempt or invalid path: '{catchall}' resolved to '{abs_requested_file_path}', "
                f"which is outside of frontend build directory '{FRONTEND_BUILD_DIR}'."
            )
            # Serve index.html for SPA-like behavior on unknown paths, or 404 if it's a clear exploit attempt.
            # For simplicity, if it's outside, it's a 404.
            return HTMLResponse(content="<html><body><h1>404 Not Found</h1><p>The requested path is outside the serving scope.</p></body></html>", status_code=404)

        # If the requested path is a file, serve it
        if os.path.isfile(abs_requested_file_path):
            return FileResponse(abs_requested_file_path)
        
        # Otherwise (e.g., SPA route like /game, /scoreboard), serve index.html
        if os.path.exists(index_path):
            return FileResponse(index_path)
        
        # Fallback if index.html itself is not found (indicates a broken build or misconfiguration)
        logger.error(f"index.html not found at {index_path} when serving catchall route for '{catchall}'.")
        return HTMLResponse(
            content="<html><head><title>Error</title></head><body><h1>Frontend Error</h1><p>index.html not found. Please rebuild the frontend.</p></body></html>",
            status_code=500
        )

# --- Database Initialization ---
@app.on_event("startup")
def on_startup(): # Can be a synchronous function if create_db_and_tables is sync
    logger.info("Application startup: Initializing database...")
    create_db_and_tables() # Call the function from database.py to create tables
    logger.info("Database tables checked/created.")

# To run directly (for development, though uvicorn command in startup.sh is preferred for deployment-like start):
if __name__ == "__main__":
    import uvicorn
    logger.info("Running in development mode with Uvicorn auto-reload.")
    # Default port changed to 8000 to avoid conflict with Vite's default (e.g. 5173 or 9000 if configured)
    # and to match frontend proxy target if frontend dev server is used.
    uvicorn.run(
        "app.main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True, 
        log_level="debug" # Uvicorn's log level, distinct from app's logger
    )
