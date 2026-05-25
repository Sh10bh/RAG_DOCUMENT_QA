# 📄 AskMyPDF — RAG Document Q&A

> Upload any PDF and chat with it using AI. Built with FastAPI, LangChain, ChromaDB, and Groq.

## 🌍 Live Demo
**[rag-document-qa-mauve.vercel.app](https://rag-document-qa-mauve.vercel.app)**

## 🛠️ Tech Stack
- **Frontend:** React + Vite, deployed on Vercel
- **Backend:** FastAPI + LangChain + ChromaDB + Groq (Llama-3.3-70b)
- **Embeddings:** HuggingFace (all-MiniLM-L6-v2)
- **Containerization:** Docker + Docker Compose
- **Deployment:** HuggingFace Spaces (backend) + Vercel (frontend)

## ✨ Features
- Upload any PDF up to 50MB
- AI indexes and understands the document
- Ask questions in natural language
- Get answers with source page citations
- Conversation memory across questions
- Drag and drop upload interface

## 🏗️ Architecture
- PDF Upload goes to FastAPI backend
- LangChain processes and chunks the document
- ChromaDB stores vector embeddings
- Groq Llama-3.3-70b generates answers
- Source citations returned with every answer

## 🚀 Run Locally

Clone the repo:
```bash
git clone https://github.com/Sh10bh/RAG_DOCUMENT_QA
```

Start backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Start frontend:
```bash
cd frontend
npm install
npm run dev
```

## 🐳 Run with Docker
```bash
docker-compose up --build
```

## 📊 Project Structure
```
RAG_DOCUMENT_QA/
├── backend/
│   ├── main.py          # FastAPI endpoints
│   ├── rag.py           # LangChain RAG pipeline
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadPanel.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   └── SourceCitation.jsx
│   └── Dockerfile
├── docker-compose.yml
└── notebook/
    └── rag_notebook.ipynb
```

## 👨‍💻 Author
Shubh Gupta — VIT Bhopal, CSE (2023-2027)
