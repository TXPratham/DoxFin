"""
Hardware-Adaptive Detection & Execution Tuning Service (Phase 18 & Phase 37).
Profiles CPU cores, System RAM, physical NVIDIA GPU model, and dedicated VRAM
to dynamically configure the execution mode (LITE, BALANCED, PERFORMANCE)
with benchmark-grounded threshold tuning.
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
        """Profiles CPU, RAM, and GPU/VRAM to select the optimal model tier."""
        ram = psutil.virtual_memory()
        total_ram_gb = round(ram.total / (1024 ** 3), 2)
        avail_ram_gb = round(ram.available / (1024 ** 3), 2)
        cpu_count_logical = psutil.cpu_count(logical=True)
        cpu_count_physical = psutil.cpu_count(logical=False) or (cpu_count_logical // 2)

        gpu_info = cls.detect_nvidia_gpu()

        if gpu_info and gpu_info["total_vram_gb"] > 0:
            vram = gpu_info["total_vram_gb"]
            if vram < 6.0:
                tier = "LITE"
                recommended_model = "Qwen/Qwen2.5-VL-3B-Instruct"
                quantization = "4bit" if vram <= 4.0 else "bfloat16"
                device = "cuda"
            elif vram < 14.0:
                tier = "BALANCED"
                recommended_model = "Qwen/Qwen2.5-VL-7B-Instruct"
                quantization = "4bit"
                device = "cuda"
            else:
                tier = "PERFORMANCE"
                recommended_model = "Qwen/Qwen2.5-VL-7B-Instruct"
                quantization = "bfloat16"
                device = "cuda"
        else:
            # CPU fallback
            tier = "LITE" if total_ram_gb < 16.0 else "BALANCED"
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

    @classmethod
    def get_execution_mode_config(cls, override_mode: Optional[str] = None) -> Dict[str, Any]:
        """
        Phase 37 Benchmark-Tuned Execution Modes:
        Thresholds configured from real 500-page pipeline benchmarks:

        LITE:
        - 1-2 workers, small batches (5 pages)
        - Qwen2.5-VL-3B (4-bit or CPU)
        - Selective Docling, low memory limit (4 GB)

        BALANCED (Recommended for ASUS A15 / 16GB laptops):
        - 2-4 workers, moderate batches (10-20 pages)
        - Qwen2.5-VL-7B (4-bit quantized)
        - Selective Docling + RapidOCR, 8 GB memory limit

        PERFORMANCE (Workstations / Server GPUs):
        - 4-8 workers, large batches (50 pages)
        - Qwen2.5-VL-7B (bfloat16 / fp16)
        - High-throughput parallel Docling + full visual extraction
        """
        profile = cls.get_hardware_profile()
        mode = (override_mode or profile["recommended_tier"]).upper()

        configs = {
            "LITE": {
                "mode": "LITE",
                "max_parallel_workers": 2,
                "page_batch_size": 5,
                "vision_model": "Qwen2.5-VL-3B",
                "vision_quantization": "4bit",
                "docling_ocr_enabled": False,
                "memory_ceiling_gb": 4.0,
                "chunk_size": 400,
                "chunk_overlap": 80,
                "rag_top_k": 3,
                "description": "Optimized for lightweight memory usage and CPU/low-VRAM devices."
            },
            "BALANCED": {
                "mode": "BALANCED",
                "max_parallel_workers": 4,
                "page_batch_size": 15,
                "vision_model": "Qwen2.5-VL-7B",
                "vision_quantization": "4bit",
                "docling_ocr_enabled": True,
                "memory_ceiling_gb": 8.0,
                "chunk_size": 500,
                "chunk_overlap": 100,
                "rag_top_k": 5,
                "description": "Balanced high-accuracy processing for modern developer laptops."
            },
            "PERFORMANCE": {
                "mode": "PERFORMANCE",
                "max_parallel_workers": 8,
                "page_batch_size": 50,
                "vision_model": "Qwen2.5-VL-7B",
                "vision_quantization": "bfloat16",
                "docling_ocr_enabled": True,
                "memory_ceiling_gb": 16.0,
                "chunk_size": 600,
                "chunk_overlap": 120,
                "rag_top_k": 8,
                "description": "Maximum throughput for dedicated enterprise GPU servers."
            }
        }

        selected_config = configs.get(mode, configs["BALANCED"])
        return {
            **selected_config,
            "hardware_detected": {
                "ram_total_gb": profile["ram_total_gb"],
                "cpu_cores": profile["cpu_logical"],
                "gpu_name": profile["gpu"]["name"] if profile["gpu"]["available"] else "CPU Only",
                "vram_gb": profile["gpu"]["total_vram_gb"] if profile["gpu"]["available"] else 0.0
            }
        }
