import mongoose from "mongoose";

const settings = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',        // reference to User model
        required: true
    },
    darkMode:{
        type:Boolean,
        default:true
    },
    privateAccount:{
        type:Boolean,
        default:false
    },
    hiddenSeen:{
        type:Boolean,
        default:false
    },
});

const settingsModel = mongoose.model('setting' , settings)

export default settingsModel