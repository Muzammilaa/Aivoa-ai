from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
from models import Base
from routers.complaints import router as complaints_router
from routers.intake import router as intake_router

app = FastAPI(title="AIVOA Complaint Management System")

# Create the local database schema when the application starts.
Base.metadata.create_all(bind=engine)

# CORS configuration for Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaints_router)
app.include_router(intake_router)

@app.get("/")
async def root():
    return {"message": "AIVOA Complaint Management System API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
