import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag import process_pdf, answer_question

app = FastAPI(title="RAG Document QA API")

# CORS — allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:3000",      # React dev server
    "http://localhost:5173",      # Vite dev server
    "http://localhost:80",        # Docker nginx
    "http://localhost",           # Docker nginx (no port)
    "https://your-app.vercel.app" # Production (update later)
    "https://sh10bh-rag-document-qa-backend.hf.space",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
MAX_FILE_SIZE_MB = 50
ALLOWED_EXTENSION = ".pdf"

class QuestionRequest(BaseModel):
    session_id: str
    question: str

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "RAG API is running"}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    # Validate file extension
    if not file.filename.endswith(ALLOWED_EXTENSION):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    # Validate file size
    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE_MB}MB"
        )

    # Save temporarily
    temp_path = f"./temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            buffer.write(contents)

        session_id = process_pdf(temp_path)

        return {
            "session_id": session_id,
            "filename": file.filename,
            "size_mb": round(size_mb, 2),
            "message": "PDF processed successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing PDF: {str(e)}"
        )
    finally:
        # Always clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/ask")
def ask_question(request: QuestionRequest):
    if not request.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty"
        )

    if not request.session_id.strip():
        raise HTTPException(
            status_code=400,
            detail="Session ID cannot be empty"
        )

    try:
        result = answer_question(request.session_id, request.question)
        return {
            "question": request.question,
            "answer": result["answer"],
            "sources": result["sources"]
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating answer: {str(e)}"
        )