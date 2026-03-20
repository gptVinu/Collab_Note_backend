const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    {
        title : String,
        content : String,
        owner : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        isPublic : {
            type : Boolean,
            default : false
        },
        publicToken : {type : String},
    }, 
    { timestamps : true} 
);

module.exports = mongoose.model("Note",noteSchema);