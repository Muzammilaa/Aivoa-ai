from sqlalchemy.orm import Session

from models import Complaint
from schemas import ComplaintCreate


def create_complaint(db: Session, complaint_data: ComplaintCreate) -> Complaint:
    complaint = Complaint(**complaint_data.dict())
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint


def get_complaint(db: Session, complaint_id: int) -> Complaint | None:
    return db.query(Complaint).filter(Complaint.id == complaint_id).first()


def list_complaints(db: Session) -> list[Complaint]:
    return db.query(Complaint).order_by(Complaint.id).all()
