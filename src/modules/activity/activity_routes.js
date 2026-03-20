const router = require("express").Router();
const auth = require("../../middlewares/auth-middleware");
const Activity = require("./activity-model");

router.get("/", auth, async (req, res) => {
  const logs = await Activity.find()
    .populate("user", "name email")
    .populate("note", "title")
    .sort({ timestamp: -1 });

  res.json(logs);
});

module.exports = router;