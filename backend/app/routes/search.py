from flask import Blueprint, request, jsonify
from flask_login import login_required
from app.services.github_service import GitHubService
from app.services.arxiv_service import ArxivService
from app.models import Resource
from app.extensions import db
from flask import current_app

search_bp = Blueprint('search', __name__)
github_service = GitHubService()
arxiv_service = ArxivService()

@search_bp.route('/', methods=['GET'], strict_slashes=False)
def search_local():
    query = request.args.get('q', '')
    if not query:
        return jsonify({'resources': []})
    
    # Search in title and description
    resources = Resource.query.filter(
        (Resource.title.ilike(f'%{query}%')) |
        (Resource.description.ilike(f'%{query}%'))
    ).all()
    
    return jsonify({
        'resources': [resource.to_dict() for resource in resources]
    })

@search_bp.route('/github', methods=['GET'], strict_slashes=False)
def search_github():
    query = request.args.get('q', '')
    if not query:
        return jsonify({'items': []})
    
    try:
        results = github_service.search_repositories(query)
        return jsonify(results)
    except Exception as e:
        current_app.logger.error(f"GitHub search error: {str(e)}")
        return jsonify({
            'error': str(e),
            'items': []
        }), 500

@search_bp.route('/arxiv', methods=['GET'], strict_slashes=False)
def search_arxiv():
    query = request.args.get('q', '')
    if not query:
        return jsonify({'items': []})
    
    try:
        results = arxiv_service.search_papers(query)
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@search_bp.route('/github/trending', methods=['GET'], strict_slashes=False)
def get_trending_github():
    try:
        trending_github = github_service.get_trending_repositories()
        return jsonify({
            'items': trending_github
        })
    except Exception as e:
        current_app.logger.error(f"GitHub trending error: {str(e)}")
        return jsonify({
            'error': str(e),
            'items': []
        }), 500

@search_bp.route('/all', methods=['GET'], strict_slashes=False)
@login_required
def search_all():
    query = request.args.get('q', '')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Search local database
    local_results = Resource.query.filter(
        Resource.is_approved == True,
        (Resource.title.ilike(f'%{query}%') |
         Resource.description.ilike(f'%{query}%'))
    ).order_by(Resource.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    # Search GitHub
    github_results = github_service.search_repositories(query, page, per_page)
    
    # Search arXiv
    arxiv_results = arxiv_service.search_papers(query, page, per_page)
    
    return jsonify({
        'local': {
            'items': [resource.to_dict() for resource in local_results.items],
            'total': local_results.total,
            'pages': local_results.pages,
            'current_page': local_results.page
        },
        'github': github_results,
        'arxiv': arxiv_results
    }) 