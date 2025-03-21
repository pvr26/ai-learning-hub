from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.services.chat_service import ChatService
from app.models import Resource

chat_bp = Blueprint('chat', __name__)
chat_service = ChatService()

@chat_bp.route('', methods=['OPTIONS'])
@chat_bp.route('/', methods=['OPTIONS'])
def handle_options():
    return '', 204

@chat_bp.route('', methods=['POST'], strict_slashes=False)
@chat_bp.route('/', methods=['POST'], strict_slashes=False)
@login_required
def general_chat():
    data = request.get_json()
    message = data.get('message')
    conversation_history = data.get('conversation_history')
    
    if not message:
        return jsonify({'error': 'Message is required'}), 400
    
    try:
        # Get AI response
        response = chat_service.general_chat(message, conversation_history)
        
        if 'error' in response:
            return jsonify(response), 500
            
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': 'Failed to process chat message'}), 500

@chat_bp.route('/query', methods=['POST'], strict_slashes=False)
@login_required
def chat():
    data = request.get_json()
    query = data.get('query')
    
    if not query:
        return jsonify({'error': 'Query is required'}), 400
    
    try:
        # Get relevant resources from the database
        relevant_resources = Resource.query.filter(
            Resource.is_approved == True,
            (Resource.title.ilike(f'%{query}%') |
             Resource.description.ilike(f'%{query}%'))
        ).limit(5).all()
        
        # Get AI response
        response = chat_service.get_response(query, relevant_resources)
        
        return jsonify({
            'response': response,
            'relevant_resources': [resource.to_dict() for resource in relevant_resources]
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to process chat query'}), 500

@chat_bp.route('/recommendations', methods=['GET'], strict_slashes=False)
@login_required
def get_recommendations():
    try:
        # Get user's bookmarked resources
        bookmarked_resources = current_user.bookmarks.all()
        
        # Get personalized recommendations
        recommendations = chat_service.get_recommendations(bookmarked_resources)
        
        return jsonify({
            'recommendations': recommendations
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to get recommendations'}), 500 