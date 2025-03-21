from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from app.models import User
from app.extensions import db, login_manager, jwt
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'], strict_slashes=False)
def register():
    try:
        data = request.get_json()
        print("Received registration data:", data)  # Debug log
        
        if User.query.filter_by(username=data['username']).first():
            print("Username already exists")  # Debug log
            return jsonify({'error': 'Username already exists'}), 400
        
        user = User(username=data['username'])
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        print("User registered successfully")  # Debug log
        
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        print("Registration error:", str(e))  # Debug log
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'], strict_slashes=False)
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    
    if user and user.check_password(data['password']):
        login_user(user)
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'is_admin': user.is_admin
            }
        })
    
    return jsonify({'error': 'Invalid username or password'}), 401

@auth_bp.route('/logout', strict_slashes=False)
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'})

@auth_bp.route('/me', strict_slashes=False)
@login_required
def get_current_user():
    return jsonify({
        'id': current_user.id,
        'username': current_user.username,
        'is_admin': current_user.is_admin
    }) 