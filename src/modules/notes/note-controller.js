const Note = require("./note-model");
const { loActivity, logActivity } = require("../activity/activity-service");
const crypto = require("crypto"); //public sharerable link
const Collaborator = require("./collaborator-model");
const User = require("../users/user-model");

exports.createNote = async (req, res) => {
    const note = await Note.create({
        ...req.body,
        owner: req.user.id,
    });

    //log activities
    await logActivity({
      userId: req.user.id,
      noteId: note._id,
      action: "CREATE",
    });

    res.json(note);
};

// exports.getNotes = async (req, res) => {
//     const notes = await Note.find({ owner: req.user.id });
//     res.json(notes);
// };
//updated with collaborator
exports.getNotes = async (req, res) => {
  const ownedNotes = await Note.find({ owner: req.user.id }).populate("owner", "name email");

  const collaborations = await Collaborator.find({
    user: req.user.id,
  }).populate("note");

  const collabNotes = collaborations.map(c => c.note);

  res.json([...ownedNotes, ...collabNotes]);
};

exports.updateNote = async (req, res) => {
    //collaborator 
    const role = await getUserRole(req.params.id, req.user.id);

    if (!["owner", "editor"].includes(role)) {
        return res.status(403).json({ msg: "No edit access" });
    }

    const note = await Note.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    //log activities
    await logActivity({
      userId: req.user.id,
      noteId: note._id,
      action: "UPDATE",
    });
    res.json(note);
};

exports.deleteNote = async (req, res) => {
    try {
        //collaborator
        const role = await getUserRole(req.params.id, req.user.id);

        if (role !== "owner") {
            return res.status(403).json({ msg: "Only owner can delete" });
        }

        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ msg: "Note not found" });
        }

        // Cascade delete: remove associated collaborators
        await Collaborator.deleteMany({ note: req.params.id });

        await Note.findByIdAndDelete(req.params.id);

        //log activities
        await logActivity({
            userId: req.user.id,
            noteId: note._id,
            action: "DELETE",
        });
        res.json({ msg: "Note Deleted." });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ msg: "Failed to delete note" });
    }
};

//public shareable link
exports.shareNote = async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) return res.status(404).json({ msg: "Note not found" });

    // ownership check
    if (note.owner.toString() !== req.user.id) {
        return res.status(403).json({ msg: "Not allowed" });
    }

    note.isPublic = true;
    note.publicToken = crypto.randomBytes(16).toString("hex");

    await note.save();

    res.json({
        message: "Shareable link created",
        publicToken: note.publicToken,
        link: `http://localhost:3000/public/${note.publicToken}`,
    });
};

exports.getPublicNote = async (req, res) => {
    const note = await Note.findOne({
        publicToken: req.params.token,
        isPublic: true,
    });

    if (!note) return res.status(404).json({ msg: "Not found" });

    res.json(note);
};

//search
exports.searchNotes = async (req, res) => {
  const { query } = req.query;

  const collaborations = await Collaborator.find({
    user: req.user.id,
  });

  const collabNoteIds = collaborations.map(c => c.note);

  const notes = await Note.find({
    $and: [
      {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } },
        ],
      },
      {
        $or: [
          { owner: req.user.id },
          { _id: { $in: collabNoteIds } },
        ],
      },
    ],
  });

  res.json(notes);
};

//collaborator  apis
exports.addCollaborator = async (req, res) => {
    try {
        let { userId, email, role } = req.body;

        const note = await Note.findById(req.params.id);

        if (!note) return res.status(404).json({ msg: "Note not found" });

        // only owner can add
        if (note.owner.toString() !== req.user.id) {
            return res.status(403).json({ msg: "Not allowed" });
        }

        // Validate email format if provided
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ msg: "Invalid email format" });
            }
        }

        // Support email lookup
        if (!userId && email) {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ msg: "User not found with that email" });
            }
            userId = user._id;
        }

        if (!userId) {
            return res.status(400).json({ msg: "User ID or email is required" });
        }

        // Check if already a collaborator
        const existing = await Collaborator.findOne({
            note: note._id,
            user: userId,
        });

        if (existing) {
            return res.status(400).json({ msg: "User is already a collaborator" });
        }

        const collaborator = await Collaborator.create({
            note: note._id,
            user: userId,
            role: role || "editor",
        });

        res.json({ msg: "Collaborator added successfully", collaborator });
    } catch (error) {
        console.error("Add collaborator error:", error);
        res.status(500).json({ msg: "Failed to add collaborator" });
    }
};

const getUserRole = async (noteId, userId) => {
    const note = await Note.findById(noteId);

    if (note.owner.toString() === userId) return "owner";

    const collab = await Collaborator.findOne({
        note: noteId,
        user: userId,
    });

    return collab ? collab.role : null;
};

// Get collaborators for a note
exports.getCollaborators = async (req, res) => {
    try {
        const collaborators = await Collaborator.find({
            note: req.params.id
        }).populate("user", "name email");

        res.json(collaborators);
    } catch (error) {
        console.error("Get collaborators error:", error);
        res.status(500).json({ msg: "Failed to fetch collaborators" });
    }
};

// Update collaborator role
exports.updateCollaborator = async (req, res) => {
    try {
        const { collaboratorId } = req.params;
        const { role } = req.body;

        // Verify user is owner of the note
        const collaborator = await Collaborator.findById(collaboratorId);
        if (!collaborator) {
            return res.status(404).json({ msg: "Collaborator not found" });
        }

        const note = await Note.findById(collaborator.note);
        if (note.owner.toString() !== req.user.id) {
            return res.status(403).json({ msg: "Only owner can update collaborator role" });
        }

        // Update role
        collaborator.role = role;
        await collaborator.save();

        res.json({ msg: "Collaborator role updated", collaborator });
    } catch (error) {
        console.error("Update collaborator error:", error);
        res.status(500).json({ msg: "Failed to update collaborator" });
    }
};

