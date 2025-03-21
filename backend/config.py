import os
from dotenv import load_dotenv
import logging

basedir = os.path.abspath(os.path.dirname(__file__))

load_dotenv()

class Config:
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', f'sqlite:///{os.path.join(basedir, "instance", "ai_learning_hub.db")}')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
    
    # External APIs
    GITHUB_API_TOKEN = os.getenv('GITHUB_API_TOKEN')
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    
    # CORS
    CORS_ORIGINS = ["http://localhost:3000"]
    CORS_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    CORS_HEADERS = ["Content-Type", "Authorization", "Accept"]
    CORS_EXPOSE_HEADERS = ["Content-Type", "Authorization"]
    CORS_SUPPORTS_CREDENTIALS = True
    CORS_MAX_AGE = 3600
    
    # Pagination
    ITEMS_PER_PAGE = 20
    
    def __init__(self):
        if not self.GOOGLE_API_KEY:
            logging.warning("Google API key not found in environment variables")
        else:
            logging.info("Google API key loaded successfully") 