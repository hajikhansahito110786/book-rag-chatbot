from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import openai
import os
from dotenv import load_dotenv
import json
import asyncio # Import asyncio
import pkg_resources
from vector_store import VectorStore # Import VectorStore
from book_ingester import DocusaurusPageDiscoverer, ingest_docusaurus_book, chunk_content # Import ingester functions

load_dotenv()

app = FastAPI(title="Book RAG Chatbot API") # Changed title for consistency

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

# Initialize VectorStore
vector_store: Optional[VectorStore] = None

@app.on_event("startup")
async def startup_event():
    global vector_store

    try:
        vector_store = VectorStore()
        await vector_store.initialize()

        # Check if the vector store is empty and seed it if it is
        if await vector_store.is_empty():
            print("Vector store is empty. Seeding with initial data...")
            try:
                seed_data_path = os.path.join(os.path.dirname(__file__), "seed_data.json")
                with open(seed_data_path, "r") as f:
                    seed_data = json.load(f)                
                await vector_store.add_documents(seed_data)
                print("Successfully seeded the vector store with initial data.")
            except FileNotFoundError:
                print("Could not find seed_data.json. Skipping seeding process.")
            except Exception as e:
                import traceback
                print(f"An error occurred during seeding: {e}")
                traceback.print_exc() # Print full traceback
    except Exception as e:
        import traceback
        print(f"Error during VectorStore initialization or startup event: {e}")
        traceback.print_exc() # Print full traceback

class QuestionRequest(BaseModel):
    question: str
    selected_text: Optional[str] = None
    context_mode: str = "book"

class IngestRequest(BaseModel):
    base_url: Optional[str] = None
    chunk_size: int = 1000

@app.get("/")
async def root():
    return {"message": "Book RAG Chatbot API is running"}

@app.post("/api/ask")
async def ask_question(request: QuestionRequest):
    """Answers a question using RAG from the vector store or selected text."""
    try:
        print(f"Question: {request.question}")
        print(f"Mode: {request.context_mode}")
        
        context = ""
        sources = []
        
        if request.context_mode == "selected" and request.selected_text:
            print("Using selected text")
            context = request.selected_text
            sources.append("Selected Text")
        elif vector_store:
            print("Searching vector store for relevant context...")
            search_results = await vector_store.search(request.question, limit=5)
            
            if search_results:
                context_texts = [result['text'] for result in search_results]
                sources = list(set([f"{result.get('source', 'Unknown')} (URL: {result.get('url', 'N/A')})" for result in search_results]))
                context = "\n\n".join(context_texts)
                print(f"Retrieved {len(search_results)} chunks from vector store.")
            else:
                context = "No relevant information found in the knowledge base."
                sources.append("No specific sources found.")
        else:
            context = "Vector store not initialized. Cannot retrieve context."
            sources.append("System Error")
            
        # Ensure context length doesn't exceed LLM limits
        MAX_CONTEXT_LENGTH = 8000 # Adjust based on chosen LLM model and token limits
        if len(context) > MAX_CONTEXT_LENGTH:
            context = context[:MAX_CONTEXT_LENGTH] + "..."
        
        # Generate answer
        answer = await generate_answer(request.question, context)
        
        return {
            "answer": answer,
            "sources": sources,
            "context_used": request.context_mode
        }
        
    except Exception as e:
        import traceback
        print(f"Error type: {type(e)}")
        print(f"Error message: {e}")
        print(f"Error in ask_question: {str(e)}")
        traceback.print_exc() # Print full traceback
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ingest-docs")
async def ingest_documents(request: IngestRequest):
    """
    Ingests Docusaurus documentation into the vector store.
    """
    if not vector_store:
        raise HTTPException(status_code=503, detail="Vector store not initialized.")

    try:
        # Discover pages
        discoverer = DocusaurusPageDiscoverer(project_root=os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
        page_paths = discoverer.discover_pages()
        print(f"Discovered {len(page_paths)} pages: {page_paths}")

        # Scrape and chunk content from local files
        scraped_content = await ingest_docusaurus_book(discoverer.project_root, page_paths)
        chunks = chunk_content(scraped_content, request.chunk_size)
        print(f"Generated {len(chunks)} chunks.")

        if not chunks:
            return {"message": "No content was ingested.", "chunks_count": 0}

        # Add to vector store
        await vector_store.add_documents(chunks)
        
        return {"message": f"Successfully ingested {len(chunks)} chunks.", "chunks_count": len(chunks)}

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error during ingestion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error during ingestion: {str(e)}")

@app.get("/api/status")
async def get_status():
    """Get API status and vector store status"""
    if vector_store:
        return {
            "status": "running",
            "vector_store_initialized": vector_store.initialized,
            "vector_store_mode": "local" if vector_store.use_local else "qdrant",
            "qdrant_url": vector_store.qdrant_url if not vector_store.use_local else None
        }
    return {
        "status": "running",
        "vector_store_initialized": False,
        "vector_store_mode": "unknown"
    }

async def generate_answer(question: str, context: str) -> str:
    """Generate answer using OpenAI"""
    
    system_prompt = """You are Docus, a friendly and helpful assistant. Your goal is to answer questions based ONLY on the provided context.
    You must be very clear with the user that you can only answer questions about the documents you have been given.
    If the context doesn't contain enough information to answer the question, you should say so in a friendly and helpful way.
    For example, you could say "I'm sorry, as Docus, my knowledge is limited to the documents I've been given. I couldn't find any information about that topic. Is there a question about the provided documents I can help with?".
    Never try to answer a question if the information is not in the context."""
    
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
        return f"I seem to be having some trouble thinking right now. Please try again in a moment. (Error: {str(e)})"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
