# AI Learning Hub

A full-stack web application for discovering and sharing AI learning resources. This platform helps users find, bookmark, and contribute to a curated collection of AI learning materials, with an AI-powered chat assistant to help guide users in their learning journey.

## Features

- User authentication (login/register)
- Search AI learning resources
- Bookmark favorite resources
- Submit new resources
- Admin dashboard for managing users and resources
- Integration with GitHub and arXiv APIs
- AI-powered chat assistant using Google's Gemini AI
- Modern, responsive UI with Material-UI components
- Secure JWT-based authentication
- Role-based access control (Admin/User)
- Markdown rendering for AI chat responses

## Project Structure

```
ai-learning-hub/
├── backend/                 # Flask backend
│   ├── app/                # Application package
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   ├── migrations/        # Database migrations
│   ├── tests/             # Backend tests
│   ├── config.py          # Configuration
│   └── requirements.txt   # Python dependencies
│
├── frontend/              # React frontend
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/        # Page components
│   │   └── utils/        # Utility functions
│   └── package.json      # Node.js dependencies
│
└── venv/                 # Python virtual environment
```

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- SQLite database
- Git
- Google API key for Gemini AI

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
# - SECRET_KEY=your-secret-key
# - JWT_SECRET_KEY=your-jwt-secret-key
# - GOOGLE_API_KEY=your-google-api-key
# - GITHUB_TOKEN=your-github-token (optional)
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
- POST /api/bookmarks - Add bookmark
- DELETE /api/bookmarks/:resource_id - Remove bookmark

### Chat
- POST /api/chat - General chat with AI assistant
- POST /api/chat/query - Query-specific chat with resource context
- GET /api/chat/recommendations - Get personalized recommendations

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
- Flask with SQLAlchemy for database operations
- Flask-Migrate for database migrations
- JWT for authentication
- Flask-CORS for handling CORS
- SQLite as the database
- Google's Gemini AI for chat functionality

### Frontend
- React with Material-UI for the interface
- React Router for navigation
- Axios for API calls
- Context API for state management
- React Markdown for rendering AI chat responses
- Modern responsive design
