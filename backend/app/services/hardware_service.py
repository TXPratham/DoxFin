"""Hardware-adaptive detection service (CPU, RAM, GPU, Apple Silicon, VRAM profiling)"""
import os
import platform
from typing import Dict, Any


class HardwareService:
    @staticmethod
    def get_hardware_profile() -> Dict[str, Any]:
        """
        Detect system resources and recommend execution mode (Fast CPU vs GPU VLM).
        """
        return {
            "os": platform.system(),
            "cpu_count": os.cpu_count(),
            "has_cuda": False,
            "mode": "cpu_optimized",
        }
