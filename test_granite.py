import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

MODEL_PATH = "./models/granite-4.0-1b"

print(f"Loading tokenizer from local path: {MODEL_PATH}...")
tokenizer = AutoTokenizer.from_pretrained(
    MODEL_PATH,
    local_files_only=True
)

print(f"Loading Granite 4.0 1B model from {MODEL_PATH}...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    local_files_only=True,
    torch_dtype="auto",
    device_map="auto"
)
model.eval()

print("Model loaded successfully on:", model.device)

messages = [
    {
        "role": "system",
        "content": (
            "You are DoxFin, a financial document analysis assistant. "
            "Give clear and concise financial explanations."
        )
    },
    {
        "role": "user",
        "content": "Explain the difference between Operating Cash Flow and Free Cash Flow in 2 sentences."
    }
]

model_inputs = tokenizer.apply_chat_template(
    messages,
    tokenize=True,
    add_generation_prompt=True,
    return_tensors="pt"
)

print("\nGenerating sample financial explanation...")
with torch.no_grad():
    if isinstance(model_inputs, torch.Tensor):
        input_ids = model_inputs.to(model.device)
        input_len = input_ids.shape[1]
        outputs = model.generate(
            input_ids,
            max_new_tokens=150,
            temperature=0.2,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )
    else:
        model_inputs = model_inputs.to(model.device)
        input_len = model_inputs["input_ids"].shape[1]
        outputs = model.generate(
            **model_inputs,
            max_new_tokens=150,
            temperature=0.2,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )

response = tokenizer.decode(outputs[0][input_len:], skip_special_tokens=True)
print("\n--- Granite 4.0 1B Local Inference Response ---")
print(response.strip())
