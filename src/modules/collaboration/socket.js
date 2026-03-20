const { Server } = require("socket.io");

let io;

exports.initSocket = (server) => {
    io = new Server(server, {
        cors: { origin: "*" }
    });

    io.on("connection", (socket) => {
        console.log("User Connected.");

        socket.on("join_note", (noteId) => {
            socket.join(noteId);
        });

        socket.on("edit_note", ({ noteId, content }) => {
            socket.to(noteId).emit("recieve_changes", content);
        });

        socket.on("disconnect", () => {
            console.log("User Disconnected.");
        });
    });
};