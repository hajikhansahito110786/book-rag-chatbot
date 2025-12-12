from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import openai
import os
import json
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Docusaurus Book RAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://hajikhansahito110786.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Load book content
BOOK_CONTENT = {}
try:
    with open('book_chunks.json', 'r', encoding='utf-8') as f:
        book_chunks = json.load(f)
        # Create searchable content
        for chunk in book_chunks:
            BOOK_CONTENT[chunk['chunk_id']] = chunk
    print(f"Loaded {len(BOOK_CONTENT)} book chunks")
except:
    print("No book chunks found. Using empty content.")
    BOOK_CONTENT = {}

class QuestionRequest(BaseModel):
    question: str
    selected_text: Optional[str] = None
    context_mode: str = "book"

@app.get("/")
async def root():
    return {"message": "Docusaurus Book RAG API", "chunks_loaded": len(BOOK_CONTENT)}

@app.post("/api/ask")
async def ask_question(request: QuestionRequest):
    try:
        if request.context_mode == "selected" and request.selected_text:
            # Use selected text
            context = request.selected_text
            sources = ["Selected Text"]
        else:
            # Search in book content
            relevant_chunks = search_book_content(request.question, limit=3)
            context = "\n\n".join([chunk['text'] for chunk in relevant_chunks])
            sources = list(set([chunk['source'] for chunk in relevant_chunks]))
        
        # Generate answer
        answer = await generate_answer(request.question, context)
        
        return {
            "answer": answer,
            "sources": sources,
            "context_used": request.context_mode
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def search_book_content(query, limit=3):
    """
    Simple semantic search (for production, use vector database)
    """
    # For now, return first few chunks
    # In production, implement proper semantic search
    chunks = list(BOOK_CONTENT.values())
    return chunks[:limit]

async def generate_answer(question, context):
    system_prompt = """You are a helpful assistant that answers questions about the book content.
    The book is about AI, Docusaurus, and related technologies.
    Answer based ONLY on the provided context."""
    
    prompt = f"""Book Context: {context}

Question: {question}

Please provide a helpful answer based only on the book context above."""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.3
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating answer: {str(e)}"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)