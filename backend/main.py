import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag import process_pdf, answer_question

app = FastAPI(title="RAG Document QA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    session_id: str
    question: str

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "RAG API is running"}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    # Validate file type
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    temp_path = f"./temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    session_id = process_pdf(temp_path)

    os.remove(temp_path)

    return {
        "session_id": session_id,
        "filename": file.filename,
        "message": "PDF processed successfully"
    }

@app.post("/ask")
def ask_question(request: QuestionRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    result = answer_question(request.session_id, request.question)

    return {
        "question": request.question,
        "answer": result["answer"],
        "sources": result["sources"]
    }