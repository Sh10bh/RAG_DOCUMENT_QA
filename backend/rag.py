import os
import uuid
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.runnables import RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from langchain_community.chat_message_histories import ChatMessageHistory

load_dotenv()

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
llm = ChatGroq(
    model_name="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY")
)

store = {}

def get_session_history(session_id: str):
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]

def process_pdf(file_path: str) -> str:
    """Load PDF → split → embed → store in ChromaDB. Returns session_id."""
    session_id = str(uuid.uuid4())
    chroma_path = f"./chroma_sessions/{session_id}"

    loader = PyPDFLoader(file_path)
    pages = loader.load()
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_documents(pages)

    Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=chroma_path
    )

    return session_id

def answer_question(session_id: str, question: str) -> dict:
    """Load ChromaDB for session → retrieve → answer with memory."""
    chroma_path = f"./chroma_sessions/{session_id}"

    # Check if session exists
    if not os.path.exists(chroma_path):
        raise ValueError(f"Session {session_id} not found. Please upload a PDF first.")

    vectorstore = Chroma(
        persist_directory=chroma_path,
        embedding_function=embeddings
    )

    # Check if vectorstore has documents
    if vectorstore._collection.count() == 0:
        raise ValueError("Vector store is empty. PDF may not have been processed correctly.")

    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant. Use the following context to answer.\n\nContext: {context}"),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{question}")
    ])

    def get_context(input_dict):
        docs = retriever.invoke(input_dict["question"])
        return {
            "context": "\n\n".join([d.page_content for d in docs]),
            "question": input_dict["question"],
            "chat_history": input_dict.get("chat_history", [])
        }

    chain = RunnableWithMessageHistory(
        RunnableLambda(get_context) | prompt | llm | StrOutputParser(),
        get_session_history,
        input_messages_key="question",
        history_messages_key="chat_history"
    )

    answer = chain.invoke(
        {"question": question},
        config={"configurable": {"session_id": session_id}}
    )

    docs = retriever.invoke(question)
    sources = list(set([doc.metadata.get("page", 0) + 1 for doc in docs]))

    return {
        "answer": answer,
        "sources": sources
    }
