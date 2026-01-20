const mongoose = require('mongoose');
const {Schema} = mongoose;

const problemSchema = new Schema({
    title:{
        type:String,
        unique:true,
        required: true
    },
    description:{
        type:String,
        required:true
    },
    difficulty:{
        type:String,
        required:true,
        enum:['easy', 'medium', 'hard']
    },
    tags:{
        type:String,
        required:true,
        enum:['math', 'array', 'string','recursion', 'linkedList', 'stack', 'queue', 'deque', 'tree', 'graph','hashing', 'DP']
    },
    visibleTestCases:[
        {
            input:{
                type:String,
                required:true
            },
            output:{
                type:String,
                required:true
            },
            explanation:{
                type:String,
                required:true
            }
        }
    ],
    hiddenTestCases:[
        {
            input:{
                type:String,
                required:true
            },
            output:{
                type:String,
                required:true
            }
        }
    ],
    startCode:[
        {
            language:{
                type:String,
                required:true
            },
            initialCode:{
                type:String,
                required:true
            }
        }
    ],
    referenceSolution:[
        {
            language:{
                type:String,
                required:true
            },
            completeCode:{
                type:String,
                required:true
            }
        }
    ],
    problemCreator:{
        type:Schema.Types.ObjectId, // create a relationship (reference) between two collections
        ref:'users', // ObjectId references documents in the users collection
        required:true
    }

}, {timestamps:true})

const Problem = mongoose.model('problems', problemSchema);
module.exports = Problem;