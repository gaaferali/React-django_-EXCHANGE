Furniture Exchange Marketplace

A full-stack web application for buying, selling, and exchanging second-hand furniture. Built with React, TypeScript, Django REST Framework, and PostgreSQL, the platform connects furniture owners with potential buyers and exchange partners through a simple marketplace interface.

The application combines listing management, user authentication, furniture discovery, exchange workflows, and messaging in a unified system. It is designed with a focus on maintainable architecture, practical user experience, and containerized development.

Overview

Furniture Exchange provides a platform where users can publish furniture listings, discover available items, communicate with other users, and arrange purchases or exchanges.

The project demonstrates full-stack development through a REST API, a responsive React frontend, relational database management, authentication, and Docker-based infrastructure.

Key Features

User Authentication

User registration and login

JWT-based authentication

Access and refresh tokens

Protected routes and API endpoints

User profile management

Authorization for user-specific operations

Furniture Marketplace

Create, view, update, and delete furniture listings

Upload furniture images

Browse listings by category and condition

Search and filter available furniture

View detailed listing information

Manage personal listings

Track listing availability

Furniture Exchange

Request furniture exchanges between users

Manage incoming and outgoing requests

Accept or reject exchange proposals

Track exchange status

Associate exchange requests with relevant listings

Real-Time Messaging

Direct communication between marketplace users

WebSocket communication using Django Channels

Persistent message history

Redis-backed channel communication

Authentication and authorization for messaging

User Interface

Responsive React application

TypeScript-based frontend

Reusable UI components

Marketplace navigation and product listings

Forms with validation and feedback

User profile and listing management interfaces

Technology Stack

Layer

Technologies

Frontend

React, TypeScript, Vite

API

Django REST Framework

Backend

Django, Python

Authentication

JWT, Simple JWT

Database

PostgreSQL, SQLite for local development

Real-time communication

Django Channels, WebSockets

Channel layer

Redis

ASGI server

Uvicorn

Reverse proxy

Nginx

Containerization

Docker, Docker Compose

Version control

Git, GitHub

System Architecture

The application follows a client-server architecture. React communicates with Django through REST endpoints, while WebSockets provide a dedicated communication channel for real-time messaging.

flowchart TD
    A[User Browser] --> B[Nginx]
    B --> C[React Frontend]
    B -->|REST API| D[Django REST Framework]
    B -->|WebSocket| E[Django Channels]
    D --> F[(PostgreSQL)]
    E --> F
    E --> G[(Redis)]

Architecture Components

React Frontend: Handles navigation, user interaction, forms, furniture listings, authentication state, and API integration.

Django REST Framework: Provides backend endpoints, request validation, database operations, business logic, and access control.

PostgreSQL: Stores application data, including users, furniture listings, exchange records, and persisted conversations.

Django Channels: Handles asynchronous WebSocket connections and real-time messaging.

Redis: Provides the channel layer used for communication between WebSocket consumers.

Nginx: Serves the frontend application and forwards API and WebSocket traffic to the backend.

Docker Compose: Coordinates the services and their networks, environment variables, and persistent storage.

Project Structure

The main application is divided into frontend and backend services.

React-django_-EXCHANGE/
│
├── backend/
│   └── ExchangeAPI/
│       ├── ExchangeAPI/
│       │   ├── settings.py
│       │   ├── urls.py
│       │   └── asgi.py
│       │
│       ├── users/
│       ├── listings/
│       ├── messaging/
│       └── manage.py
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── types/
│   │   └── App.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md


2. Configure Environment Variables

Create the environment file from the example:

cp .env.example .env

Example:

DJANGO_SECRET_KEY=replace-with-a-secure-secret
DEBUG=False

ALLOWED_HOSTS=localhost,127.0.0.1,backend

POSTGRES_DB=exchange_db
POSTGRES_USER=exchange_user
POSTGRES_PASSWORD=replace-with-a-strong-password
POSTGRES_HOST=db
POSTGRES_PORT=5432

REDIS_URL=redis://redis:6379/0



3. Run with Docker

Build and start the application:

docker compose up -d --build





Database and Persistence

PostgreSQL is used for the Docker-based environment, while SQLite may be used for simpler local development.

Database migrations are managed through Django's migration system.

Docker volumes provide persistent storage for application data independently of container lifecycles.

Testing and Verification

Backend Checks

Run Django's system checks:

docker compose exec backend python manage.py check

Run available backend tests:

docker compose exec backend python manage.py test

Frontend Checks

cd frontend
npm run build



Security Considerations

The application architecture includes:

JWT-based authentication

Backend-enforced access permissions

Environment-based configuration

Django request and serializer validation

Server-side ownership checks

Configurable CORS and allowed hosts

Separation of application and database services

Future Improvements

Potential future enhancements include:

Seller ratings and reviews

Advanced location-based furniture search

Email notifications

Additional marketplace moderation features

Improved transaction history

Cloud-based image storage

More extensive integration and end-to-end testing