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


Deployment:-

Vercel (Frontend)

Render (Backend)

MongoDB Atlas (Database)

Install Dependencies

Backend:

cd backend
npm install

User App:

cd website
npm install

Admin Dashboard:

cd admin-dashboard
npm install


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
