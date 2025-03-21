from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from app.extensions import db, jwt, migrate
import os

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)
    
    # Configure CORS based on environment
    allowed_origins = [
        "http://localhost:3000",  # Development
        os.getenv('FRONTEND_URL', ''),  # Production frontend URL from environment
        "https://*.vercel.app"  # Allow all Vercel preview deployments
    ]
    
    # Filter out empty strings from allowed origins
    allowed_origins = [origin for origin in allowed_origins if origin]
    
    CORS(app, 
         resources={r"/api/*": {
             "origins": allowed_origins,
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "expose_headers": ["Content-Type", "Authorization"],
             "max_age": 3600
         }},
         supports_credentials=False)  # We're using JWT, not cookies
    
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