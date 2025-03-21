# AI Learning Hub

A full-stack web application for discovering and sharing AI learning resources.

## Features

- User authentication (login/register)
- Search AI learning resources
- Bookmark favorite resources
- Submit new resources
- Admin dashboard for managing users and resources
- Integration with GitHub and arXiv APIs

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- PostgreSQL database

## Backend Setup

1. Create and activate a virtual environment:
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

2. Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - FLASK_APP=app
# - FLASK_ENV=development
# - DATABASE_URL=postgresql://username:password@localhost:5432/ai_learning_hub
# - JWT_SECRET_KEY=your-secret-key
# - GITHUB_TOKEN=your-github-token (optional)
# - ARXIV_API_KEY=your-arxiv-api-key (optional)
```

4. Initialize the database:
```bash
flask db upgrade
python scripts/init_db.py
```

5. Start the backend server:
```bash
flask run
```

The backend will be available at `http://localhost:5000`

## Frontend Setup

1. Install Node.js dependencies:
```bash
cd frontend
npm install
```

2. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - REACT_APP_API_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Default Admin Account

After running the database initialization script, you can log in with the default admin account:

- Username: admin
- Password: admin123

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user info

### Resources
- GET /api/resources - Get all resources
- GET /api/resources/search - Search resources
- POST /api/resources - Submit a new resource
- GET /api/resources/trending - Get trending resources
- GET /api/resources/categories - Get all categories

### Bookmarks
- GET /api/bookmarks - Get user's bookmarks
- POST /api/bookmarks/:resource_id - Add bookmark
- DELETE /api/bookmarks/:resource_id - Remove bookmark

### Admin
- GET /api/admin/users - Get all users
- PUT /api/admin/users/:id - Update user
- DELETE /api/admin/users/:id - Delete user
- GET /api/admin/resources - Get all resources
- PUT /api/admin/resources/:id - Update resource
- DELETE /api/admin/resources/:id - Delete resource
- PUT /api/admin/resources/:id/approve - Approve resource
- PUT /api/admin/resources/:id/reject - Reject resource

## Development

### Backend
- The backend uses Flask with SQLAlchemy for database operations
- Flask-Migrate for database migrations
- JWT for authentication
- Flask-CORS for handling CORS

### Frontend
- React with Material-UI for the interface
- React Router for navigation
- Axios for API calls
- Context API for state management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 