import requests
from flask import current_app
from datetime import datetime, timedelta
import xml.etree.ElementTree as ET

def truncate_text(text, max_words=50):
    """Truncate text to specified number of words and add ellipsis if needed."""
    if not text:
        return ""
    words = text.split()
    if len(words) <= max_words:
        return text
    return " ".join(words[:max_words]) + "..."

class ArxivService:
    def __init__(self):
        self.base_url = 'http://export.arxiv.org/api/query'
    
    def search_papers(self, query):
        try:
            # Add AI-related keywords to the query
            enhanced_query = f"{query} AND (cat:cs.AI OR cat:cs.LG OR cat:cs.CL OR cat:stat.ML)"
            
            params = {
                'search_query': enhanced_query,
                'start': 0,
                'max_results': 10,  # Limit to 10 results
                'sortBy': 'submittedDate',
                'sortOrder': 'descending'
            }
            
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            
            # Parse XML response
            root = ET.fromstring(response.content)
            namespace = {'atom': 'http://www.w3.org/2005/Atom'}
            
            items = []
            for entry in root.findall('.//atom:entry', namespace):
                title = entry.find('atom:title', namespace).text
                summary = entry.find('atom:summary', namespace).text
                link = entry.find('atom:link', namespace).get('href')
                published = entry.find('atom:published', namespace).text
                
                # Extract authors
                authors = []
                for author in entry.findall('.//atom:name', namespace):
                    authors.append(author.text)
                
                items.append({
                    'id': entry.find('atom:id', namespace).text,
                    'title': title,
                    'description': truncate_text(summary),  # Truncate description
                    'url': link,
                    'authors': authors,
                    'published': published,
                    'type': 'research_paper'  # Add type field
                })
            
            return {
                'items': items,
                'total': len(items),
                'pages': 1,
                'current_page': 1
            }
            
        except Exception as e:
            raise Exception(f"Failed to fetch arXiv papers: {str(e)}")
    
    def get_trending_papers(self):
        try:
            # Get papers from the last 7 days
            date_threshold = datetime.now() - timedelta(days=7)
            query = f"cat:cs.AI OR cat:cs.LG OR cat:cs.CL OR cat:stat.ML"
            
            search = requests.get(self.base_url, params={
                'search_query': query,
                'start': 0,
                'max_results': 10,
                'sortBy': 'submittedDate',
                'sortOrder': 'descending'
            })
            
            search.raise_for_status()
            
            # Parse the XML response
            root = ET.fromstring(search.content)
            
            # Extract entries
            results = []
            for entry in root.findall('{http://www.w3.org/2005/Atom}entry'):
                title = entry.find('{http://www.w3.org/2005/Atom}title').text
                summary = entry.find('{http://www.w3.org/2005/Atom}summary').text
                link = entry.find('{http://www.w3.org/2005/Atom}link').get('href')
                published = entry.find('{http://www.w3.org/2005/Atom}published').text
                
                if datetime.fromisoformat(published) > date_threshold:
                    results.append({
                        'title': title,
                        'description': truncate_text(summary),  # Truncate description
                        'url': link,
                        'published': published,
                        'type': 'research_paper'  # Add type field
                    })
            
            return results
            
        except Exception as e:
            current_app.logger.error(f"arXiv API error: {str(e)}")
            return [] 