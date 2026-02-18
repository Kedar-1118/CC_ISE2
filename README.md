# API Mock Server as a Service

A cloud-hosted developer tool (PaaS) where you can upload/paste JSON data and instantly generate hosted mock REST APIs with full CRUD functionality. Built with the MERN stack.

## Features

- **Create Mock API Projects** — Define your data schema as JSON
- **Auto-generate REST Endpoints** — Full CRUD (GET, POST, PUT, DELETE) per collection
- **Public Hosted URLs** — Shareable, Postman-testable endpoints
- **Built-in API Tester** — Test your mock APIs right from the dashboard
- **Request Logging** — Track endpoint hits, methods, timestamps

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI
npm install
npm run dev
```

Server runs at `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | React 19 + Vite               |
| Backend   | Node.js + Express 4           |
| Database  | MongoDB Atlas (Mongoose 8)    |
| Styling   | Vanilla CSS (dark theme)      |

## Project Structure

```
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/              # Business logic
│   │   ├── projectController.js  # Project CRUD
│   │   ├── mockController.js     # Dynamic mock engine
│   │   └── logController.js      # Request logs
│   ├── middleware/               # Express middleware
│   │   ├── requestLogger.js      # Logs /mock/* requests
│   │   └── errorHandler.js       # Global error handler
│   ├── models/                   # Mongoose schemas
│   │   ├── Project.js
│   │   └── RequestLog.js
│   ├── routes/                   # Route definitions
│   │   ├── projectRoutes.js
│   │   ├── mockRoutes.js
│   │   └── logRoutes.js
│   └── server.js                 # Entry point
├── frontend/
│   └── src/
│       ├── components/           # Reusable UI components
│       ├── pages/                # Route pages
│       ├── services/api.js       # Axios API layer
│       ├── App.jsx               # Router setup
│       └── index.css             # Global styles
├── API_DOCS.md                   # API documentation
├── DEPLOYMENT.md                 # Deployment guide
└── README.md
```

## How It Works

1. **Create a project** with a name and JSON data
2. **JSON keys become collections**, values (arrays) become records
3. **REST endpoints are auto-generated** for each collection
4. **CRUD operations** modify the stored data in real-time

### Example

Upload this JSON:
```json
{
  "users": [
    { "name": "Alice", "email": "alice@example.com" }
  ],
  "posts": [
    { "title": "Hello World", "body": "My first post" }
  ]
}
```

Get these endpoints:
```
GET    /mock/my-project/users
POST   /mock/my-project/users
GET    /mock/my-project/users/:id
PUT    /mock/my-project/users/:id
DELETE /mock/my-project/users/:id
... (same for /posts)
```

## License

MIT
