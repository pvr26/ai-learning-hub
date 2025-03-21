from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import Bookmark, Resource, db

bookmarks_bp = Blueprint('bookmarks', __name__)

@bookmarks_bp.route('/', methods=['GET'], strict_slashes=False)
@login_required
def get_bookmarks():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    bookmarks = current_user.bookmarks.order_by(
        Bookmark.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'bookmarks': [bookmark.to_dict() for bookmark in bookmarks.items],
        'total': bookmarks.total,
        'pages': bookmarks.pages,
        'current_page': bookmarks.page
    })

@bookmarks_bp.route('/<int:resource_id>', methods=['POST'], strict_slashes=False)
@login_required
def create_bookmark(resource_id):
    resource = Resource.query.get_or_404(resource_id)
    
    if not resource.is_approved:
        return jsonify({'error': 'Cannot bookmark unapproved resources'}), 400
    
    existing_bookmark = Bookmark.query.filter_by(
        user_id=current_user.id,
        resource_id=resource_id
    ).first()
    
    if existing_bookmark:
        return jsonify({'error': 'Resource already bookmarked'}), 400
    
    bookmark = Bookmark(
        user_id=current_user.id,
        resource_id=resource_id
    )
    
    db.session.add(bookmark)
    db.session.commit()
    
    return jsonify(bookmark.to_dict()), 201

@bookmarks_bp.route('/<int:resource_id>', methods=['DELETE'], strict_slashes=False)
@login_required
def delete_bookmark(resource_id):
    bookmark = Bookmark.query.filter_by(
        user_id=current_user.id,
        resource_id=resource_id
    ).first_or_404()
    
    db.session.delete(bookmark)
    db.session.commit()
    
    return '', 204 