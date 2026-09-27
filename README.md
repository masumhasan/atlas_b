# Atlas Backend API

Backend API and single source of truth for the Atlas platform, serving both the public website (`atlas_web`) and management dashboard (`atlas_d`).

---

## 1. Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Stateless JSON Web Tokens (`jsonwebtoken`)
- **Password Hashing**: `bcryptjs` (Cost factor: 12)
- **Validation**: Zod schema validation
- **Security**: Helmet HTTP headers, configurable CORS, payload size limits
- **Logging**: Morgan HTTP logger

---

## 2. Project Structure

```text
atlas_b/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection & lifecycle management
│   │   └── env.js               # Environment variable loading & validation
│   ├── controllers/
│   │   └── auth.controller.js   # HTTP controllers for authentication endpoints
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT verification & user attachment
│   │   ├── error.middleware.js  # Centralized error handler
│   │   ├── notFound.middleware.js # 404 Route handler
│   │   ├── role.middleware.js   # Role-based access control (RBAC)
│   │   └── validate.middleware.js # Zod schema validation middleware
│   ├── models/
│   │   └── user.model.js        # Mongoose User schema & password hashing
│   ├── routes/
│   │   ├── auth.routes.js       # Auth endpoint routing & middleware bindings
│   │   ├── health.routes.js     # Health check route
│   │   └── index.js             # Central router aggregator
│   ├── schemas/
│   │   └── auth.schema.js       # Zod validation schemas
│   ├── services/
│   │   └── auth.service.js      # Business logic: login, profile, admin seeding
│   ├── utils/
│   │   ├── jwt.js               # JWT signing & verification helpers
│   │   ├── password.js          # Bcrypt hashing & verification helpers
│   │   └── response.js          # Standardized API response format & AppError
│   ├── app.js                   # Express application setup & middleware stack
│   └── server.js                # Server entry point & graceful shutdown
├── test_auth.js                 # Automated API test suite
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore file (excludes .env & node_modules)
├── package.json                 # Project dependencies & scripts
└── README.md                    # Documentation
```

---

## 3. Environment Variables

Create a `.env` file in the root of `atlas_b/` (refer to `.env.example`):

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_strong_jwt_secret_change_in_production
JWT_EXPIRES_IN=7d

# Initial Admin Seeding
ADMIN_EMAIL=admin@example.com
ADMIN_PASS=ChangeThisPassword123!

# Allowed CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

> **Note**: Never commit `.env` to Git. Real credentials should only be configured locally or in production secret managers.

---

## 4. Getting Started

### Installation

```bash
cd atlas_b
npm install
```

### Development Mode

Runs the server with Nodemon auto-reload:

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Running Tests

Runs the automated test suite testing health check, login, validation, authentication, role authorization, and CORS:

```bash
npm test
```

---

## 5. Admin Account Initialization

On application startup, the server automatically checks if an admin user matching `ADMIN_EMAIL` exists in MongoDB:
1. If the admin **does not exist**, the account is created with `role: "admin"`, and `ADMIN_PASS` is hashed using `bcryptjs` with 12 salt rounds before persisting.
2. If the admin **already exists**, the account is preserved without altering or overwriting existing data.
3. Plaintext passwords are never stored in the database.

---

## 6. Authentication Flow

1. Client sends credentials (`email` and `password`) to `POST /api/auth/login`.
2. Input is validated by `validate(loginSchema)` using Zod.
3. If valid, the server returns a signed JWT containing user identity and role.
4. The client stores the token (e.g. secure cookie or memory).
5. For protected requests, the client passes `Authorization: Bearer <token>` in the request headers.
6. The `authMiddleware` validates the token signature, checks expiration, and retrieves the active user.
7. The `authorizeRoles('admin')` middleware enforces role requirements.
8. To log out, the client discards the stored token and calls `POST /api/auth/logout`.

---

## 7. API Endpoints

### 1. Health Check

- **URL**: `GET /api/health`
- **Auth**: None
- **Response**:
```json
{
  "success": true,
  "message": "Atlas backend is running",
  "data": {
    "status": "ok"
  }
}
```

### 2. Admin Login

- **URL**: `POST /api/auth/login`
- **Auth**: None
- **Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```
- **Success Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "6ab8adca95db63a18c540123",
      "email": "admin@example.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
- **Validation Error (400)**:
```json
{
  "success": false,
  "message": "Invalid email format",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### 3. Get Current User

- **URL**: `GET /api/auth/me`
- **Auth**: `Bearer <token>`
- **Authorization**: `admin`
- **Success Response (200)**:
```json
{
  "success": true,
  "message": "Current user retrieved successfully",
  "data": {
    "id": "6ab8adca95db63a18c540123",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### 4. Logout

- **URL**: `POST /api/auth/logout`
- **Auth**: None
- **Success Response (200)**:
```json
{
  "success": true,
  "message": "Logout successful. Please remove stored authentication token on the client.",
  "data": {}
}
```

### 5. Get All Pages

- **URL**: `GET /api/pages`
- **Auth**: None (or Admin)
- **Description**: Returns all pages for the Pages management table.

### 6. Get Public Pages (for Website)

- **URL**: `GET /api/pages/public`
- **Auth**: None
- **Description**: Returns published pages for public website navigation.

### 7. Update Page

- **URL**: `PUT /api/pages/:id`
- **Auth**: `Bearer <token>` (Admin)
- **Body**: `{ "name": "New Name", "route": "/new-route", "visibility": "published" | "hidden" }`
- **Description**: Updates page title, route, and visibility, and logs a recent content change.

### 8. Toggle Page Visibility

- **URL**: `PATCH /api/pages/:id/visibility`
- **Auth**: `Bearer <token>` (Admin)
- **Body**: `{ "visibility": "published" | "hidden" }`

### 9. Get Dashboard Statistics & Recent Changes

- **URL**: `GET /api/dashboard/stats`
- **Auth**: `Bearer <token>` (Admin)
- **Description**: Returns live page counts (published, draft, hidden) and recent changes audit history.

### 10. Media & Cloudinary Storage

All media assets for this project are strictly namespaced under the `/lmcsatlas/` root folder with standard subfolders.

- **Folder Namespaces**:
  - `lmcsatlas/pages` — Page hero images, layout assets
  - `lmcsatlas/insights` — Insight articles and blog banners
  - `lmcsatlas/avatars` — Team member and user avatars
  - `lmcsatlas/branding` — Logos, icons, marks
  - `lmcsatlas/legal` — Legal documentation imagery
  - `lmcsatlas/media` — General media library
  - `lmcsatlas/inquiries` — Attachments from inquiry contact forms
  - `lmcsatlas/settings` — System/site configuration assets

#### Endpoints:
- `GET /api/media/folders` — Get standardized project folder constants.
- `POST /api/media/upload` — Upload image (`multipart/form-data` with `image` file or JSON with base64/url `image`, optional `folder`). Enforces `lmcsatlas/<folder>` namespace. Protected (Admin only).
- `DELETE /api/media` — Delete asset by `publicId`. Protected (Admin only).

### 11. Insights API

Manages analytical articles, sections, quotes, and in-content images.

- `GET /api/insights/public` — Returns published insights for public website (`atlas_web`).
- `GET /api/insights` — Returns all insights with optional search, filter by tag/status, and pagination (`atlas_d`).
- `GET /api/insights/:idOrSlug` — Returns a single insight by MongoDB ID or slug.
- `POST /api/insights` — Creates an insight (Protected, Admin only).
- `PUT /api/insights/:id` — Updates an insight and logs to audit history (Protected, Admin only).
- `DELETE /api/insights/:id` — Deletes an insight (Protected, Admin only).

