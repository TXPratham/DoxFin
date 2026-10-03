"""
DoxFin IBM Granite 4.0 1B Local Inference Service.
Provides persistent, in-memory singleton access to the local Granite LLM for grounded financial explanations.
"""
from pathlib import Path
from typing import Optional
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

# DoxFin project root: backend/app/services/granite_service.py -> parents[3] is project root
PROJECT_ROOT = Path(__file__).resolve().parents[3]
MODEL_PATH = PROJECT_ROOT / "models" / "granite-4.0-1b"


class GraniteService:
    def __init__(self, model_path: Optional[Path] = None):
        target_path = model_path or MODEL_PATH
        print(f"Loading IBM Granite 4.0 1B from local path: {target_path}...")

        self.tokenizer = AutoTokenizer.from_pretrained(
            str(target_path),
            local_files_only=True
        )

        if torch.cuda.is_available():
            dtype = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
            device_map = "cuda"
        else:
            dtype = torch.float32
            device_map = "cpu"

        self.model = AutoModelForCausalLM.from_pretrained(
            str(target_path),
            local_files_only=True,
            torch_dtype=dtype,
            device_map=device_map
        )

        self.model.eval()
        print(f"IBM Granite loaded successfully on device: {self.model.device} (dtype: {dtype})")

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        max_new_tokens: int = 300
    ) -> str:
        messages = [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ]

        inputs = self.tokenizer.apply_chat_template(
            messages,
            add_generation_prompt=True,
            tokenize=True,
            return_dict=True,
            return_tensors="pt"
        )

        # Move input tensors to the model's primary device
        inputs = {
            key: value.to(self.model.device)
            for key, value in inputs.items()
        }

        with torch.inference_mode():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                do_sample=False,
                pad_token_id=self.tokenizer.eos_token_id
            )

        input_length = inputs["input_ids"].shape[-1]
        generated_tokens = outputs[0][input_length:]

        answer = self.tokenizer.decode(
            generated_tokens,
            skip_special_tokens=True
        )

        return answer.strip()


# Singleton Instance Manager (Load once, keep in memory)
_granite_service_instance: Optional[GraniteService] = None


def get_granite_service() -> GraniteService:
    """
    Returns the singleton instance of GraniteService.
    Loads the 3GB Granite model into memory only on the first call and keeps it cached for subsequent queries.
    """
    global _granite_service_instance
    if _granite_service_instance is None:
        _granite_service_instance = GraniteService()
    return _granite_service_instance
