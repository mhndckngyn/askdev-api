# 💬 Programming Q&A Forum

---

## 📖 Overview

The backend is a RESTful API server built with **Node.js + Express.js + TypeScript**, serving as the core of a Stack Overflow-style Q&A forum for the Vietnamese programming community. It handles all business logic including authentication, Q&A management, voting, notifications, content reporting, and admin operations. It also integrates **Google Gemini AI** for automatic content moderation and **Cloudinary** for image storage.

---

## 🛠️ Tech Stack

| Technology | Description |
|------------|-------------|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | Lightweight REST API framework |
| **TypeScript** | Static typing for safer, maintainable code |
| **PostgreSQL** | Relational database |
| **Prisma** | Type-safe ORM — schema management, migrations, query builder |
| **Google Gemini API** | AI content moderation — detects toxic/harmful posts |
| **Cloudinary** | Cloud image upload and storage |
| **JWT** | Stateless authentication via signed tokens |
| **Git / GitHub** | Source control |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/         # Request handlers per resource
│   │   ├── auth.controller.ts
│   │   ├── question.controller.ts
│   │   ├── answer.controller.ts
│   │   ├── comment.controller.ts
│   │   ├── tag.controller.ts
│   │   ├── user.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── report.controller.ts
│   │   └── admin.controller.ts
│   ├── routes/              # Express route definitions
│   ├── services/            # Business logic layer
│   ├── middleware/          # Auth, error handling, content moderation
│   ├── utils/               # Gemini AI helper, Cloudinary helper, etc.
│   └── index.ts             # App entry point
├── prisma/
│   ├── schema.prisma        # Database schema and relations
│   └── migrations/          # Auto-generated migration history
├── .env                     # Environment configuration
└── package.json
```

---

## 🗂️ Database Schema

Managed via **Prisma** with **PostgreSQL**. The schema includes 18 tables:

| Table | Purpose |
|-------|---------|
| `USER` | Profile: display name, avatar, bio, reputation score |
| `ACCOUNT` | Auth credentials: email, hashed password, OAuth provider |
| `QUESTION` | Question title, body (markdown), status, view count, author |
| `TAG` | Topic tags with Vietnamese and English descriptions |
| `QUESTION_TAG` | Many-to-many: questions ↔ tags |
| `QUESTION_EDIT` | Full edit history for questions |
| `QUESTION_VOTE` | Upvote/downvote records per user per question |
| `ANSWER` | Answer body, accepted status, author, parent question |
| `ANSWER_EDIT` | Full edit history for answers |
| `ANSWER_VOTE` | Upvote/downvote records per user per answer |
| `COMMENT` | Comments on answers |
| `COMMENT_EDIT` | Edit history for comments |
| `COMMENT_VOTE` | Votes on comments |
| `REPORT` | User-submitted reports on content with status tracking |
| `PASSWORD_RESET_TOKEN` | Secure time-limited tokens for password reset |
| `HISTORY` | User activity log (ask, answer, comment, vote) |
| `BAN_LOG` | Admin ban/unban action history per user |
| `NOTIFICATION` | Notification records (answer, comment, vote events) |

### Enums

| Enum | Values |
|------|--------|
| `Role` | `USER`, `ADMIN` |
| `AuthProvider` | `EMAIL`, OAuth providers |
| `ContentType` | `QUESTION`, `ANSWER`, `COMMENT` |
| `ReportStatus` | `PENDING`, `REVIEWED`, `REJECTED` |
| `NotificationType` | Answer, Comment, Vote, System, etc. |
| `HistoryType` | Question, Answer, Comment, Vote, etc. |
| `BanAction` | `BAN`, `UNBAN` |

---

## 🔐 Authentication & Authorization

- **JWT Bearer Token** — issued on login, required in `Authorization` header for protected routes
- **Role-based access** — `USER` and `ADMIN` roles enforced via middleware
- **Password hashing** — bcrypt
- **OAuth support** — social login via `AuthProvider` enum
- **Password reset** — secure token stored in `PASSWORD_RESET_TOKEN` with expiry

---

## 🤖 AI Content Moderation

Every question, answer, and comment submission passes through a **Google Gemini API** check before being saved. The moderation middleware:

1. Sends the content to Gemini with a safety classification prompt
2. If harmful/toxic content is detected → rejects the request with a descriptive error
3. If content is safe → proceeds to save to the database

This prevents offensive or inappropriate posts from ever reaching the database.

---

## 📡 API Endpoints Overview

| Module | Base Route | Key Actions |
|--------|-----------|-------------|
| **Auth** | `/api/auth` | Register, Login, Logout, Forgot Password, Reset Password, Change Password |
| **Questions** | `/api/questions` | CRUD, vote, search by keyword, filter by tag, view count |
| **Answers** | `/api/answers` | CRUD, vote, mark as accepted |
| **Comments** | `/api/comments` | CRUD, vote |
| **Tags** | `/api/tags` | List all, search, get questions by tag |
| **Users** | `/api/users` | Get profile, edit profile, activity history, leaderboard |
| **Notifications** | `/api/notifications` | List, mark as read, mark all as read |
| **Reports** | `/api/reports` | Submit report on question/answer/comment |
| **Admin — Users** | `/api/admin/users` | List, filter, ban/unban, change role |
| **Admin — Questions** | `/api/admin/questions` | List, filter, hide/show, delete, bulk actions |
| **Admin — Answers** | `/api/admin/answers` | List, filter, hide/show, delete, bulk actions |
| **Admin — Comments** | `/api/admin/comments` | List, filter, hide/show, delete, bulk actions |
| **Admin — Tags** | `/api/admin/tags` | CRUD, merge duplicate tags |
| **Admin — Reports** | `/api/admin/reports` | List, review, accept, reject, update status |
| **Admin — Stats** | `/api/admin/stats` | Platform overview, content analytics, report breakdown |

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.x
- PostgreSQL >= 14
- Google AI API key
- Cloudinary account

### Installation

```bash
git clone <repository-url>
cd backend
npm install
```

### Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/forum_db"

# JWT
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="7d"

# Google Gemini AI
GEMINI_API_KEY="your_google_ai_api_key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# App
PORT=5000
CLIENT_URL="http://localhost:5173"
```

### Database Setup

```bash
# Run all migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# (Optional) Seed the database
npx prisma db seed
```

### Start the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

API available at: `http://localhost:5000`

---

## 📈 Strengths

- ✅ Clean layered architecture: Routes → Controllers → Services → Prisma
- ✅ Type-safe database access with Prisma + TypeScript
- ✅ AI moderation prevents harmful content at the API level
- ✅ Full edit history tracking for all content types
- ✅ Reputation scoring system tied to votes
- ✅ Admin bulk actions for efficient content moderation
- ✅ Tag merge feature to maintain clean taxonomy

---

## ⚠️ Known Limitations

- Image upload latency from Cloudinary can exceed 2 seconds
- No caching layer — performance may degrade under high concurrent load
- No WebSocket — notifications are polling-based, not real-time push

---

## 🔭 Future Development

- 🔍 **Similar question detection** — query Gemini to suggest duplicates before posting
- 🤖 **AI answer summarization** — condense long answer threads
- 🏅 **Badge system** — award badges based on `HISTORY` milestones
- 📧 **Email notifications** — send digest emails for new answers
- 🚀 **CI/CD pipeline** — automated testing and deployment workflow
- ⚡ **Redis caching** — cache hot questions and leaderboard data

---

## 📚 References

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Google Gemini API](https://ai.google.dev/gemini-api/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---
