import requests
import json
import os
import time

# Test the API
BASE_URL = "http://localhost:8000"
DOCUSAURUS_BASE_URL = os.getenv("BOOK_RAG_TEST_DOCUSAURUS_URL", "https://hajikhansahito110786.github.io/aiproject1/")

def test_status():
    print("\n--- Testing /api/status ---")
    response = requests.get(f"{BASE_URL}/api/status")
    response.raise_for_status()
    data = response.json()
    print("Status response:", data)
    assert data["status"] == "running"
    assert "vector_store_initialized" in data
    assert "vector_store_mode" in data
    print("Status test passed.")

def test_ingest_docs():
    print(f"\n--- Testing /api/ingest-docs with URL: {DOCUSAURUS_BASE_URL} ---")
    if not DOCUSAURUS_BASE_URL:
        print("Skipping ingest test: BOOK_RAG_TEST_DOCUSAURUS_URL not set.")
        return

    response = requests.post(
        f"{BASE_URL}/api/ingest-docs",
        json={
            "base_url": DOCUSAURUS_BASE_URL,
            "chunk_size": 1000
        }
    )
    response.raise_for_status()
    data = response.json()
    print("Ingest response:", data)
    assert "message" in data
    assert "chunks_count" in data
    assert data["chunks_count"] > 0
    print(f"Ingested {data['chunks_count']} chunks. Ingest test passed.")
    # Give Qdrant/vector store some time to process if not local
    time.sleep(5)

def test_ask_with_rag():
    print("\n--- Testing /api/ask with RAG (context_mode=book) ---")
    question = "What is Docusaurus?"
    
    response = requests.post(
        f"{BASE_URL}/api/ask",
        json={
            "question": question,
            "context_mode": "book"
        }
    )
    response.raise_for_status()
    data = response.json()
    print("Ask RAG response:", data)
    assert "answer" in data
    assert "sources" in data
    assert data["answer"] != "I cannot answer this based on the available information."
    assert len(data["sources"]) > 0
    # Check for URL format in sources
    if len(data["sources"]) > 0:
        assert "URL:" in data["sources"][0]
    print("Ask RAG test passed.")

def test_ask_with_selected_text():
    print("\n--- Testing /api/ask with selected_text ---")
    selected_text = "Docusaurus is a static site generator that helps you build optimized websites quickly."
    question = "What kind of tool is Docusaurus?"

    response = requests.post(
        f"{BASE_URL}/api/ask",
        json={
            "question": question,
            "context_mode": "selected",
            "selected_text": selected_text
        }
    )
    response.raise_for_status()
    data = response.json()
    print("Ask Selected Text response:", data)
    assert "answer" in data
    assert "sources" in data
    assert "Docusaurus" in data["answer"]
    assert "Selected Text" in data["sources"]
    print("Ask Selected Text test passed.")

if __name__ == "__main__":
    print("Starting API tests...")
    # It's important to run tests in order for dependencies
    # First, check status to ensure API is up
    test_status()
    
    # Then ingest documents
    try:
        test_ingest_docs()
    except Exception as e:
        print(f"Ingestion failed, subsequent RAG tests might be affected: {e}")
    
    # Then ask questions using RAG
    test_ask_with_rag()
    test_ask_with_selected_text()
    
    print("\nAll API tests completed.")