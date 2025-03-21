import json
import os
import sys
from datetime import datetime

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db
from app.models import Resource

def populate_database():
    app = create_app()
    
    with app.app_context():
        # Create database tables
        db.create_all()
        
        # Read initial resources
        with open(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'latest_resources.json')) as f:
            data = json.load(f)
        
        # Add resources to database
        for resource_data in data['resources']:
            # Check if resource already exists
            existing = Resource.query.filter_by(url=resource_data['url']).first()
            if existing:
                print(f"Resource {resource_data['title']} already exists, skipping...")
                continue
                
            resource = Resource(
                title=resource_data['title'],
                description=resource_data['description'],
                url=resource_data['url'],
                category=resource_data['category'],
                is_approved=resource_data['is_approved'],
                created_at=datetime.utcnow()
            )
            db.session.add(resource)
            print(f"Added resource: {resource_data['title']}")
        
        # Commit changes
        try:
            db.session.commit()
            print("Database populated successfully!")
        except Exception as e:
            print("Error populating database:", str(e))
            db.session.rollback()

if __name__ == '__main__':
    populate_database() 