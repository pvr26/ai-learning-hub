from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import Resource, db
from app.utils.decorators import admin_required

resources_bp = Blueprint('resources', __name__)

@resources_bp.route('/', methods=['GET'], strict_slashes=False)
def get_resources():
    try:
        # Handle paginated list of all resources
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        category = request.args.get('category')
        
        query = Resource.query.filter_by(is_approved=True)
        
        # Apply category filter if provided
        if category:
            query = query.filter_by(category=category)
        
        resources = query.order_by(Resource.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'resources': [resource.to_dict() for resource in resources.items],
            'total': resources.total,
            'pages': resources.pages,
            'current_page': resources.page
        })
    except Exception as e:
        print(f"Error fetching resources:", str(e))  # Debug log
        return jsonify({'error': 'Failed to fetch resources'}), 500

@resources_bp.route('/', methods=['POST'], strict_slashes=False)
@login_required
def create_resource():
    data = request.get_json()
    
    resource = Resource(
        title=data['title'],
        description=data['description'],
        url=data['url'],
        category=data['category'],
        submitter_id=current_user.id
    )
    
    if current_user.is_admin:
        resource.is_approved = True
    
    db.session.add(resource)
    db.session.commit()
    
    return jsonify(resource.to_dict()), 201

@resources_bp.route('/<int:id>', methods=['GET'], strict_slashes=False)
def get_resource(id):
    resource = Resource.query.get_or_404(id)
    return jsonify(resource.to_dict())

@resources_bp.route('/<int:id>', methods=['PUT'], strict_slashes=False)
@login_required
@admin_required
def update_resource(id):
    resource = Resource.query.get_or_404(id)
    data = request.get_json()
    
    resource.title = data.get('title', resource.title)
    resource.description = data.get('description', resource.description)
    resource.url = data.get('url', resource.url)
    resource.category = data.get('category', resource.category)
    resource.is_approved = data.get('is_approved', resource.is_approved)
    
    db.session.commit()
    return jsonify(resource.to_dict())

@resources_bp.route('/<int:id>', methods=['DELETE'], strict_slashes=False)
@login_required
@admin_required
def delete_resource(id):
    resource = Resource.query.get_or_404(id)
    db.session.delete(resource)
    db.session.commit()
    return '', 204

@resources_bp.route('/pending', methods=['GET'], strict_slashes=False)
@login_required
@admin_required
def get_pending_resources():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    resources = Resource.query.filter_by(is_approved=False).order_by(
        Resource.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'resources': [resource.to_dict() for resource in resources.items],
        'total': resources.total,
        'pages': resources.pages,
        'current_page': resources.page
    }) 