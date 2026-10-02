"""
DoxFin Backend Server Entrypoint.
Run from root: python run_backend.py
"""
import sys
from pathlib import Path
import uvicorn

root_dir = Path(__file__).resolve().parent
backend_dir = root_dir / "backend"

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("Starting DoxFin Backend API Server on http://127.0.0.1:8000")
    print("Swagger / OpenAPI Docs: http://127.0.0.1:8000/docs")
    print("=" * 60 + "\n")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True, app_dir=str(backend_dir))
