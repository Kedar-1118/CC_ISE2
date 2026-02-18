# API Documentation

Base URL: `http://localhost:5000` (development)

---

## Health Check

### `GET /api/health`

Returns server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-18T10:00:00.000Z"
}
```

---

## Project Management

### Create Project

**`POST /api/projects`**

Creates a new mock API project.

**Request Body:**
```json
{
  "projectName": "My E-commerce API",
  "jsonData": {
    "users": [
      { "name": "Alice", "email": "alice@example.com" },
      { "name": "Bob", "email": "bob@example.com" }
    ],
    "products": [
      { "title": "Laptop", "price": 999 },
      { "title": "Phone", "price": 699 }
    ]
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "65abc123def4567890ghij12",
    "projectName": "My E-commerce API",
    "basePath": "my-e-commerce-api",
    "collections": {
      "users": [
        { "_id": "uuid-1", "name": "Alice", "email": "alice@example.com" },
        { "_id": "uuid-2", "name": "Bob", "email": "bob@example.com" }
      ],
      "products": [
        { "_id": "uuid-3", "title": "Laptop", "price": 999 },
        { "_id": "uuid-4", "title": "Phone", "price": 699 }
      ]
    },
    "createdAt": "2026-02-18T10:00:00.000Z"
  }
}
```

**Error (409):**
```json
{ "success": false, "error": "A project with that name already exists" }
```

---

### List All Projects

**`GET /api/projects`**

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "65abc...",
      "projectName": "My E-commerce API",
      "basePath": "my-e-commerce-api",
      "collectionNames": ["users", "products"],
      "collectionCount": 2,
      "createdAt": "2026-02-18T10:00:00.000Z"
    }
  ]
}
```

---

### Get Single Project

**`GET /api/projects/:id`**

Returns full project data including all collection records.

**Response (200):** Same structure as create response.

**Error (404):**
```json
{ "success": false, "error": "Project not found" }
```

---

### Delete Project

**`DELETE /api/projects/:id`**

Deletes project and all associated request logs.

**Response (200):**
```json
{ "success": true, "data": {} }
```

---

### Get Project Logs

**`GET /api/projects/:id/logs`**

Returns the 100 most recent request logs for a project.

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "projectId": "65abc...",
      "endpoint": "/mock/my-e-commerce-api/users",
      "method": "GET",
      "body": null,
      "statusCode": 200,
      "timestamp": "2026-02-18T10:05:00.000Z"
    }
  ]
}
```

---

## Dynamic Mock API Endpoints

These are the auto-generated endpoints for each collection in a project.

Replace `{basePath}` with your project's base path and `{collection}` with the collection name.

---

### Get All Records

**`GET /mock/{basePath}/{collection}`**

**Example:** `GET /mock/my-e-commerce-api/users`

**Response (200):**
```json
[
  { "_id": "uuid-1", "name": "Alice", "email": "alice@example.com" },
  { "_id": "uuid-2", "name": "Bob", "email": "bob@example.com" }
]
```

---

### Get Single Record

**`GET /mock/{basePath}/{collection}/{id}`**

**Example:** `GET /mock/my-e-commerce-api/users/uuid-1`

**Response (200):**
```json
{ "_id": "uuid-1", "name": "Alice", "email": "alice@example.com" }
```

---

### Create Record

**`POST /mock/{basePath}/{collection}`**

**Request Body:**
```json
{ "name": "Charlie", "email": "charlie@example.com" }
```

**Response (201):**
```json
{ "_id": "uuid-new", "name": "Charlie", "email": "charlie@example.com" }
```

---

### Update Record

**`PUT /mock/{basePath}/{collection}/{id}`**

**Request Body:**
```json
{ "name": "Alice Updated" }
```

**Response (200):**
```json
{ "_id": "uuid-1", "name": "Alice Updated", "email": "alice@example.com" }
```

---

### Delete Record

**`DELETE /mock/{basePath}/{collection}/{id}`**

**Response (200):**
```json
{ "success": true, "data": {} }
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

| Status | Meaning                  |
|--------|--------------------------|
| 400    | Bad request / validation |
| 404    | Not found                |
| 409    | Conflict (duplicate)     |
| 429    | Rate limit exceeded      |
| 500    | Internal server error    |

---

## Rate Limiting

- **200 requests per minute** per IP address
- Returns 429 status when exceeded
