from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Bookmark, Resource, db, User

bookmarks_bp = Blueprint('bookmarks', __name__)

@bookmarks_bp.route('/', methods=['GET'])
@jwt_required()
def get_bookmarks():
    try:
        # Convert JWT identity (string) to integer for database query
        user_id = int(get_jwt_identity())
        print("Getting bookmarks - JWT Identity:", user_id)
        
        user = User.query.get(user_id)
        if not user:
            print("User not found:", user_id)
            return jsonify({'error': 'User not found'}), 404
            
        print("Fetching bookmarks for user:", user.username)
        
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 12, type=int)
        
        # Query with pagination
        bookmarks = Bookmark.query.filter_by(user_id=user_id)\
            .order_by(Bookmark.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
            
        return jsonify({
            'bookmarks': [bookmark.to_dict() for bookmark in bookmarks.items],
            'total': bookmarks.total,
            'pages': bookmarks.pages,
            'current_page': bookmarks.page
        })
    except Exception as e:
        print("Error in get_bookmarks:", str(e))
        return jsonify({'error': str(e)}), 500

@bookmarks_bp.route('/', methods=['POST'])
@jwt_required()
def create_bookmark():
    try:
        # Convert JWT identity (string) to integer for database query
        user_id = int(get_jwt_identity())
        print("Creating bookmark - User ID:", user_id)
        
        user = User.query.get(user_id)
        if not user:
            print("User not found:", user_id)
            return jsonify({'error': 'User not found'}), 404
            
        data = request.get_json()
        resource_id = data.get('resource_id')
        
        if not resource_id:
            return jsonify({'error': 'Resource ID is required'}), 400
            
        # Check if bookmark already exists
        existing_bookmark = Bookmark.query.filter_by(
            user_id=user_id,
            resource_id=resource_id
        ).first()
        
        if existing_bookmark:
            return jsonify({'error': 'Resource already bookmarked'}), 400
            
        bookmark = Bookmark(user_id=user_id, resource_id=resource_id)
        db.session.add(bookmark)
        db.session.commit()
        
        return jsonify(bookmark.to_dict()), 201
    except Exception as e:
        print("Error in create_bookmark:", str(e))
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bookmarks_bp.route('/<int:resource_id>', methods=['DELETE'])
@jwt_required()
def delete_bookmark(resource_id):
    try:
        # Convert JWT identity (string) to integer for database query
        user_id = int(get_jwt_identity())
        print("Deleting bookmark - User ID:", user_id, "Resource ID:", resource_id)
        
        bookmark = Bookmark.query.filter_by(
            user_id=user_id,
            resource_id=resource_id
        ).first()
        
        if not bookmark:
            return jsonify({'error': 'Bookmark not found'}), 404
            
        db.session.delete(bookmark)
        db.session.commit()
        
        return '', 204
    except Exception as e:
        print("Error in delete_bookmark:", str(e))
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 