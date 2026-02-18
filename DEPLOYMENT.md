# Deployment Guide

Step-by-step instructions to deploy the API Mock Server as a Service platform.

---

## 1. MongoDB Atlas Setup

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a new **Cluster** (free M0 tier is sufficient)
3. Go to **Database Access** → Add Database User:
   - Username: `mockapi-admin`
   - Password: generate a strong password
   - Role: Read and Write to Any Database
4. Go to **Network Access** → Add IP Address:
   - For development: Add your current IP
   - For production: Add `0.0.0.0/0` (allow from anywhere)
5. Go to **Database** → **Connect** → **Drivers**:
   - Copy the connection string
   - Replace `<password>` with your user's password
   - Replace `<dbname>` with `mock-api-service`

Your URI should look like:
```
mongodb+srv://mockapi-admin:<password>@cluster0.abc123.mongodb.net/mock-api-service?retryWrites=true&w=majority
```

---

## 2. Backend Deployment (Render)

### Using Render (recommended free tier)

1. Push your `backend/` folder to a GitHub repository
2. Go to [https://render.com](https://render.com) → New → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name:** `mockapi-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add Environment Variables:
   - `PORT` = `5000`
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = your Atlas connection string
   - `CORS_ORIGIN` = your frontend URL (e.g., `https://mockapi.vercel.app`)
6. Click **Create Web Service**
7. Note the deployed URL (e.g., `https://mockapi-backend.onrender.com`)

### Using Railway (alternative)

1. Go to [https://railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo, set root directory to `backend`
3. Add the same environment variables as above
4. Railway auto-detects Node.js and deploys

---

## 3. Frontend Deployment (Vercel)

### Using Vercel (recommended)

1. Push your `frontend/` folder to a GitHub repository
2. Go to [https://vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo
4. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add Environment Variable:
   - `VITE_API_URL` = your backend URL (e.g., `https://mockapi-backend.onrender.com`)
6. Click **Deploy**

### Using Netlify (alternative)

1. Go to [https://netlify.com](https://netlify.com) → Add New Site → Import from Git
2. Select your repo
3. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
4. Add Environment Variable:
   - `VITE_API_URL` = your backend URL
5. Add a `frontend/public/_redirects` file with:
   ```
   /*    /index.html   200
   ```
   (This ensures client-side routing works)
6. Deploy

---

## 4. Environment Variables Summary

### Backend (`.env`)

| Variable      | Description                        | Example                                         |
|---------------|------------------------------------|-------------------------------------------------|
| `PORT`        | Server port                        | `5000`                                          |
| `NODE_ENV`    | Environment mode                   | `production`                                    |
| `MONGODB_URI` | MongoDB Atlas connection string    | `mongodb+srv://user:pass@cluster.mongodb.net/db`|
| `CORS_ORIGIN` | Allowed frontend origin            | `https://mockapi.vercel.app`                    |

### Frontend (`.env`)

| Variable       | Description        | Example                                       |
|----------------|--------------------|-----------------------------------------------|
| `VITE_API_URL` | Backend API base   | `https://mockapi-backend.onrender.com`        |

---

## 5. Post-Deployment Checklist

- [ ] Verify backend health: `GET {backend-url}/api/health`
- [ ] Create a test project through the frontend
- [ ] Test mock endpoints with Postman or curl
- [ ] Verify request logs are being recorded
- [ ] Test CORS by making requests from the frontend
- [ ] Check MongoDB Atlas dashboard for data

---

## 6. Optional Advanced Features (Outline)

### API Key Authentication
- Add an `apiKey` field to the Project model
- Generate a UUID key on project creation
- Middleware to validate `x-api-key` header on `/mock/*` routes

### Rate Limiting Per Project
- Use `express-rate-limit` with a custom key generator based on project basePath
- Store limits in the Project model

### Swagger Auto Documentation
- Use `swagger-jsdoc` + `swagger-ui-express`
- Auto-generate OpenAPI spec from project collections

### GraphQL Mock APIs
- Use `express-graphql` + `graphql`
- Auto-generate schema from collection structure

### Response Delay Simulation
- Add a `?delay=1000` query parameter
- Middleware applies `setTimeout` before responding
