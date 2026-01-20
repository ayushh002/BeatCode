const mongoose = require('mongoose');
const {Schema} = mongoose;

const submissionSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'users',
        required:true,
    },
    problemId:{
        type:Schema.Types.ObjectId,
        ref:'problems',
        required:true,
    },
    code: {
        type:String,
        required:true
    },
    language:{
        type:String,
        enum:['js', 'c++', 'c', 'python', 'java'],
        required:true
    },
    status: {
        type:String,
        enum:['Pending', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compilation Error', 'Runtime Error'],
        default:'Pending'
    },
    runtime: {
        type:Number, // seconds
        default:0
    },
    memory: {
        type:Number, // kb
        default:0
    },
    errorMessage: {
        type:String,
        default:null
    },
    testCasesPassed: {
        type:Number,
        default:0
    },
    testCasesTotal: {
        type:Number,
        default:0
    }
}, {timestamps:true});

submissionSchema.index({userId:1, problemId:1});

const Submission = mongoose.model("submissions",submissionSchema);

module.exports = Submission;