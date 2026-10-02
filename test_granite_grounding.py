import sys
from pathlib import Path

# Ensure project root and backend are in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from backend.app.services.granite_service import GraniteService
from backend.app.prompts.financial_qa import DOXFIN_SYSTEM_PROMPT


granite = GraniteService()


evidence = """
VERIFIED FINANCIAL METRICS

Revenue Growth: +12.4%
Net Profit Growth: +8.7%
Operating Cash Flow Growth: -14.2%
Trade Receivables Growth: +23.1%


DOCUMENT EVIDENCE

[Page 151 - Cash Flow Statement]
Operating cash flow declined during FY2025.

[Page 178 - Trade Receivables]
Trade receivables increased significantly during FY2025.

[Page 82 - Management Discussion]
Higher working capital requirements affected cash generation.
"""


question = """
Why did operating cash flow decline?
"""


prompt = f"""
USER QUESTION

{question}


{evidence}


Answer the user's question using only the supplied evidence
and verified financial metrics.
"""


answer = granite.generate(
    system_prompt=DOXFIN_SYSTEM_PROMPT,
    user_prompt=prompt
)


print("\n--- DOXFIN GRANITE RESPONSE ---\n")
print(answer)
