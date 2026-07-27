from sqlalchemy import Column, Integer, String, Text, Date, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, autoincrement=True)
    complaint_source = Column(String)
    customer_name = Column(String)
    product_name = Column(String)
    product_strength_grade = Column(String)
    batch_lot_number = Column(String)
    manufacturing_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    quantity_affected = Column(String)
    complaint_type = Column(String)
    complaint_date = Column(Date)
    description = Column(Text)
    initial_severity = Column(String)
    priority = Column(String)
    status = Column(String, default="Pending Triage")
    raw_input_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
