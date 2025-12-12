import os
import json
import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Any
import re
import asyncio # Add asyncio for potential async operations later

class DocusaurusPageDiscoverer:
    def __init__(self, project_root: str = "../"):
        self.project_root = project_root
        self._chapter_dir_mapping = self._build_chapter_dir_mapping()

    def _build_chapter_dir_mapping(self) -> Dict[str, str]:
        mapping = {}
        chapters_path = os.path.join(self.project_root, 'docs', 'chapters')
        if os.path.exists(chapters_path) and os.path.isdir(chapters_path):
            for entry in os.listdir(chapters_path):
                full_path = os.path.join(chapters_path, entry)
                if os.path.isdir(full_path):
                    # Expecting format like "01-introduction", "02-mathematical-foundations"
                    match = re.match(r'^\d{2}-(.*)$', entry)
                    if match:
                        slug = match.group(1)
                        mapping[slug] = entry
        return mapping

    def _extract_paths_from_sidebar(self, sidebar_file_content: str) -> List[str]:
        paths = []
        # Look for strings like 'type: "doc", id: "path/to/doc"'
        # This regex now correctly captures the path without the trailing '"' or '.mdx?'
        doc_id_pattern = re.compile(r'id:\s*["\'](.*?)(?:["\']|\.mdx?["\'])')
        paths.extend(doc_id_pattern.findall(sidebar_file_content))

        # Look for strings that look like direct paths within arrays, e.g., ['path/to/doc']
        # This regex also correctly captures the path
        direct_path_pattern = re.compile(r'["\'](.*?)(?:["\']|\.mdx?["\'])')
        paths.extend(direct_path_pattern.findall(sidebar_file_content))
        
        unique_paths = []
        for p in paths:
            # Filter out empty paths, external links, anchors, and .mdx files (for now)
            if not p or p.startswith('/') or p.startswith('#') or p.endswith('.mdx'):
                continue

            # Docusaurus doc IDs often implicitly refer to files under 'docs/'
            # If a path doesn't start with 'docs/' or 'chapters/', assume it's under 'docs/'
            if not p.startswith('docs/') and not p.startswith('chapters/'):
                p_processed = f"docs/{p}"
            else:
                p_processed = p

            # Clean up path by removing trailing slash if present
            clean_p = p_processed.rstrip('/')
            
            final_fs_path_parts = clean_p.split('/')
            
            # Apply chapter mapping for the second part of the path (the slug)
            if final_fs_path_parts[0] == 'chapters' and len(final_fs_path_parts) > 1:
                chapter_slug = final_fs_path_parts[1]
                if chapter_slug in self._chapter_dir_mapping:
                    final_fs_path_parts[1] = self._chapter_dir_mapping[chapter_slug]
                else:
                    print(f"Warning: Chapter slug '{chapter_slug}' not found in mapping. Skipping: {p}")
                    continue
            
            # Reconstruct the path and append .md
            reconstructed_path = '/'.join(final_fs_path_parts)
            
            # Handle '/index' specifically if it's the last part of the reconstructed path
            if reconstructed_path.endswith('/index'):
                # Transform 'docs/chapters/01-introduction/index' to 'docs/chapters/01-introduction/index.md'
                final_fs_path = f"{reconstructed_path}.md"
            else:
                final_fs_path = f"{reconstructed_path}.md"

            unique_paths.append(final_fs_path)
        
        return sorted(list(set([p for p in unique_paths if p and not p.startswith('_')])))



    def discover_pages(self) -> List[str]:
        discovered_paths = [] # Start with an empty list, root will be handled by main if needed

        # Attempt to read sidebars.ts for doc paths
        sidebar_file_path = os.path.join(self.project_root, 'sidebars.ts')
        if os.path.exists(sidebar_file_path):
            try:
                with open(sidebar_file_path, 'r', encoding='utf-8') as f:
                    sidebar_content = f.read()
                discovered_paths.extend(self._extract_paths_from_sidebar(sidebar_content))
                print(f"Discovered {len(discovered_paths)} paths from sidebars.ts")
            except Exception as e:
                print(f"Error reading or parsing sidebars.ts: {e}")
        else:
            print(f"sidebars.ts not found at {sidebar_file_path}")

        # Fallback to default Docusaurus doc paths if no paths found or error
        if not discovered_paths: 
            print("Falling back to default Docusaurus documentation paths.")
            # Example default paths, extend as needed
            discovered_paths.extend([
                "docs/intro.md",
                "docs/project-status.md",
                "docs/text-selection-feature.md",
                "docs/tutorial-basics/congratulations.md",
                "docs/tutorial-basics/create-a-blog-post.md",
                "docs/tutorial-basics/create-a-document.md",
                "docs/tutorial-basics/create-a-page.md",
                "docs/tutorial-basics/deploy-your-site.md",
                "docs/tutorial-basics/markdown-features.md",
                "docs/tutorial-extras/manage-docs-versions.md",
                "docs/tutorial-extras/translate-your-site.md",
            ])
        
        # Ensure paths are unique and directly usable as file paths
        final_paths = sorted(list(set(discovered_paths)))
        # Add root path if it makes sense, though for file reading it's often skipped.
        # It was originally included, so we keep it for consistency for now.
        if "/" not in final_paths: # Check if it's already generated by extract_paths
             final_paths.insert(0, "/") # Add it at the beginning if not present
        return final_paths


async def ingest_docusaurus_book(project_root: str, page_paths: List[str]) -> List[Dict[str, Any]]:
    """
    Extract content from your Docusaurus book from local Markdown files.
    """
    all_content = []
    
    for page_path in page_paths:
        if page_path == "/": # Skip root path for file reading
            continue

        # Construct absolute path to the markdown file
        # page_path is now like "docs/chapters/01-introduction/index.md"
        file_path = os.path.join(project_root, page_path)

        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            continue

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Remove YAML frontmatter
            # Frontmatter is typically between '---' lines at the beginning of the file
            if content.startswith('---'):
                parts = content.split('---', 2)
                if len(parts) > 2:
                    content = parts[2] # Content after the second '---'

            # Clean up content (remove multiple spaces, newlines, etc.)
            text = re.sub(r'\s+', ' ', content).strip()

            if text:
                # Synthesize a URL for consistency, assuming docs/ -> /docs/ and stripping .md
                url_path = "/" + page_path.replace(".md", "")
                if url_path.endswith('/index'):
                    url_path = url_path[:-len('/index')]
                if url_path != "/" and not url_path.endswith('/'):
                    url_path += '/'
                
                all_content.append({
                    "page": page_path, # Keep original page_path for source tracking
                    "content": text,
                    "url": f"local://{url_path}" # Indicate local source
                })
                print(f"Extracted content from {file_path}")
            else:
                print(f"No significant text found in {file_path}")

        except Exception as e:
            print(f"Error reading or processing {file_path}: {e}")
    
    return all_content

def chunk_content(content: List[Dict[str, Any]], chunk_size: int = 1000) -> List[Dict[str, Any]]:
    """
    Split content into chunks for vector storage
    """
    chunks = []
    
    for item in content:
        text = item['content']
        # Use a more descriptive chunk_id for better tracking, e.g., page_path-index
        for i in range(0, len(text), chunk_size):
            chunk = text[i:i + chunk_size]
            chunks.append({
                "text": chunk,
                "source": item['page'], # Use page path as source
                "url": item['url'],
                "chunk_id": f"{item['page']}-{len(chunks)}" # Unique ID per chunk
            })
    
    return chunks