# Campus Cleanliness Reporting & Monitoring System

A comprehensive, full-stack, role-based web application designed to streamline the reporting, assignment, and resolution of cleanliness and infrastructure issues across a university campus. The system enforces full accountability through a structured **Pending → Assigned → In Progress → Resolved → Completed** lifecycle and features advanced AI integrations for smart routing.

**Live Demo:** [campus-clean-system-demo.vercel.app](https://campus-clean-system-demo.vercel.app)

---

## 🌟 Application Overview & Functioning

The system is built to digitize and automate facility management. It allows students or staff members to quickly report issues (e.g., broken equipment, cleanliness problems, safety hazards). These reports are intelligently analyzed by an integrated AI engine to determine priority, category, and SLAs. 

Administrators get a bird's-eye view of campus health and can assign issues to appropriate maintenance staff. Staff members receive these assignments on a dedicated dashboard, perform the necessary fixes, and upload proof of resolution. Finally, the administration verifies the fix and closes the loop.

### Complete Data Lifecycle
1. **Report Submission:** Student/Guest submits a report with description, location, and optional photo. AI analyzes it in real-time.
2. **Pending:** The issue is logged in the system. High priority/SOS issues are highlighted.
3. **Assigned:** Admin reviews the issue and assigns it to an available staff member.
4. **In Progress:** Staff member clicks "Start Mission" on their dashboard when they begin work.
5. **Resolved:** Staff member completes the task, uploading proof of work (photo).
6. **Completed:** Admin verifies the proof and officially closes the task. Student is notified and can leave a rating.

---

## ✨ Key Features

### 🎓 Student / User Portal
- **Smart Issue Reporting:** Submit issues with AI auto-detecting the category, priority, and generating a 1-10 urgency score based on the description.
- **SOS Emergency Reporting:** A dedicated toggle for critical issues (e.g., electrical fires, structural collapse) that immediately escalates the ticket.
- **Evidence Upload:** Upload photo evidence directly from the device. The system auto-assigns location thumbnails if no photo is provided.
- **Real-Time Tracking:** Track the exact status of the complaint (Pending → Assigned → In Progress → Resolved → Completed).
- **Service Rating:** Rate the quality of the fix once the issue is completed.

### 🧹 Staff Dashboard
- **Active Task Feed:** View only actively assigned tasks; completed tasks are hidden to keep the workspace clean.
- **Mission Control:** One-click **Start Mission** to transition a task to "In Progress".
- **Proof of Work Upload:** **Complete & Upload Proof** feature allows staff to snap a photo of the completed job to move it to "Resolved".
- **Visual Priorities:** Clear color-coded priority indicators (High / Medium / Low / Critical) auto-assigned by AI to guide daily schedules.

### 🛡️ Admin Dashboard & Analytics
- **Master Control Panel:** Full complaint data table with dynamic filtering by **Region**, **Category**, and real-time location search.
- **Smart Assignment:** Assign and re-assign tasks to staff members directly from the table.
- **Verification Workflow:** **Verify & Complete** functionality requires an admin to review staff proof before officially closing a ticket.
- **Advanced Analytics:** Region and category breakdowns, SLA monitoring, and resolution metrics.
- **AI Campus Health Insight:** Generates an automated letter grade (A+ to F) and summary of overall campus health, identifying top risk areas and providing actionable recommendations.

### 🤖 AI Engine Integration (OpenRouter / Gemini)
- **10 Infrastructure Categories:** Cleaning, Electrical, Structural, Plumbing, IT/Network, Safety Hazard, Pest Control, Gardening, Fire Safety, Other.
- **Intelligent Assessment:** Automatically suggests SLAs (e.g., 2 hours for critical, 72 hours for low) and actionable steps for the staff.
- **Resilient Fallback:** If the external AI API is unavailable, the system gracefully falls back to a robust, instant **local heuristic analyzer** ensuring 100% uptime.

### 🔐 Authentication & Security
- **Secure Credentials:** Email/password login and registration with Bcrypt-hashed passwords.
- **Google OAuth 2.0:** Exchange a Google profile for a secure backend JWT.
- **Guest Access:** Instant, frictionless student access without credentials.
- **RBAC:** Role-Based Access Control enforcing strict separation between Admin, Staff, and Student routes, verified by JWT middleware.

---

## 🏗️ Architecture & Tech Stack

```text
┌─────────────────────┐        ┌─────────────────────┐
│   React + Vite      │──API──▶│  Express + Sequelize │
│   Port 3000         │◀──────│  Port 3001           │
│   (Vite proxies     │        │  SQLite database     │
│    /api to 3001)    │        │  JWT auth            │
└─────────────────────┘        └─────────────────────┘
```

**Frontend (Port 3000):**
- React 19 · Vite
- Tailwind CSS v4 · Motion (Framer Animations)
- Recharts (Analytics) · Lucide React (Icons)
- React Router DOM v7

**Backend (Port 3001):**
- Node.js · Express
- Sequelize ORM · SQLite (Zero-config Relational DB)
- JWT (JSON Web Tokens) · Bcryptjs
- Multer (File handling)

**External / Integrations:**
- OpenRouter API (Google Gemini Flash 1.5 for AI)
- Cloudinary (Image Cloud Storage)
- Google OAuth

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **npm**

### Installation

```bash
# 1. Clone the repository and install dependencies
npm install

# 2. Copy the environment variables template
cp .env.example .env
```

### Configuration (`.env`)
Edit the `.env` file to include your secrets:
- `JWT_SECRET` (Required) - Secret for signing user sessions.
- `VITE_OPENROUTER_API_KEY` (Optional) - For AI analysis (falls back to local logic if empty).
- `VITE_GOOGLE_CLIENT_ID` (Optional) - Enables Google Sign-In.
- `CLOUDINARY_*` (Optional) - For real image uploads.

### Running Locally (Two Terminals)

```bash
# Terminal 1 — Start the Express API Server (runs on Port 3001)
npm run dev:server

# Terminal 2 — Start the Vite Frontend (runs on Port 3000)
npm run dev:client
```

Open **http://localhost:3000** in your browser.

### Test Accounts (Included in Seed Data)

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@campus.com       | admin123    |
| Staff   | staff@campus.com       | staff123    |
| Student | student@test.com       | password123 |
| Guest   | *(click Guest button)* | —           |

---

## 📂 Project Structure

```text
campus-cleanliness-system/
├── server/                   # Express Backend
│   ├── config/               # Sequelize + SQLite configuration
│   ├── controllers/          # API Handlers (Auth, Complaints)
│   ├── middleware/           # JWT & RBAC Verification
│   ├── models/               # Sequelize DB Models
│   ├── routes/               # Express Route Definitions
│   └── index.ts              # Server Entry Point (Port 3001)
├── src/                      # React Frontend
│   ├── components/           # UI Components (Navbar, Modals, Forms)
│   ├── context/              # React Context (Auth, Theme)
│   ├── lib/                  # AI Analyzer & Utilities
│   ├── pages/                # Route Views (Dashboards, Login, Form)
│   ├── App.tsx               # App Router & Protected Routes
│   └── main.tsx              # Root Render & Providers
├── .env.example              # Environment Variable Template
├── vercel.json               # Production Deployment Config
├── vite.config.ts            # Vite Setup & API Proxy Rules
└── package.json              # Project Dependencies & Scripts
```

---

## 📜 License

This project is licensed under the MIT License.
