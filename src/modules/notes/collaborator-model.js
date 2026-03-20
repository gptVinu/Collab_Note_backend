const mongoose = require("mongoose");

const collaboratorSchema = new mongoose.Schema({
  note: { type: mongoose.Schema.Types.ObjectId, ref: "Note" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: {
    type: String,
    enum: ["editor", "viewer", "owner"],
  },
});

module.exports = mongoose.model("Collaborator", collaboratorSchema);