import json
import re
from typing import Any

from agent.llm import GROQ_MODEL, create_groq_client
from agent.state import ComplaintState


EXTRACTED_FIELDS = (
    "complaint_source",
    "customer_name",
    "product_name",
    "product_strength_grade",
    "batch_lot_number",
    "manufacturing_date",
    "expiry_date",
    "quantity_affected",
    "complaint_type",
    "complaint_date",
    "description",
    "initial_severity",
    "priority",
)

EXTRACTION_PROMPT = """Return one compact JSON object with exactly these keys:
complaint_source, customer_name, product_name, product_strength_grade,
batch_lot_number, manufacturing_date, expiry_date, quantity_affected,
complaint_type, complaint_date, description, initial_severity, priority.

Use null for missing information. Never invent values. Normalize an explicit issue to a
short complaint_type such as discoloration, leakage, broken tablets, contamination, or
labelling issue. Summarize description in 20 words or fewer. Return JSON only: no markdown,
comments, explanations, or code fences.

Complaint:
"""


def _empty_extracted_data() -> dict[str, Any]:
    return {field: None for field in EXTRACTED_FIELDS}


def _strip_code_fences(response_text: str) -> str:
    stripped = response_text.strip()
    match = re.fullmatch(r"```(?:json)?\s*(.*?)\s*```", stripped, re.DOTALL | re.IGNORECASE)
    return match.group(1).strip() if match else stripped


def _parse_response(response_text: str) -> tuple[dict[str, Any], list[str]]:
    if not response_text.strip():
        return _empty_extracted_data(), [
            "Groq returned an empty response content. "
            "The model may have used its output budget for reasoning."
        ]

    try:
        parsed = json.loads(_strip_code_fences(response_text))
    except (json.JSONDecodeError, TypeError) as error:
        return _empty_extracted_data(), [f"Unable to parse AI response as JSON: {error}"]

    if not isinstance(parsed, dict):
        return _empty_extracted_data(), ["AI response JSON must be an object"]

    return {field: parsed.get(field) for field in EXTRACTED_FIELDS}, []


def extract_fields_node(state: ComplaintState) -> dict[str, Any]:
    """Call Groq and safely convert its response into the extraction state."""
    try:
        client = create_groq_client()
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": EXTRACTION_PROMPT},
                {"role": "user", "content": state["raw_input"]},
            ],
            temperature=0,
            max_completion_tokens=800,
            response_format={"type": "json_object"},
            include_reasoning=False,
        )
        message = response.choices[0].message
        ai_response = message.content or ""
        if not ai_response.strip() and getattr(message, "reasoning", None):
            return {
                "extracted_data": _empty_extracted_data(),
                "parsing_errors": [
                    "Groq returned reasoning but no answer content. "
                    "Check the Groq SDK version and reasoning configuration."
                ],
                "ai_response": "",
            }
    except Exception as error:
        return {
            "extracted_data": _empty_extracted_data(),
            "parsing_errors": [f"AI extraction failed: {error}"],
            "ai_response": "",
        }

    extracted_data, parsing_errors = _parse_response(ai_response)
    return {
        "extracted_data": extracted_data,
        "parsing_errors": parsing_errors,
        "ai_response": ai_response,
    }
