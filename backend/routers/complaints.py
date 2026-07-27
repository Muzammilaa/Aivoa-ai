from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import crud
from database import get_db
from schemas import ComplaintCreate, ComplaintResponse


router = APIRouter(prefix="/api/complaints", tags=["complaints"])


@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    complaint_data: ComplaintCreate,
    db: Session = Depends(get_db),
) -> ComplaintResponse:
    return crud.create_complaint(db, complaint_data)


@router.get("", response_model=list[ComplaintResponse])
def list_complaints(db: Session = Depends(get_db)) -> list[ComplaintResponse]:
    return crud.list_complaints(db)


@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
) -> ComplaintResponse:
    complaint = crud.get_complaint(db, complaint_id)
    if complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )
    return complaint
