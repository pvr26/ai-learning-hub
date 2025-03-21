from app import db
from datetime import datetime

class Resource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    url = db.Column(db.String(500), nullable=False)
    category = db.Column(db.String(50))
    is_approved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    submitter_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    # Relationships
    bookmarks = db.relationship('Bookmark', backref='resource', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'url': self.url,
            'category': self.category,
            'is_approved': self.is_approved,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'submitter': self.submitter.username if self.submitter else None
        }
    
    def __repr__(self):
        return f'<Resource {self.title}>' 