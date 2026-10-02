import sys
import json
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.services.hardware_service import HardwareService

print("=" * 65)
print("Phase 18: ASUS A15 Hardware Detector & Model Tier Profiling")
print("=" * 65)

profile = HardwareService.get_hardware_profile()

print("\n--- System Specifications ---")
print(f"OS Platform:       {profile['platform']}")
print(f"CPU:               {profile['cpu_physical']} Physical Cores / {profile['cpu_logical']} Logical Threads")
print(f"System RAM:        {profile['ram_total_gb']} GB Total ({profile['ram_available_gb']} GB Available)")

print("\n--- GPU & Acceleration ---")
gpu = profile["gpu"]
if gpu["available"]:
    print(f"GPU Model:         {gpu['name']}")
    print(f"Dedicated VRAM:    {gpu['total_vram_gb']} GB Total ({gpu['free_vram_gb']} GB Free)")
    print(f"NVIDIA Driver:     {gpu['driver_version']}")
else:
    print("No discrete NVIDIA GPU detected (CPU mode).")

print("\n--- DoxFin Model Recommendation ---")
print(f"Hardware Tier:     {profile['recommended_tier'].upper()}")
print(f"Recommended Model: {profile['recommended_model']}")
print(f"Quantization/Mode: {profile['recommended_quantization']}")
print(f"Target Device:     {profile['recommended_device']}")

print("\n>>> Hardware Profile Check Completed Successfully! <<<")
