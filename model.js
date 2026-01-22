const mongoose = require('mongoose');
const { describe } = require('node:test');
const todoSchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required : true,
            trim : true,
        },
        description:{
            type : String,
            required : true,
        },
        completed :{
            type : Boolean,
            default : false
        },
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        }
    },{
        timestamps: true
    }
)
module.exports = mongoose.model('todo',todoSchema)