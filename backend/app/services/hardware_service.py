"""
Hardware-Adaptive Detection Service (Phase 18).
Profiles CPU cores, System RAM, physical NVIDIA GPU model, and dedicated VRAM
to dynamically recommend the optimal Qwen-VL model size and precision.
"""
import os
import subprocess
import platform
import psutil
from typing import Dict, Any, Optional


class HardwareService:

    @staticmethod
    def detect_nvidia_gpu() -> Optional[Dict[str, Any]]:
        """Query physical NVIDIA GPU specs via nvidia-smi command if available."""
        try:
            output = subprocess.check_output(
                ["nvidia-smi", "--query-gpu=name,memory.total,memory.free,driver_version", "--format=csv,noheader,nounits"],
                encoding="utf-8",
                stderr=subprocess.DEVNULL
            ).strip()

            if output:
                lines = output.split("\n")
                primary_gpu = lines[0].split(",")
                name = primary_gpu[0].strip()
                total_vram_mb = float(primary_gpu[1].strip())
                free_vram_mb = float(primary_gpu[2].strip())
                driver_version = primary_gpu[3].strip() if len(primary_gpu) > 3 else "N/A"

                return {
                    "name": name,
                    "total_vram_gb": round(total_vram_mb / 1024.0, 2),
                    "free_vram_gb": round(free_vram_mb / 1024.0, 2),
                    "driver_version": driver_version,
                    "available": True
                }
        except Exception:
            pass
        return None

    @classmethod
    def get_hardware_profile(cls) -> Dict[str, Any]:
        """
        Profiles CPU, RAM, and GPU/VRAM to select the optimal model tier.
        
        Tiers:
        - 'lite' (<6GB VRAM or CPU only): Qwen2.5-VL-3B / Qwen2-VL-2B (int4 / bfloat16)
        - 'balanced' (6GB - 12GB VRAM): Qwen2.5-VL-7B (int4/fp8)
        - 'performance' (>16GB VRAM): Qwen2.5-VL-7B (fp16/bfloat16) or larger
        """
        ram = psutil.virtual_memory()
        total_ram_gb = round(ram.total / (1024 ** 3), 2)
        avail_ram_gb = round(ram.available / (1024 ** 3), 2)
        cpu_count_logical = psutil.cpu_count(logical=True)
        cpu_count_physical = psutil.cpu_count(logical=False) or (cpu_count_logical // 2)

        gpu_info = cls.detect_nvidia_gpu()

        if gpu_info and gpu_info["total_vram_gb"] > 0:
            vram = gpu_info["total_vram_gb"]
            if vram < 6.0:
                tier = "lite"
                recommended_model = "Qwen/Qwen2.5-VL-3B-Instruct"
                quantization = "4bit" if vram <= 4.0 else "bfloat16"
                device = "cuda"
            elif vram < 14.0:
                tier = "balanced"
                recommended_model = "Qwen/Qwen2.5-VL-7B-Instruct"
                quantization = "4bit"
                device = "cuda"
            else:
                tier = "performance"
                recommended_model = "Qwen/Qwen2.5-VL-7B-Instruct"
                quantization = "bfloat16"
                device = "cuda"
        else:
            # CPU fallback
            tier = "lite"
            recommended_model = "Qwen/Qwen2.5-VL-3B-Instruct"
            quantization = "int8_or_cpu"
            device = "cpu"

        return {
            "os": platform.system(),
            "platform": platform.platform(),
            "cpu_physical": cpu_count_physical,
            "cpu_logical": cpu_count_logical,
            "ram_total_gb": total_ram_gb,
            "ram_available_gb": avail_ram_gb,
            "gpu": gpu_info or {"available": False, "name": "None", "total_vram_gb": 0.0},
            "recommended_tier": tier,
            "recommended_model": recommended_model,
            "recommended_quantization": quantization,
            "recommended_device": device
        }
