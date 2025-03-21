from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from app.extensions import db, jwt, migrate
import os

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Disable trailing slash redirects
    app.url_map.strict_slashes = False
    
    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)
    
    # Configure JWT
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour
    app.config['JWT_ERROR_MESSAGE_KEY'] = 'error'
    
    # Add JWT error handlers
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        print(f"Invalid token error: {str(error)}")  # Debug log
        return jsonify({
            'error': 'Invalid token',
            'message': str(error)
        }), 422

    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        print(f"Unauthorized error: {str(error)}")  # Debug log
        return jsonify({
            'error': 'Unauthorized',
            'message': str(error)
        }), 401
    
    # Configure CORS based on environment
    allowed_origins = [
        "http://localhost:3000",  # Development
        os.getenv('FRONTEND_URL', ''),  # Production frontend URL from environment
        "https://*.vercel.app"  # Allow all Vercel preview deployments
    ]
    
    # Filter out empty strings from allowed origins
    allowed_origins = [origin for origin in allowed_origins if origin]
    
    # Common CORS configuration
    cors_config = {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "expose_headers": ["Content-Type", "Authorization"],
        "max_age": 3600,
        "supports_credentials": True,
        "allow_credentials": True
    }
    
    # Configure CORS with specific routes
    CORS(app, 
         resources={
             r"/api/*": cors_config,
             r"/api/auth/*": cors_config,
             r"/api/resources/*": cors_config,
             r"/api/search/*": cors_config,
             r"/api/bookmarks/*": cors_config,
             r"/api/chat/*": cors_config
         },
         supports_credentials=True)  # Enable credentials support
    
    migrate.init_app(app, db)
    
    # Test route
    @app.route('/api/test')
    def test():
        return jsonify({"message": "Backend is working!"})
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.resources import resources_bp
    from app.routes.search import search_bp
    from app.routes.bookmarks import bookmarks_bp
    from app.routes.chat import chat_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(resources_bp, url_prefix='/api/resources')
    app.register_blueprint(search_bp, url_prefix='/api/search')
    app.register_blueprint(bookmarks_bp, url_prefix='/api/bookmarks')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    
    return app 