const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    note : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Note"
    },
    action : {
        type : String,
        enum : ["CREATE","UPDATE","DELETE","SHARE"],
    },
    timestamp : {
        type : Date,
        default : Date.now,
    },
});

module.exports = mongoose.model("Activity",activitySchema);