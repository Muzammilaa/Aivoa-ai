from fastapi import APIRouter

from agent.graph import run_complaint_pipeline
from schemas import IntakeExtractRequest, IntakeExtractResponse


router = APIRouter(prefix="/api/intake", tags=["intake"])


@router.post("/extract", response_model=IntakeExtractResponse)
def extract_complaint(request: IntakeExtractRequest) -> IntakeExtractResponse:
    result = run_complaint_pipeline(request.text)
    return IntakeExtractResponse(
        extracted_data=result["extracted_data"],
        parsing_errors=result["parsing_errors"],
    )
