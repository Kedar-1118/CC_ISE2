<div align="center">

## 🌐 [Live Demo → cc-ise-2.vercel.app](https://cc-ise-2.vercel.app/)

> **Click above to try it instantly — no signup, no setup required.**

---

# 🚀 API Mock Server as a Service

**Instantly spin up hosted mock REST APIs from JSON — no backend needed.**

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-cc--ise--2.vercel.app-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://cc-ise-2.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)

<br/>

> A cloud-hosted PaaS tool where you paste JSON and instantly get fully functional, shareable REST API endpoints — complete with CRUD operations, request logging, and a built-in tester.

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📁 **Mock API Projects** | Define your data schema as JSON and create a project in seconds |
| ⚡ **Auto-generated Endpoints** | Full CRUD (GET, POST, PUT, DELETE) per collection, instantly |
| 🌍 **Public Hosted URLs** | Shareable, Postman-testable endpoints with no setup |
| 🧪 **Built-in API Tester** | Test your mock APIs right from the dashboard |
| 📊 **Request Logging** | Track endpoint hits, HTTP methods, and timestamps in real-time |

---

## 🎯 How It Works

```
1. Create a project  →  Paste your JSON data
2. JSON keys         →  Become collections
3. Array values      →  Become records
4. REST endpoints    →  Auto-generated instantly
5. CRUD operations   →  Modify stored data in real-time
```

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

Instantly get these hosted endpoints:

```
GET    /mock/my-project/users
POST   /mock/my-project/users
GET    /mock/my-project/users/:id
PUT    /mock/my-project/users/:id
DELETE /mock/my-project/users/:id

GET    /mock/my-project/posts
POST   /mock/my-project/posts
GET    /mock/my-project/posts/:id
PUT    /mock/my-project/posts/:id
DELETE /mock/my-project/posts/:id
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| 🖥️ Frontend | React 19 + Vite |
| ⚙️ Backend | Node.js + Express 4 |
| 🗄️ Database | MongoDB Atlas (Mongoose 8) |
| 🎨 Styling | Vanilla CSS (dark theme) |

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** 18+
- **MongoDB Atlas** account (or local MongoDB)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/api-mock-server.git
cd api-mock-server
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI
npm install
npm run dev
```

> Server runs at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

> App runs at `http://localhost:5173`

---

## 📁 Project Structure

```
api-mock-server/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── projectController.js   # Project CRUD logic
│   │   ├── mockController.js      # Dynamic mock engine
│   │   └── logController.js       # Request log handling
│   ├── middleware/
│   │   ├── requestLogger.js       # Logs /mock/* requests
│   │   └── errorHandler.js        # Global error handler
│   ├── models/
│   │   ├── Project.js             # Project schema
│   │   └── RequestLog.js          # Log schema
│   ├── routes/
│   │   ├── projectRoutes.js
│   │   ├── mockRoutes.js
│   │   └── logRoutes.js
│   └── server.js                  # Entry point
│
├── frontend/
│   └── src/
│       ├── components/            # Reusable UI components
│       ├── pages/                 # Route pages
│       ├── services/api.js        # Axios API layer
│       ├── App.jsx                # Router setup
│       └── index.css              # Global styles
│
├── API_DOCS.md                    # Full API documentation
├── DEPLOYMENT.md                  # Deployment guide
└── README.md
```

---

## 🌐 Live Demo

Try it out without any setup:

**[https://cc-ise-2.vercel.app/](https://cc-ise-2.vercel.app/)**

1. Visit the demo
2. Create a new project with sample JSON
3. Copy your generated endpoint URLs
4. Test them in Postman, your browser, or the built-in tester

---

## 📖 Documentation

- 📄 [API Documentation](./API_DOCS.md) — Full endpoint reference
- 🚀 [Deployment Guide](./DEPLOYMENT.md) — Deploy to Vercel, Railway, Render, etc.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ using the MERN Stack

**[⭐ Star this repo](https://github.com/your-username/api-mock-server)** if you find it useful!

</div>
