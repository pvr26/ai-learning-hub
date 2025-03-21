from flask import Flask
from flask_cors import CORS
from config import Config
from app.extensions import db, login_manager, jwt, migrate

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions with app
    db.init_app(app)
    login_manager.init_app(app)
    jwt.init_app(app)
    
    # Configure CORS
    CORS(app, 
         resources={r"/api/*": {
             "origins": ["http://localhost:3000"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization", "Accept"],
             "supports_credentials": True,
             "expose_headers": ["Content-Type", "Authorization"],
             "max_age": 3600
         }},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization", "Accept"],
         expose_headers=["Content-Type", "Authorization"],
         max_age=3600)
    
    migrate.init_app(app, db)
    
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