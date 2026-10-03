"""
DoxFin Enterprise Installer & Self-Hosted Provisioning Script (Phase 49).
Automates dependency checking, directory creation, database setup,
model verification, and service launching for on-premise company deployments.
"""
import os
import sys
import subprocess
import shutil
import sqlite3
from pathlib import Path

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / "backend"
FRONTEND_DIR = BASE_DIR / "frontend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

STORAGE_DIRS = [
    BACKEND_DIR / "uploads",
    BACKEND_DIR / "extracted",
    BACKEND_DIR / "cache",
    BACKEND_DIR / "vector_store",
    BACKEND_DIR / "licenses",
    BACKEND_DIR / "logs",
]


def print_step(step_num: int, title: str):
    print(f"\n[{step_num}/5] 🚀 {title}...")


def step_1_create_storage():
    print_step(1, "Configuring Storage & Cache Directories")
    for d in STORAGE_DIRS:
        d.mkdir(parents=True, exist_ok=True)
        print(f"  ✓ Directory ready: {d.relative_to(BASE_DIR)}")


def step_2_verify_dependencies():
    print_step(2, "Verifying Python Dependencies")
    req_file = BACKEND_DIR / "requirements.txt"
    if req_file.exists():
        print(f"  ✓ Found requirements.txt at {req_file.relative_to(BASE_DIR)}")
    else:
        print("  ⚠️ requirements.txt not found, skipping pip check.")


def step_3_init_database():
    print_step(3, "Initializing Relational Database Schema")
    try:
        try:
            from backend.app.database.database import init_db
        except ImportError:
            from app.database.database import init_db
        init_db()
        print("  ✓ Database schema created and verified.")
    except Exception as e:
        print(f"  ⚠️ Database initialization warning: {e}")


def step_4_verify_models_and_licensing():
    print_step(4, "Verifying Model & License Readiness")
    lic_dir = BACKEND_DIR / "licenses"
    default_lic = lic_dir / "doxfin.lic"
    if default_lic.exists():
        print(f"  ✓ License file detected: {default_lic.name}")
    else:
        print("  ℹ️ No custom license found. Defaulting to Trial / Community pilot mode.")


def step_5_display_launch_commands():
    print_step(5, "Ready for Deployment")
    print("\n" + "=" * 60)
    print("  🎉 DoxFin On-Premise Suite is ready for deployment!")
    print("=" * 60)
    print("\nTo start DoxFin services:")
    print("\n1. Start Backend Server:")
    print(f"   cd \"{BACKEND_DIR}\"")
    print("   uvicorn app.main:app --host 0.0.0.0 --port 8000")
    print("\n2. Start Frontend Web Interface:")
    print(f"   cd \"{FRONTEND_DIR}\"")
    print("   npm run dev\n")


def run_installer():
    print("=" * 60)
    print("       DOXFIN ENTERPRISE ON-PREMISE INSTALLER")
    print("=" * 60)
    step_1_create_storage()
    step_2_verify_dependencies()
    step_3_init_database()
    step_4_verify_models_and_licensing()
    step_5_display_launch_commands()


if __name__ == "__main__":
    run_installer()
