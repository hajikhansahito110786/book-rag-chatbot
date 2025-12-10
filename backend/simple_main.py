from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import openai
import os
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI(title="Book RAG Chatbot API - Simple")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Simple in-memory storage
book_chunks = []
current_book_content = ""

class QuestionRequest(BaseModel):
    question: str
    selected_text: Optional[str] = None
    context_mode: str = "book"

class UploadRequest(BaseModel):
    text: str

@app.get("/")
async def root():
    return {"message": "Simple RAG Chatbot API is running"}

@app.post("/api/ask")
async def ask_question(request: QuestionRequest):
    """Simple question answering without vector store"""
    try:
        print(f"Question: {request.question}")
        print(f"Mode: {request.context_mode}")
        
        if request.context_mode == "selected" and request.selected_text:
            print("Using selected text")
            context = request.selected_text
            source = "Selected Text"
        else:
            print("Using entire book content")
            context = current_book_content[:5000]  # Limit context size
            source = "Book Content"
        
        # Generate answer
        answer = await generate_answer(request.question, context)
        
        return {
            "answer": answer,
            "sources": [source],
            "context_used": request.context_mode
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-book")
async def upload_book_text(request: UploadRequest):
    """Upload book text"""
    try:
        global current_book_content
        current_book_content = request.text
        
        return {
            "message": "Book uploaded successfully",
            "length": len(request.text)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status")
async def get_status():
    """Get API status"""
    return {
        "status": "running",
        "book_length": len(current_book_content)
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
        response = client.chat.completions.create(
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