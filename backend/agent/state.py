from typing import Any, TypedDict


class ComplaintState(TypedDict):
    raw_input: str
    extracted_data: dict[str, Any]
    parsing_errors: list[str]
    ai_response: str
    metadata: dict[str, Any]
