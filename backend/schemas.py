from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class IntakeExtractRequest(BaseModel):
    text: str


class IntakeExtractResponse(BaseModel):
    extracted_data: dict[str, object]
    parsing_errors: list[str]


class ComplaintCreate(BaseModel):
    complaint_source: str
    customer_name: str
    product_name: str
    product_strength_grade: str
    batch_lot_number: str
    manufacturing_date: date | None = None
    expiry_date: date | None = None
    quantity_affected: str
    complaint_type: str
    complaint_date: date
    description: str
    initial_severity: str
    priority: str
    status: str = "Pending Triage"
    raw_input_text: str | None = None


class ComplaintResponse(ComplaintCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
