Trading and Exchanging Used Furniture - Frontend
Project Overview
A modern React TypeScript web application for trading, selling, and exchanging used furniture. Built with responsive design using Bootstrap and styled components.

Technology Stack django + react +sqlLit
Frontend Framework: React 18.x
Language: TypeScript
Routing: React Router v6
HTTP Client: Axios
State Management: React Context (Auth Context)
Styling: Bootstrap 5
Package Manager: NPM
backend framework: django
## Features
- User authentication (JWT)
- CRUD operations
- Responsive UI
- REST API

## Tech Stack
**Frontend**
- React
- Vite
- Tailwind CSS

**Backend**
- Django
- Django REST Framework
- sqlLite
- JWT Authentication

## Installation

### Backend

cd backend
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

cd frontend
npm install
npm run dev
```

Frontend 
VITE_API_URL=http://127.0.0.1:8000/api/
```

