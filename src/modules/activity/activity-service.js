const Activity = require("./activity-model");

exports.logActivity = async({userId,noteId,action})=>{
    try{
        await Activity.create({
            user:userId,
            note:noteId,
            action,
        });
    } catch(err){
        console.log("Activity log failed !",err.message);
    }
};