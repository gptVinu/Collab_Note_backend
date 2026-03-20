const router = require("express").Router();
const auth = require("../../middlewares/auth-middleware");
const role = require("../../middlewares/role_middleware");
const { shareNote, getPublicNote } = require("./note-controller");
const {searchNotes} = require("./note-controller");
const { addCollaborator, getCollaborators, updateCollaborator } = require("./note-controller");

const {
    createNote,
    getNotes,
    updateNote,
    deleteNote
} = require("./note-controller");

// PUBLIC (no auth)
router.get("/public/:token", getPublicNote);

router.use(auth);

router.post("/", role("admin","editor"), createNote);
router.get("/", role("admin","editor","viewer"), getNotes);

// Specific routes with subpaths - MUST come before /:id routes
router.get("/search", searchNotes);
router.post("/:id/share", shareNote);
router.post("/:id/collaborator", addCollaborator);
router.get("/:id/collaborators", getCollaborators);
router.put("/:id/collaborators/:collaboratorId", updateCollaborator);

// Generic :id routes - MUST come last
router.put("/:id", role("admin","editor"), updateNote);
router.delete("/:id", deleteNote);

module.exports = router;
