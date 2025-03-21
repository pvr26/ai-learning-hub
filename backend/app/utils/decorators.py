from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models import User

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            if not user or not user.is_admin:
                return jsonify({'error': 'Admin privileges required'}), 403
            return f(*args, **kwargs)
        except Exception as e:
            print(f"Error in admin_required decorator:", str(e))  # Debug log
            return jsonify({'error': 'Authentication error'}), 401
    return decorated_function 