# Campus Cleanliness Reporting & Monitoring System

A comprehensive, role-based web application designed to streamline the reporting and resolution of cleanliness issues on a university campus. This system ensures accountability, transparency, and rapid response through a structured lifecycle for every reported complaint.

## 🌟 Key Features

### 🎓 Student Dashboard
- **Report Issues**: Quickly submit reports with descriptions, locations, and photo evidence.
- **Track Progress**: Real-time status updates (Pending, In Progress, Completed, Closed).
- **Feedback Loop**: Rate the quality of service once a complaint is resolved.
- **Search & Filter**: Easily find previous reports by location or description.

### 🧹 Staff Dashboard
- **Task Management**: View assigned tasks with priority indicators (High, Medium, Low).
- **Status Updates**: Mark tasks as "In Progress" or "Completed".
- **Proof of Work**: Upload photos as evidence of completed tasks.
- **Location Context**: Integrated map pins and detailed location descriptions.

### 🛡️ Admin Dashboard
- **Centralized Monitoring**: Overview of all active and resolved campus issues.
- **Smart Assignment**: Assign specific staff members to pending reports.
- **Analytics & Insights**: Visual data on hotspots, response times, and staff performance.
- **Role Management**: Oversee the entire system's health and efficiency.

## 🏗️ Technical Architecture

The project follows a modern full-stack architecture with a clear separation of concerns.

### Frontend
- **React 19**: Core UI library.
- **Vite**: High-performance build tool and development server.
- **Tailwind CSS v4**: Utility-first styling with the latest features.
- **Lucide React**: Minimalist and consistent iconography.
- **Recharts**: Interactive data visualization for analytics.
- **Motion**: Smooth animations and transitions.

### Backend
- **Node.js & Express**: Robust server-side framework.
- **Sequelize ORM**: Database management and abstraction.
- **SQLite**: Lightweight, file-based database (ideal for development and small-scale deployment).
- **JWT (JSON Web Tokens)**: Secure, stateless authentication.
- **Bcryptjs**: Industry-standard password hashing.
- **Multer**: Middleware for handling multipart/form-data (file uploads).

### Data Flow
1. **Authentication**: Users log in via JWT-protected routes.
2. **Reporting**: Students submit complaints which are stored in the database.
3. **Assignment**: Admins assign staff to complaints.
4. **Resolution**: Staff update status and provide proof.
5. **Closure**: Students provide feedback, and the lifecycle completes.

## 🚀 Getting Started

To implement and run this project on your local machine or another device, follow these steps:

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)

### Installation & Setup

1. **Clone the repository** (or download the source code).
2. **Navigate to the project directory**:
   ```bash
   cd campus-cleanliness-system
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   Create a `.env` file in the root directory based on `.env.example`.
   ```env
   JWT_SECRET=your_super_secret_key
   GEMINI_API_KEY=your_gemini_api_key (optional)
   ```
5. **Run the development server**:
   ```bash
   npm run dev
   ```
6. **Access the application**:
   Open your browser and go to `http://localhost:3000`.

## 📂 Project Structure

```text
├── server/               # Backend Express server
│   ├── config/           # Database configuration
│   ├── controllers/      # Route logic handlers
│   ├── models/           # Sequelize database models
│   ├── routes/           # API endpoint definitions
│   └── index.ts          # Server entry point
├── src/                  # Frontend React application
│   ├── api/              # Axios instance and API calls
│   ├── components/       # Reusable UI components
│   ├── context/          # Auth and global state
│   ├── lib/              # Utilities and mock data
│   ├── pages/            # Main dashboard and form views
│   ├── App.tsx           # Routing and protected routes
│   └── main.tsx          # React entry point
├── public/               # Static assets
├── index.html            # HTML template
└── package.json          # Project dependencies and scripts
```

## 🧪 Demo Mode (Mock Data)

The current version of the application includes a **Mock Data Mode** for UI demonstration. This allows you to explore all features without a live backend connection.

- **Admin Login**: Use any email containing `admin` (e.g., `admin@test.com`).
- **Staff Login**: Use any email containing `staff` (e.g., `staff@test.com`).
- **Student Login**: Use any other email.

## 📜 License

This project is open-source and available under the MIT License.
