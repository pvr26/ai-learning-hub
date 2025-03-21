import os
from app import create_app
from app.extensions import db

def init_database():
    # Create instance directory if it doesn't exist
    instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
    os.makedirs(instance_path, exist_ok=True)
    
    # Create Flask app
    app = create_app()
    
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created successfully!")
        
        # Check if database file exists
        db_path = os.path.join(instance_path, 'ai_learning_hub.db')
        if os.path.exists(db_path):
            print(f"Database file created at: {db_path}")
        else:
            print("Warning: Database file was not created!")

if __name__ == '__main__':
    init_database() 