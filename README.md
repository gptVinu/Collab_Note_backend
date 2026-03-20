# Backend Folder Structure for the collab note

backend/
│
├── src/
│   │
│   ├── config/                     # Configuration files
│   │   ├── db.js                   # MongoDB connection
│   │   ├── env.js                  # Environment config (optional)
│   │
│   ├── modules/                    # Feature-based modules
│   │
│   │   ├── auth/                   # Authentication module
│   │   │   ├── auth-controller.js
│   │   │   ├── auth-routes.js
│   │   │   ├── auth-service.js
│   │
│   │   ├── users/                  # User module
│   │   │   ├── user-model.js
│   │   │   ├── user-service.js
│   │
│   │   ├── notes/                  # Notes module
│   │   │   ├── note-model.js
│   │   │   ├── note-controller.js
│   │   │   ├── note-routes.js
│   │   │   ├── collaborator-model.js
│   │
│   │   ├── activity/               # Activity logs module
│   │   │   ├── activity-model.js
│   │   │   ├── activity-service.js
│   │   │   ├── activity-routes.js
│   │
│   │   ├── collaboration/          # Real-time (Socket.io)
│   │   │   ├── socket.js
│   │
│   │
│   ├── middlewares/                # Global middlewares
│   │   ├── auth-middleware.js
│   │   ├── role-middleware.js
│   │   ├── error-middleware.js
│   │
│   ├── routes/                     # Central route manager
│   │   ├── index.js
│   │
│   ├── utils/                      # Utility functions
│   │   ├── jwt.js
│   │   ├── logger.js
│   │
│   ├── app.js                      # Express app config
│   ├── server.js                   # Server entry point
│
├── .env                            # Environment variables
├── .gitignore
├── package.json
├── package-lock.json
├── README.md

# Explanation and usages
🔹 config/

Handles database and environment configuration.

🔹 modules/

Feature-based architecture:

auth/ → login/register (JWT)

users/ → user data

notes/ → CRUD + search + collaborators + sharing

activity/ → logs (audit trail)

collaboration/ → real-time editing (Socket.io)

🔹 middlewares/

Authentication (JWT verification)

Role-based access control

Error handling

🔹 routes/

Central place to combine all APIs.

🔹 utils/
Helper functions like JWT, logging, etc.

# all routes
=============================================
// AUTH
router.post("/auth/register", register);
router.post("/auth/login", login);

=============================================
// NOTES
router.post("/notes", role("admin", "editor"), createNote);
router.get("/notes", role("admin", "editor", "viewer"), getNotes);
router.get("/notes/search", role("admin", "editor", "viewer"), searchNotes);
router.put("/notes/:id", role("admin", "editor"), updateNote);
router.delete("/notes/:id", role("admin"), deleteNote);

=============================================
// COLLABORATION
router.post("/notes/:id/collaborator", role("admin", "editor"), addCollaborator);

=============================================
// SHARING
router.post("/notes/:id/share", role("admin", "editor"), shareNote);
router.get("/notes/public/:token", getPublicNote);

=============================================
// ACTIVITY
router.get("/activity", auth, getActivityLogs);