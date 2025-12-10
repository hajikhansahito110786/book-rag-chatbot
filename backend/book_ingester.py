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

    def _extract_paths_from_sidebar(self, sidebar_file_content: str) -> List[str]:
        # This is a very simplified parser. A more robust solution might use a proper TS parser.
        # It looks for strings that resemble doc IDs, often found in arrays or object values.
        # Examples: 'docs/intro', 'tutorial-basics/create-a-document'
        # It's an heuristic, might miss some or get too many.
        paths = []
        # Look for strings like 'type: "doc", id: "path/to/doc"'
        doc_id_pattern = re.compile(r'id:\s*["\'](docs\/.*?|.*?\/.*?)["\']')
        paths.extend(doc_id_pattern.findall(sidebar_file_content))

        # Look for strings that look like direct paths within arrays, e.g., ['path/to/doc']
        direct_path_pattern = re.compile(r'["\'](docs\/.*?|.*?\/.*?)["\']')
        paths.extend(direct_path_pattern.findall(sidebar_file_content))
        
        # Filter out non-doc paths and clean up
        unique_paths = []
        for p in paths:
            if not p.startswith('/') and not p.startswith('#'): # Exclude external links or anchors
                if p.endswith('/'): p = p[:-1] # Remove trailing slash
                # A common pattern is that the doc ID directly maps to path /docs/id
                # Or it is already a full path like 'tutorial-basics/create-a-document'
                if not p.startswith('docs/') and '/' in p:
                    unique_paths.append(f"docs/{p}")
                else:
                    unique_paths.append(p)
        
        # Ensure only relevant paths, filter duplicates
        return sorted(list(set([p for p in unique_paths if p and not p.startswith('_') and not p.endswith('.mdx') and not p.endswith('.md')])))


    def discover_pages(self) -> List[str]:
        discovered_paths = ["/"] # Always include the root

        # Attempt to read sidebars.ts for doc paths
        sidebar_file_path = os.path.join(self.project_root, 'sidebars.ts')
        if os.path.exists(sidebar_file_path):
            try:
                with open(sidebar_file_path, 'r', encoding='utf-8') as f:
                    sidebar_content = f.read()
                discovered_paths.extend(self._extract_paths_from_sidebar(sidebar_content))
                print(f"Discovered {len(discovered_paths) - 1} paths from sidebars.ts")
            except Exception as e:
                print(f"Error reading or parsing sidebars.ts: {e}")
        else:
            print(f"sidebars.ts not found at {sidebar_file_path}")

        # Fallback to default Docusaurus doc paths if no paths found or error
        if len(discovered_paths) <= 1: # Only "/" was found
            print("Falling back to default Docusaurus documentation paths.")
            # Example default paths, extend as needed
            discovered_paths.extend([
                "docs/intro",
                "docs/project-status",
                "docs/text-selection-feature",
                "docs/tutorial-basics/congratulations",
                "docs/tutorial-basics/create-a-blog-post",
                "docs/tutorial-basics/create-a-document",
                "docs/tutorial-basics/create-a-page",
                "docs/tutorial-basics/deploy-your-site",
                "docs/tutorial-basics/markdown-features",
                "docs/tutorial-extras/manage-docs-versions",
                "docs/tutorial-extras/translate-your-site",
            ])
        
        # Ensure paths are unique and formatted correctly (e.g., "docs/intro" -> "/docs/intro")
        final_paths = []
        for p in discovered_paths:
            if p == "/":
                final_paths.append(p)
            elif p.startswith("docs/"):
                final_paths.append(f"/{p}")
            elif not p.startswith("/"): # for paths like "tutorial-basics/create-a-document"
                final_paths.append(f"/docs/{p}") # Assuming these implicitly map under /docs
            else:
                final_paths.append(p)

        return sorted(list(set(final_paths)))


async def ingest_docusaurus_book(base_url: str, page_paths: List[str]) -> List[Dict[str, Any]]:
    """
    Extract content from your Docusaurus book for a given list of page paths.
    """
    all_content = []
    
    for page_path in page_paths:
        try:
            url = base_url + page_path.lstrip('/') # Ensure no double slash
            print(f"Attempting to scrape: {url}")
            response = requests.get(url, timeout=10)
            response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract main content
            # Docusaurus usually puts main content in <main> or <article> within <div class="col">
            main_content = soup.find('main', class_="docMainContainer_node_modules-@docusaurus-theme-classic-lib-theme-DocPage-styles-module") or \
                           soup.find('article') or \
                           soup.find('div', class_=re.compile(r"docItemCol"))

            if main_content:
                # Remove scripts, styles, navigation, footer, and other irrelevant elements
                for selector in ["script", "style", "nav", "footer", ".navbar", ".sidebar", ".docSidebarContainer"]:
                    for element in main_content.find_all(selector):
                        element.decompose()
                
                text = main_content.get_text(separator=' ', strip=True)
                # Clean up multiple spaces and newlines
                text = re.sub(r'\s+', ' ', text).strip()

                if text:
                    all_content.append({
                        "page": page_path,
                        "content": text,
                        "url": url
                    })
                    print(f"Extracted content from {page_path}")
                else:
                    print(f"No significant text found in main content for {page_path}")
            else:
                print(f"Could not find main content div/article for {page_path}")
        except requests.exceptions.RequestException as e:
            print(f"Error fetching {page_path} from {base_url}: {e}")
        except Exception as e:
            print(f"Error extracting {page_path}: {e}")
    
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