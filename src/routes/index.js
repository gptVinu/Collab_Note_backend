const router = require("express").Router();

const auth_route = require("../modules/auth/auth-routes");
const note_route = require("../modules/notes/note-routes");
const activity_route = require("../modules/activity/activity_routes");

router.use("/auth",auth_route);
router.use("/notes",note_route);
router.use("/activity",activity_route);

module.exports = router;