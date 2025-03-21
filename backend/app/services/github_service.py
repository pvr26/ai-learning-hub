from github import Github
from flask import current_app
import requests
from datetime import datetime, timedelta
import os

def truncate_text(text, max_words=50):
    """Truncate text to specified number of words and add ellipsis if needed."""
    if not text:
        return ""
    words = text.split()
    if len(words) <= max_words:
        return text
    return " ".join(words[:max_words]) + "..."

class GitHubService:
    def __init__(self):
        self.token = None
        self.github = None
    
    def _init_github(self):
        if self.github is None:
            # Try getting token from different sources
            self.token = current_app.config.get('GITHUB_API_TOKEN') or os.getenv('GITHUB_API_TOKEN')
            print(f"Debug - GitHub Token Present: {'Yes' if self.token else 'No'}")
            
            # Only use token if it's actually set in config
            if self.token and self.token.strip():
                print(f"Debug - Initializing GitHub client with token: {self.token[:4]}...")
                self.github = Github(self.token)
                print("Debug - GitHub client initialized with token")
            else:
                print("Debug - Initializing GitHub client without token")
                self.github = Github()
                print("Debug - GitHub client initialized without token")
    
    def search_repositories(self, query, page=1, per_page=10):
        try:
            self._init_github()
            
            # Make the query less restrictive - only add AI topics if no specific topic is mentioned
            print(f"Debug - Initial query: {query}")
            if not query or query.strip() == "":
                enhanced_query = "stars:>100 topic:artificial-intelligence OR topic:deep-learning OR topic:machine-learning OR topic:ai"
            else:
                enhanced_query = f"{query.strip()} in:name,description,readme"
            
            print(f"Debug - Searching GitHub with query: {enhanced_query}")
            
            repositories = self.github.search_repositories(
                query=enhanced_query,
                sort='stars',
                order='desc'
            )
            
            try:
                # First try to get total count to check if we have results
                total_count = repositories.totalCount
                print(f"Debug - Found {total_count} repositories matching the query")
                
                if total_count == 0:
                    print("Debug - No repositories found")
                    return {
                        'items': [],
                        'total': 0,
                        'pages': 0,
                        'current_page': page
                    }
                
                # Convert to list and get top 10 only
                print("Debug - Converting results to list")
                all_repos = list(repositories[:10])  # Only get top 10
                actual_count = len(all_repos)
                print(f"Debug - Successfully retrieved top {actual_count} repositories")
                
                results = []
                for repo in all_repos:
                    try:
                        results.append({
                            'id': repo.id,
                            'name': repo.name,
                            'full_name': repo.full_name,
                            'description': truncate_text(repo.description),  # Truncate description
                            'url': repo.html_url,
                            'stars': repo.stargazers_count,
                            'language': repo.language,
                            'created_at': repo.created_at.isoformat(),
                            'updated_at': repo.updated_at.isoformat(),
                            'type': 'github_repo'  # Add type field
                        })
                    except Exception as e:
                        print(f"Debug - Error processing repository: {str(e)}")
                        continue
                
                print(f"Debug - Successfully processed {len(results)} repositories")
                return {
                    'items': results,
                    'total': total_count,  # Keep total count to show total available
                    'pages': 1,  # Since we're only showing top 10, we only have 1 page
                    'current_page': 1
                }
                
            except Exception as inner_e:
                print(f"Debug - Error processing GitHub search results: {str(inner_e)}")
                raise
            
        except Exception as e:
            print(f"Debug - GitHub API error: {str(e)}")
            raise Exception(f"Failed to fetch GitHub repositories: {str(e)}")
    
    def get_trending_repositories(self):
        try:
            self._init_github()
            
            # Get repositories created in the last 7 days with stars
            date_threshold = datetime.now() - timedelta(days=7)
            date_str = date_threshold.strftime('%Y-%m-%d')
            
            # Construct a more specific query for trending AI repositories
            query = f"created:>={date_str} stars:>10 (artificial-intelligence OR deep-learning OR machine-learning OR ai) in:name,description,readme"
            
            print(f"Debug - Trending query: {query}")
            
            repositories = self.github.search_repositories(
                query=query,
                sort='stars',
                order='desc'
            )
            
            # Convert to list and get top 10 safely
            all_repos = list(repositories[:10])  # Only get top 10
            print(f"Debug - Found {len(all_repos)} trending repositories")
            
            results = []
            for repo in all_repos:
                try:
                    results.append({
                        'id': repo.id,
                        'name': repo.name,
                        'full_name': repo.full_name,
                        'description': truncate_text(repo.description),  # Truncate description
                        'url': repo.html_url,
                        'stars': repo.stargazers_count,
                        'language': repo.language,
                        'created_at': repo.created_at.isoformat(),
                        'type': 'github_repo'  # Add type field
                    })
                except Exception as e:
                    print(f"Debug - Error processing trending repository: {str(e)}")
                    continue
            
            return results
            
        except Exception as e:
            print(f"Debug - GitHub API error: {str(e)}")
            return [] 