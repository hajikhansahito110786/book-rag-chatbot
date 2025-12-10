import os
import openai
import numpy as np
from typing import List, Dict, Any
import hashlib
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import asyncio

class VectorStore:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        self.qdrant_api_key = os.getenv("QDRANT_API_KEY", "")
        
        # Initialize OpenAI client
        self.client = openai.OpenAI(api_key=self.openai_api_key)
        
        # Use local storage if no Qdrant URL provided
        if not self.qdrant_url.startswith("http"):
            self.use_local = True
            self.collection_name = "book_chunks"
            self.documents = []
            self.embeddings = []
            print("Using local vector storage")
        else:
            self.use_local = False
            self.qdrant_client = QdrantClient(
                url=self.qdrant_url,
                api_key=self.qdrant_api_key if self.qdrant_api_key else None
            )
            self.collection_name = "book_chunks"
            print(f"Using Qdrant at {self.qdrant_url}")
        
        self.initialized = False
    
    async def initialize(self):
        """Initialize vector store"""
        if not self.use_local:
            try:
                # Try to get existing collections
                collections = self.qdrant_client.get_collections()
                collection_names = [col.name for col in collections.collections]
                
                if self.collection_name not in collection_names:
                    # Create new collection
                    self.qdrant_client.create_collection(
                        collection_name=self.collection_name,
                        vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
                    )
                    print(f"Created new collection: {self.collection_name}")
                else:
                    print(f"Using existing collection: {self.collection_name}")
                    
            except Exception as e:
                print(f"Could not connect to Qdrant: {e}")
                print("Falling back to local storage")
                self.use_local = True
        
        self.initialized = True
        return True
    
    async def get_embedding(self, text: str) -> List[float]:
        """Get embedding from OpenAI"""
        try:
            response = self.client.embeddings.create(
                model="text-embedding-ada-002",
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error getting embedding: {e}")
            # Return random embedding as fallback
            return list(np.random.randn(1536))
    
    async def add_documents(self, documents: List[Dict[str, Any]]):
        """Add documents to vector store"""
        if not self.initialized:
            await self.initialize()
        
        print(f"Adding {len(documents)} documents to vector store...")
        
        if self.use_local:
            # Store locally
            for doc in documents:
                embedding = await self.get_embedding(doc['text'])
                self.documents.append(doc)
                self.embeddings.append(embedding)
            print(f"Added {len(documents)} documents to local storage")
        else:
            # Store in Qdrant
            points = []
            for i, doc in enumerate(documents):
                embedding = await self.get_embedding(doc['text'])
                
                # Create unique ID
                doc_hash = hashlib.md5(doc['text'].encode()).hexdigest()[:16]
                
                point = PointStruct(
                    id=i,
                    vector=embedding,
                    payload={
                        "text": doc['text'],
                        "source": doc.get('source', 'unknown'),
                        "chunk_id": doc.get('chunk_id', 0),
                        "doc_hash": doc_hash
                    }
                )
                points.append(point)
            
            # Upload to Qdrant
            self.qdrant_client.upsert(
                collection_name=self.collection_name,
                points=points
            )
            print(f"Uploaded {len(points)} documents to Qdrant")
    
    async def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search for similar documents"""
        if not self.initialized:
            await self.initialize()
        
        # Get query embedding
        query_embedding = await self.get_embedding(query)
        
        if self.use_local:
            # Local similarity search (simple cosine similarity)
            if not self.embeddings:
                return []
            
            # Convert to numpy arrays
            query_vec = np.array(query_embedding)
            doc_vecs = np.array(self.embeddings)
            
            # Calculate cosine similarities
            similarities = np.dot(doc_vecs, query_vec) / (
                np.linalg.norm(doc_vecs, axis=1) * np.linalg.norm(query_vec)
            )
            
            # Get top matches
            top_indices = np.argsort(similarities)[-limit:][::-1]
            
            results = []
            for idx in top_indices:
                if idx < len(self.documents):
                    results.append({
                        "text": self.documents[idx]['text'],
                        "source": self.documents[idx].get('source', 'local'),
                        "score": float(similarities[idx])
                    })
            
            return results
        
        else:
            # Search in Qdrant
            search_result = self.qdrant_client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                limit=limit
            )
            
            results = []
            for hit in search_result:
                results.append({
                    "text": hit.payload.get("text", ""),
                    "source": hit.payload.get("source", "unknown"),
                    "score": hit.score
                })
            
            return results