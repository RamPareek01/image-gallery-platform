Image Gallery Platform

A full-stack production-ready image management platform with role-based access control, Google authentication, image uploads, likes system, and an administrative dashboard.
The system is built using a modern SaaS architecture with separate user and admin frontends, a centralized backend API, cloud storage, and third-party authentication.

Live Applications

User Application (Next.js)
https://your-user-app.vercel.app

Admin Dashboard (Vite + React)
https://your-admin-app.vercel.app

Backend API (Express)
https://your-backend-url.onrender.com

System Architecture
User Frontend (Next.js)  --->  
                              \
                               Backend API (Express + Node.js) ---> MongoDB
                              /
Admin Dashboard (Vite)  --->

Authentication: Firebase (Google OAuth)
Image Storage: Cloudinary
Deployment: Vercel (Frontend), Render (Backend)

Features:-

User Application:-

Google Authentication (Firebase)
JWT-based backend authorization
Image upload (Cloudinary storage)
Like / Unlike functionality
Like count aggregation
Pagination and sorting (newest, oldest, popular)
Role-based image deletion
Protected routes
Responsive premium UI

Admin Dashboard:-

Admin authentication
View all uploaded images
Role-based access control
Manage content from centralized dashboard

Backend:-

Express REST API
JWT authentication middleware
Role-based authorization middleware
MongoDB aggregation pipelines
Image upload validation
Rate limiting
Input validation with express-validator
Cloudinary integration

Tech Stack:-

Frontend (User App):-

Next.js
React
Tailwind CSS
Firebase Authentication

Frontend (Admin Dashboard):-

Vite
React
Axios
Backend
Node.js
Express.js
MongoDB (Mongoose)
Cloudinary
JWT
express-validator
Rate limiting middleware

Deployment:-

Vercel (Frontend)
Render (Backend)
MongoDB Atlas (Database)


1. Install Dependencies

Backend:

cd backend
npm install

User App:

cd website
npm install

Admin Dashboard:

cd admin-dashboard
npm install

2. Run Development Servers

Backend:

npm run dev

User App:

npm run dev

Admin Dashboard:

npm run dev
API Overview
Authentication
POST /api/auth/google-login

User:-

GET /api/users/me
Images
POST /api/images/upload
GET /api/images
POST /api/images/:id/like
DELETE /api/images/:id
GET /api/images/liked

Admin:-

GET /api/images/admin/all
Security Considerations
JWT authentication for protected routes
Role-based access control (user/admin)
File type validation
File size limit enforcement
Rate limiting on upload routes
Server-side input validation

Project Structure:-

image-gallery-platform/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── config/
│
├── website/             # Next.js User Application
│
├── admin-dashboard/     # Vite Admin Panel
│
└── README.md

Production Highlights:-

Fully deployed multi-frontend architecture
Centralized backend API
Cloud-based image storage
OAuth integration
Scalable database design
Clean separation of concerns
Environment-based configuration
Production-ready deployment pipeline

Future Improvements :-

Image search and filtering
Comment system
Real-time updates
Analytics dashboard
Subscription and premium roles

CI/CD automation

Docker containerization
