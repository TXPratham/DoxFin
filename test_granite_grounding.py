import sys
from pathlib import Path

# Ensure project root and backend are in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from backend.app.services.granite_service import GraniteService
from backend.app.prompts.financial_qa import DOXFIN_SYSTEM_PROMPT


granite = GraniteService()


# Shared Grounded Context (Verified Metrics + Document Evidence)
context = """
VERIFIED FINANCIAL METRICS

Revenue Growth: +12.4%
Net Profit Growth: +8.7%
Operating Cash Flow Growth: -14.2%
Trade Receivables Growth: +23.1%


DOCUMENT EVIDENCE

[EVIDENCE 1]
Page: 151
Section: Cash Flow Statement

Operating cash flow declined during FY2025.


[EVIDENCE 2]
Page: 178
Section: Trade Receivables

Trade receivables increased significantly during FY2025.


[EVIDENCE 3]
Page: 82
Section: Management Discussion & Analysis

Higher working capital requirements affected cash generation.
"""

print("=" * 70)
print("DOXFIN GROUNDING TESTS: IBM GRANITE 4.0 1B")
print("=" * 70)

# ---------------------------------------------------------
# TEST 1: Supported Question
# ---------------------------------------------------------
question_1 = "Why did operating cash flow decline?"
prompt_1 = f"""
USER QUESTION

{question_1}


{context}


Answer the user's question using only the supplied evidence
and verified financial metrics.
"""

print("\n" + "-" * 70)
print("TEST 1: Supported Question")
print(f"Question: {question_1}")
print("-" * 70)

answer_1 = granite.generate(
    system_prompt=DOXFIN_SYSTEM_PROMPT,
    user_prompt=prompt_1
)
print("\n>>> GRANITE RESPONSE (TEST 1):")
print(answer_1.strip())


# ---------------------------------------------------------
# TEST 2: Unsupported Question (Insufficient Evidence)
# ---------------------------------------------------------
question_2 = "Why did the company acquire another company during FY2025?"
prompt_2 = f"""
USER QUESTION

{question_2}


{context}


Answer the user's question using only the supplied evidence
and verified financial metrics.
"""

print("\n" + "-" * 70)
print("TEST 2: Unsupported Question (No Acquisition Data)")
print(f"Question: {question_2}")
print("-" * 70)

answer_2 = granite.generate(
    system_prompt=DOXFIN_SYSTEM_PROMPT,
    user_prompt=prompt_2
)
print("\n>>> GRANITE RESPONSE (TEST 2):")
print(answer_2.strip())
print("\n" + "=" * 70)
