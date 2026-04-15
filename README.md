# Smart Job Application Tracker

A full-stack web application to track, manage, and analyze job applications with intelligent reminders and analytics.

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite + Recharts + Lucide Icons
- **Backend**: Node.js + Express.js + Mongoose
- **Database**: MongoDB
- **Automation**: node-cron (stale detection)

## 📋 Features

- ✅ Full CRUD for job applications
- ✅ 5 status types: Applied, Interview, Offer, Rejected, No Response
- ✅ Auto follow-up reminders (5 days after applying)
- ✅ Stale detection (10+ days no update)
- ✅ Priority management (High/Medium/Low)
- ✅ Activity logging
- ✅ Dashboard with analytics & charts
- ✅ Search, filter & sort
- ✅ Toast notifications
- ✅ Premium dark UI with glassmorphism

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend
```bash
cd backend
npm install
# Update .env with your MongoDB URI
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

**Backend** (`backend/.env`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-job-tracker
```

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:5000/api
```

## 📁 Project Structure

```
├── backend/
│   ├── config/db.js            # MongoDB connection
│   ├── models/Application.js   # Mongoose schema
│   ├── controllers/            # Route handlers
│   ├── routes/                 # API routes
│   ├── middleware/             # Validation
│   ├── cron/                   # Scheduled jobs
│   └── server.js              # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI
│   │   ├── pages/             # Dashboard, Applications, Add, Notifications
│   │   ├── services/api.js    # Axios API layer
│   │   ├── context/           # Notification context
│   │   ├── App.jsx            # Root component
│   │   └── index.css          # Design system
│   └── index.html
└── README.md
```
