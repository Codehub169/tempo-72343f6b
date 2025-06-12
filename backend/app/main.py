from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import os

# Create FastAPI app instance
app = FastAPI(
    title="Pythonic Snake Game API",
    description="API for the Pythonic Snake Game, serving game logic and scoreboard, plus the frontend.",
    version="1.0.0"
)

# --- CORS Middleware --- 
# Allows requests from specified origins. For development, allowing all is common.
# For production, restrict this to your frontend's domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for simplicity
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], # Specify methods or use ["*"]
    allow_headers=["*"],  # Allows all headers
)

# --- API Routers (Placeholder) --- 
# Example: 
# from .routers import scores  # Assuming you'll have a scores.py router
# app.include_router(scores.router, prefix="/api/v1/scores", tags=["scores"])

@app.get("/api/health", tags=["General"])
async def health_check():
    """Basic health check endpoint."""
    return {"status": "ok", "message": "API is healthy"}

# --- Frontend Serving --- 
# Determine the absolute path to the frontend's build directory.
# Assumes this 'main.py' is in 'backend/app/', and 'frontend/dist' is at the project root level.
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FRONTEND_BUILD_DIR = os.path.join(PROJECT_ROOT, "frontend", "dist")

# Check if the frontend build directory exists
if not os.path.exists(FRONTEND_BUILD_DIR):
    print(f"WARNING: Frontend build directory not found at {FRONTEND_BUILD_DIR}")
    print("Please build the frontend using 'npm run build' in the 'frontend' directory.")
    # Optionally, serve a placeholder message if the frontend is not built
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
    # Mount static files (JS, CSS, images, etc.) from the frontend build directory's 'assets' folder
    # Vite typically places assets in an 'assets' subfolder within 'dist'.
    assets_dir = os.path.join(FRONTEND_BUILD_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
    else:
        print(f"WARNING: Frontend assets directory not found at {assets_dir}")

    # Serve other static files like favicon.ico, manifest.json etc., directly from the root of dist
    # These are files that might not be in the 'assets' folder.
    app.mount("/static-root", StaticFiles(directory=FRONTEND_BUILD_DIR, html=False), name="static-root-files")

    @app.get("/{catchall:path}", response_class=FileResponse)
    async def serve_react_app(request: Request, catchall: str):
        """
        Serve the main index.html for all non-API routes.
        This allows React Router to handle client-side navigation.
        """
        index_path = os.path.join(FRONTEND_BUILD_DIR, "index.html")
        # Fallback for paths that look like files but are not found, to prevent serving index.html for them
        # e.g. /nonexistent.js should be 404, not index.html
        potential_file_path = os.path.join(FRONTEND_BUILD_DIR, catchall)
        if os.path.isfile(potential_file_path):
             if os.path.exists(potential_file_path):
                return FileResponse(potential_file_path)
             else:
                return FileResponse(index_path, status_code=404) # Or a custom 404 page

        if os.path.exists(index_path):
            return FileResponse(index_path)
        
        # If index.html itself is not found (which would be unusual after a successful build)
        return HTMLResponse(
            content="<html><head><title>Error</title></head><body><h1>Frontend Error</h1><p>index.html not found. Please rebuild the frontend.</p></body></html>",
            status_code=500
        )

# --- Database Initialization (Placeholder) ---
# from .database import engine, Base
# from . import models # Ensure models are imported so SQLAlchemy knows about them

# @app.on_event("startup")
# async def on_startup():
#     # This is where you would create database tables if they don't exist
#     # For a simple project, you might do it directly.
#     # For more complex setups, Alembic migrations are recommended.
#     async with engine.begin() as conn:
#         # await conn.run_sync(Base.metadata.drop_all) # Use with caution: drops all tables
#         await conn.run_sync(Base.metadata.create_all)
#     print("Database tables checked/created.")

# To run directly (for development, though uvicorn command is preferred for startup.sh):
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=9000, reload=True)
