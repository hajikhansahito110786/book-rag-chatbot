import os
import openai
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import numpy as np

class VectorStore:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        self.qdrant_api_key = os.getenv("QDRANT_API_KEY", "")

        self.client = openai.OpenAI(api_key=self.openai_api_key)

        # Default: try Qdrant, fall back to local lists
        self.use_local = False
        self.collection_name = "book_chunks"
        self.qdrant_client = None

        # Local storage structures (MUST exist if you use them later)
        self.documents = []          # list[dict] or list[str]
        self.embeddings = []         # list[list[float]]

    async def initialize(self):
        try:
            self.qdrant_client = QdrantClient(
                url=self.qdrant_url,
                api_key=self.qdrant_api_key or None,
            )
            # Ping or list collections to verify connection
            self.qdrant_client.get_collections()

            print(f"Using Qdrant at {self.qdrant_url}")
            # Create collection if needed
            if self.collection_name not in [
                c.name for c in self.qdrant_client.get_collections().collections
            ]:
                self.qdrant_client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=1536,  # adjust to your embedding model
                        distance=Distance.COSINE,
                    ),
                )
        except Exception as e:
            print(f"Could not connect to Qdrant: {e}")
            print("Falling back to local storage")
            self.use_local = True

    async def add_document(self, doc_id: str, text: str, metadata: dict | None = None):
        metadata = metadata or {}
        emb = self.client.embeddings.create(
            model="text-embedding-3-small",
            input=text,
        )
        vector = emb.data[0].embedding

        if self.use_local:
            self.documents.append({"id": doc_id, "text": text, "metadata": metadata})
            self.embeddings.append(vector)
            return

        point = PointStruct(
            id=doc_id,
            vector=vector,
            payload={"text": text, **metadata},
        )
        self.qdrant_client.upsert(
            collection_name=self.collection_name,
            points=[point],
        )

    async def search(self, query: str, top_k: int = 5):
        emb = self.client.embeddings.create(
            model="text-embedding-3-small",
            input=query,
        )
        query_vec = emb.data[0].embedding

        if self.use_local:
            if not self.embeddings:
                return []
            vectors = np.array(self.embeddings)
            q = np.array(query_vec)
            # cosine similarity
            norms = np.linalg.norm(vectors, axis=1) * np.linalg.norm(q)
            sims = (vectors @ q) / (norms + 1e-10)
            idxs = np.argsort(-sims)[:top_k]
            results = []
            for i in idxs:
                results.append({
                    "score": float(sims[i]),
                    "payload": self.documents[i],
                })
            return results

        hits = self.qdrant_client.search(
            collection_name=self.collection_name,
            query_vector=query_vec,
            limit=top_k,
        )
        return hits