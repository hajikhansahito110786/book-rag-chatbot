import requests
import json

# Test the API
BASE_URL = "http://localhost:8000"

def test_status():
    response = requests.get(f"{BASE_URL}/api/status")
    print("Status:", response.json())

def test_upload():
    sample_book = """
    Artificial Intelligence (AI) is the simulation of human intelligence in machines.
    Machine Learning is a subset of AI that allows computers to learn without explicit programming.
    Deep Learning uses neural networks with many layers to learn from data.
    """
    
    response = requests.post(
        f"{BASE_URL}/api/upload-book",
        json={"text": sample_book}
    )
    print("Upload:", response.json())

def test_ask():
    question = "What is Machine Learning?"
    
    response = requests.post(
        f"{BASE_URL}/api/ask",
        json={
            "question": question,
            "context_mode": "book"
        }
    )
    print("Ask:", response.json())

if __name__ == "__main__":
    print("Testing API...")
    test_status()
    test_upload()
    test_ask()