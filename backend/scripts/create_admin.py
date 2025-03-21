import os
import sys
from werkzeug.security import generate_password_hash

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import User

def create_admin_user(username, password):
    app = create_app()
    
    with app.app_context():
        # Check if admin user already exists
        if User.query.filter_by(username=username).first():
            print(f"User {username} already exists!")
            return
        
        # Create admin user
        admin = User(
            username=username,
            is_admin=True
        )
        admin.set_password(password)
        
        # Add to database
        db.session.add(admin)
        db.session.commit()
        
        print(f"Admin user {username} created successfully!")

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python create_admin.py <username> <password>")
        sys.exit(1)
    
    username = sys.argv[1]
    password = sys.argv[2]
    
    create_admin_user(username, password) 