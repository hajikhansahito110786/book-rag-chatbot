import os
import openai
import numpy as np
from typing import List, Dict, Any
import hashlib
import uuid
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

class VectorStore:
    def __init__(self):
        # ===== ENV CONFIG =====
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.qdrant_url = os.getenv("QDRANT_URL")  # NO DEFAULT localhost
        self.qdrant_api_key = os.getenv("QDRANT_API_KEY")

        if not self.qdrant_url:
            raise RuntimeError("QDRANT_URL is not set")

        # ===== CLIENTS =====
        self.openai_client = openai.OpenAI(api_key=self.openai_api_key)

        self.qdrant_client = QdrantClient(
            url=self.qdrant_url,
            api_key=self.qdrant_api_key or None,
            timeout=10
        )

        self.collection_name = "book_chunks"
        self.vector_size = 1536
        self.initialized = False

        print(f"Using REMOTE Qdrant at {self.qdrant_url}")

    async def initialize(self):
        """Initialize Qdrant collection"""
        try:
            collections = self.qdrant_client.get_collections().collections
            collection_names = [c.name for c in collections]

            if self.collection_name not in collection_names:
                self.qdrant_client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=self.vector_size,
                        distance=Distance.COSINE
                    )
                )
                print(f"Created collection: {self.collection_name}")
            else:
                print(f"Using existing collection: {self.collection_name}")

            self.initialized = True
        except Exception as e:
            print(f"Could not connect to Qdrant at {self.qdrant_url}. Please check if the server is running and accessible.")
            raise RuntimeError(f"Could not connect to Qdrant. Please check your connection and firewall settings. Error: {e}")

    async def get_embedding(self, text: str) -> List[float]:
        """Create embedding"""
        response = self.openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding

    async def add_documents(self, documents: List[Dict[str, Any]]):
        if not self.initialized:
            await self.initialize()

        points = []

        for doc in documents:
            embedding = await self.get_embedding(doc["text"])

            point = PointStruct(
                id=str(uuid.uuid4()),  # SAFE UNIQUE ID
                vector=embedding,
                payload={
                    "text": doc["text"],
                    "source": doc.get("source", "unknown"),
                    "chunk_id": doc.get("chunk_id", 0)
                }
            )
            points.append(point)

        self.qdrant_client.upsert(
            collection_name=self.collection_name,
            points=points
        )

        print(f"Uploaded {len(points)} documents to Qdrant")

    async def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        if not self.initialized:
            await self.initialize()

        query_embedding = await self.get_embedding(query)

        hits = self.qdrant_client.search(
            collection_name=self.collection_name,
            query_vector=query_embedding,
            limit=limit
        )

        return [
            {
                "text": hit.payload.get("text", ""),
                "source": hit.payload.get("source", "unknown"),
                "score": hit.score
            }
            for hit in hits
        ]

    async def is_empty(self) -> bool:
        """Check if the collection is empty."""
        if not self.initialized:
            await self.initialize()
        
        count_result = self.qdrant_client.count(
            collection_name=self.collection_name, 
            exact=False
        )
        return count_result.count == 0
