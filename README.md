<div align="center">
  <img src="frontend/public/Logo.png" alt="JobTracker Logo" width="120" />

  # JobTracker
  ### Smart Job Application Manager

  **Track every application. Never miss a follow-up. Land your dream role faster.**

  [![Live Demo](https://img.shields.io/badge/Live%20Demo-job--track.pranavk.tech-6366f1?style=for-the-badge&logo=vercel)](https://job-track.pranavk.tech)
  [![Backend API](https://img.shields.io/badge/API-api.pranavk.tech-10b981?style=for-the-badge&logo=node.js)](https://api.pranavk.tech/api/health)
  [![GitHub](https://img.shields.io/badge/GitHub-beingzpranav-181717?style=for-the-badge&logo=github)](https://github.com/beingzpranav/Application-Tracker)
  [![Portfolio](https://img.shields.io/badge/Portfolio-pranavk.tech-f59e0b?style=for-the-badge&logo=googlechrome)](https://pranavk.tech)

  ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
  ![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)
  ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
  ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
  ![Express](https://img.shields.io/badge/Express-4-000000?logo=express)
</div>

---

## 📌 Overview

JobTracker is a full-stack web application that helps job seekers organise and manage their job search. It replaces messy spreadsheets with a clean, intelligent dashboard — complete with automated follow-up reminders, email alerts, resume management, and visual analytics.

Built with a **dark glassmorphism UI**, Google OAuth authentication, and a production-grade backend running on AWS EC2.

---

## ✨ Features

### 🎯 Core
| Feature | Description |
|---|---|
| **Application Tracking** | Add, edit, and delete job applications with company, role, date, priority, and status |
| **5 Status Types** | Applied → Interviewing → Offer / Rejected / No Response |
| **Priority Levels** | High / Medium / Low with colour-coded indicators |
| **Resume Upload** | Attach resumes per application via Cloudflare R2 cloud storage |
| **Job URL Linking** | Save the original job posting link with each application |
| **Notes & Activity Log** | Add notes and track status change history per application |

### 📊 Analytics Dashboard
| Feature | Description |
|---|---|
| **Success Rate** | Real-time offer and response rate tracking |
| **Weekly Trend Chart** | Bar chart of applications submitted per week |
| **Status Breakdown** | Doughnut chart of current application statuses |
| **Key Metrics** | Total applied, interviews, offers, rejection rate |

### 🔔 Intelligent Alerts
| Feature | Description |
|---|---|
| **Follow-up Reminders** | Email alert exactly 5 days after applying, reminding to follow up |
| **Stale Detection** | Email alert after 10 days of no status update |
| **In-app Notifications** | Bell icon with unread count for pending alerts |
| **One-shot Emails** | Alerts fire once only — not repeatedly |

### 📧 Email System
| Email | Trigger |
|---|---|
| **Welcome Email** | Sent on first Google sign-in with feature highlights |
| **Follow-up Reminder** | 5 days after application date (if still "Applied") |
| **Stale Alert** | 10+ days since last status update |
| **Feedback Receipt** | Forwarded to developer when user submits feedback |

### 🔒 Authentication & Security
- Google OAuth 2.0 via Passport.js
- JWT-based session management
- No passwords stored — ever
- HTTPS enforced on all endpoints

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite 5 | Build tool & dev server |
| React Router v6 | Client-side routing |
| Recharts | Analytics charts |
| Lucide React | Icon library |
| Tailwind-inspired custom CSS | Dark glassmorphism design system |

### Backend
| Technology | Purpose |
|---|---|
| Node.js 20 | Runtime |
| Express.js | HTTP server & routing |
| Mongoose | MongoDB ODM |
| Passport.js | Google OAuth strategy |
| node-cron | Scheduled jobs (alerts, keep-alive) |
| Nodemailer | Email delivery via Zoho Mail |
| Multer + AWS SDK | Resume upload to Cloudflare R2 |

### Infrastructure
| Service | Purpose |
|---|---|
| MongoDB Atlas | Cloud database |
| Cloudflare R2 | Resume file storage |
| AWS EC2 (Ubuntu) | Backend hosting |
| Nginx | Reverse proxy |
| PM2 | Process manager |
| Let's Encrypt | SSL certificates |
| Vercel | Frontend hosting |
| Zoho Mail | SMTP email provider |

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console project with OAuth 2.0 credentials

### 1. Clone the repository
```bash
git clone https://github.com/beingzpranav/Application-Tracker.git
cd Application-Tracker
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env   # then fill in your values
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
# create frontend/.env
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
```

The app will be available at `http://localhost:5173`

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/dbname

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Auth
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# Frontend URL (for CORS + email links)
FRONTEND_URL=http://localhost:5173

# Email (Zoho / Gmail SMTP)
SMTP_HOST=smtp.zoho.in
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_smtp_password
DEVELOPER_EMAIL=you@email.com

# Cloudflare R2 (resume storage)
CLOUDFLARE_R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret
CLOUDFLARE_R2_BUCKET_NAME=your_bucket
CLOUDFLARE_R2_PUBLIC_URL=https://your-r2-domain.com

NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📁 Project Structure

```
Application-Tracker/
├── backend/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   ├── mailer.js           # Nodemailer transporter + email template
│   │   └── passport.js         # Google OAuth strategy + welcome email
│   ├── controllers/
│   │   ├── applicationController.js
│   │   ├── authController.js
│   │   └── feedbackController.js
│   ├── cron/
│   │   └── staleDetection.js   # Follow-up + stale alert cron jobs
│   ├── middleware/
│   │   └── auth.js             # JWT verification middleware
│   ├── models/
│   │   ├── Application.js      # Application schema
│   │   └── User.js             # User schema
│   ├── routes/
│   │   ├── applicationRoutes.js
│   │   ├── authRoutes.js
│   │   └── feedbackRoutes.js
│   ├── .env                    # (gitignored)
│   └── server.js               # Entry point
│
├── frontend/
│   ├── public/
│   │   ├── Logo.png
│   │   ├── favicon.ico
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   ├── src/
│   │   ├── components/
│   │   │   ├── ApplicationModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ToastContainer.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Landing page
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Applications.jsx
│   │   │   ├── AddApplication.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── AuthCallback.jsx
│   │   │   ├── Privacy.jsx
│   │   │   └── Terms.jsx
│   │   ├── services/
│   │   │   └── api.js           # Axios API layer
│   │   ├── App.jsx              # Root + routing
│   │   ├── main.jsx
│   │   └── index.css            # Full design system
│   ├── .env.production          # Production API URL
│   ├── vercel.json              # SPA routing config
│   └── index.html               # SEO meta tags + structured data
│
├── favicons/                    # All favicon sizes
├── .gitignore
└── README.md
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/auth/google` | Initiate Google OAuth |
| `GET` | `/api/auth/google/callback` | OAuth callback |
| `GET` | `/api/auth/me` | Get current user |
| `POST` | `/api/auth/logout` | Logout |

### Applications
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/applications` | Get all applications |
| `POST` | `/api/applications` | Create application |
| `PUT` | `/api/applications/:id` | Update application |
| `DELETE` | `/api/applications/:id` | Delete application |
| `POST` | `/api/applications/:id/resume` | Upload resume |
| `GET` | `/api/applications/notifications` | Get pending alerts |

### Misc
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/feedback` | Submit feedback |
| `GET` | `/api/health` | Health check |

---

## 🚢 Deployment

### Backend — AWS EC2 + Nginx + PM2

```bash
# On EC2 (Ubuntu 22.04)
git clone https://github.com/beingzpranav/Application-Tracker.git
cd Application-Tracker/backend
npm install

# Create .env with production values
nano .env

# Start with PM2
pm2 start server.js --name jobtracker-api
pm2 startup && pm2 save

# Nginx reverse proxy
sudo nano /etc/nginx/sites-available/jobtracker
# proxy_pass http://localhost:5001;

# SSL
sudo certbot --nginx -d api.pranavk.tech
```

### Frontend — Vercel

```bash
# Set environment variable in Vercel dashboard:
VITE_API_URL=https://api.pranavk.tech/api

# Then deploy via GitHub integration or:
vercel --prod
```

---

## 🔧 Cron Jobs

| Job | Schedule | Action |
|---|---|---|
| Follow-up alerts | Daily 9:00 AM | Email users whose applications are exactly 5 days old with no update |
| Stale detection | Daily 9:00 AM | Email users whose applications haven't been updated in 10+ days |
| Keep-alive ping | Every 14 min | Self-ping `/api/health` to prevent cold starts |

---

## 📄 Legal

- [Privacy Policy](https://job-track.pranavk.tech/privacy)
- [Terms & Conditions](https://job-track.pranavk.tech/terms)

---

## 👤 Author

**Pranav Khandelwal**

[![Portfolio](https://img.shields.io/badge/pranavk.tech-visit-6366f1?style=flat-square&logo=googlechrome)](https://pranavk.tech)
[![GitHub](https://img.shields.io/badge/@beingzpranav-follow-181717?style=flat-square&logo=github)](https://github.com/beingzpranav)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-connect-0077B5?style=flat-square&logo=linkedin)](https://linkedin.com/in/beingzpranav)
[![Email](https://img.shields.io/badge/contact@pranavk.tech-email-EA4335?style=flat-square&logo=gmail)](mailto:contact@pranavk.tech)

---

<div align="center">
  <sub>Built with ❤️ · © 2026 JobTracker</sub>
</div>
