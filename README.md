# ClassMitra — Low-Bandwidth Smart Classroom Prototype

ClassMitra is a smart classroom prototype developed for **Smart India Hackathon (SIH) 2025**, with a focus on making digital learning more accessible in environments with limited connectivity.

The platform provides separate student and teacher interfaces for sharing learning material, announcements, questions, quizzes, and live classroom interaction.

## Overview

The project explores how a lightweight web-based classroom system can support communication between students and teachers through a single platform.

The current prototype includes:

- Student and Teacher dashboards
- Lesson sharing and downloading
- Quiz dashboard
- Real-time announcements
- Student doubt/question posting
- Live lecture prototype using WebRTC
- Socket.IO-based signalling for real-time communication
- Firebase Firestore integration
- Cloud-based lesson uploads
- Responsive interface and client-side routing

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- JavaScript

### Backend / Services
- Firebase Firestore
- Cloudinary
- Express
- Socket.IO
- WebRTC

## Main Features

### Student Dashboard

Students can:

- View available learning material
- Download uploaded lessons
- View announcements in real time
- Post questions or doubts
- Access the quiz section
- Join a live lecture session

Firestore listeners are used to update lesson, announcement, and doubt data dynamically.

### Teacher Dashboard

Teachers can:

- Upload lesson resources
- Publish announcements
- View questions submitted by students
- Start and stop a live lecture session

Uploaded resources are stored through Cloudinary, while related lesson information is maintained in Firestore.

### Live Lecture Prototype

The project contains an experimental live-classroom implementation using:

- WebRTC for peer-to-peer media communication
- Socket.IO for signalling
- Express-based signalling server

The teacher creates a WebRTC session and students can connect to receive the lecture stream.

### Lessons and Quizzes

Separate dashboards are provided for lesson and quiz resources.

Lesson information is retrieved from Firestore and presented through a simple downloadable resource interface.

## Project Structure

```text
src/
├── components/
│   └── Navbar.jsx
├── pages/
│   ├── Home.jsx
│   ├── Student.jsx
│   ├── Teacher.jsx
│   ├── lessonsdashboard.jsx
│   └── quizzes.jsx
├── App.jsx
├── firebase.js
└── main.jsx

server.js
package.json
vite.config.js
