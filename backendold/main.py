from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import openai
import os
from dotenv import load_dotenv
import asyncio
from vector_store import VectorStore
import json

load_dotenv()

app = FastAPI(title="Book RAG Chatbot API")

# CORS configuration - Allow your GitHub Pages domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your domain for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize vector store
vector_store = VectorStore()

class QuestionRequest(BaseModel):
    question: str
    selected_text: Optional[str] = None
    context_mode: str = "book"

class UploadRequest(BaseModel):
    text: str
    chunk_size: int = 1000

@app.on_event("startup")
async def startup_event():
    """Initialize vector store on startup"""
    await vector_store.initialize()
    print("Vector store initialized")

@app.get("/")
async def root():
    return {"message": "RAG Chatbot API is running"}

@app.post("/api/ask")
async def ask_question(request: QuestionRequest):
    """Main endpoint for asking questions"""
    try:
        print(f"Received question: {request.question}")
        print(f"Context mode: {request.context_mode}")
        
        if request.context_mode == "selected" and request.selected_text:
            print("Using selected text as context")
            context = request.selected_text
            sources = ["Selected Text"]
        else:
            print("Searching in vector store...")
            # Search in vector store
            search_results = await vector_store.search(request.question, limit=3)
            context = "\n\n".join([result['text'] for result in search_results])
            sources = [result.get('source', 'Book') for result in search_results]
        
        print(f"Context length: {len(context)} characters")
        
        # Generate answer using OpenAI
        answer = await generate_answer(request.question, context)
        
        return {
            "answer": answer,
            "sources": sources,
            "context_used": request.context_mode
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-book")
async def upload_book_text(request: UploadRequest):
    """Upload book text and chunk it"""
    try:
        # Split text into chunks
        chunks = []
        for i in range(0, len(request.text), request.chunk_size):
            chunk = request.text[i:i + request.chunk_size]
            chunks.append({
                "text": chunk,
                "chunk_id": i // request.chunk_size,
                "source": "uploaded_book"
            })
        
        # Store in vector database
        await vector_store.add_documents(chunks)
        
        return {
            "message": f"Book uploaded successfully. Created {len(chunks)} chunks.",
            "chunks": len(chunks)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-file")
async def upload_book_file(file: UploadFile = File(...)):
    """Upload book from file"""
    try:
        content = await file.read()
        text = content.decode('utf-8')
        
        # Split into chunks
        chunks = []
        chunk_size = 1000
        for i in range(0, len(text), chunk_size):
            chunk = text[i:i + chunk_size]
            chunks.append({
                "text": chunk,
                "chunk_id": i // chunk_size,
                "source": file.filename
            })
        
        # Store in vector database
        await vector_store.add_documents(chunks)
        
        return {
            "message": f"File uploaded successfully. Created {len(chunks)} chunks.",
            "filename": file.filename,
            "chunks": len(chunks)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status")
async def get_status():
    """Get API status"""
    return {
        "status": "running",
        "vector_store": "initialized" if vector_store.initialized else "not_initialized"
    }

async def generate_answer(question: str, context: str) -> str:
    """Generate answer using OpenAI"""
    
    system_prompt = """You are a helpful assistant that answers questions based ONLY on the provided context.
    If the context doesn't contain enough information to answer the question, say "I cannot answer this based on the available information."
    Be precise and concise in your answers."""
    
    user_prompt = f"""Context: {context}

Question: {question}

Please answer based ONLY on the context provided above."""
    
    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=500,
            temperature=0.3
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        return f"I apologize, but I encountered an error: {str(e)}"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)