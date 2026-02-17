const mongoose = require('mongoose');
const {Schema} = mongoose;

const videoSchema = new Schema({
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'problems',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    cloudinaryPublicId: {
        type: String,
        required: true,
        unique: true
    },
    secureUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String
    },
    duration: {
        type: Number,
        required: true
    }

}, {timestamps: true});

videoSchema.index({userId:1, problemId:1});

const SolutionVideo = mongoose.model("solutionvideo",videoSchema);

module.exports = SolutionVideo;
