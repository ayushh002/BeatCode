const express = require('express');
const videoRouter = express.Router();

const adminMiddleware = require('../middleware/adminMiddleware');

const {getDigitalSignature, saveVideoMetadata, deleteVideo} = require('../controllers/videoSection');

videoRouter.get('/create/:problemId', adminMiddleware, getDigitalSignature);
videoRouter.post('/save', adminMiddleware, saveVideoMetadata);
videoRouter.delete('/delete/:problemId', adminMiddleware, deleteVideo);

module.exports = videoRouter;