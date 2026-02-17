const cloudinary = require("cloudinary").v2;
const SolutionVideo = require('../Models/solutionVideo');
const Problem = require('../Models/problem');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET
})

const getDigitalSignature = async (req, res) => {
    try{
        const userId = req.admin._id;
        const {problemId} = req.params;

        // check if the problem even exist or not
        const problem = await Problem.findById(problemId);
        if(!problem)
            return res.status(404).json({ error: 'Problem not found' });

        // create public id and timestamp to add it to the signature
        const timestamp = Math.round(new Date().getTime()/1000);
        const public_id = `beatcode_solution/${problemId}/${userId}_${timestamp}`;

        // sign upload parameters
        const uploadParams = {
            timestamp,
            public_id,
        }

        // generate the signature
        const signature = cloudinary.utils.api_sign_request(
            uploadParams,
            process.env.CLOUDINARY_CLOUD_API_SECRET
        )

        res.status(200).json({
            signature,
            timestamp,
            public_id,
            api_key: process.env.CLOUDINARY_API_KEY,
            upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`
        })
    }
    catch(err){
        console.error('Error generating upload signature:', err);
        res.status(500).json({ error: 'Failed to generate upload credentials' });
    }
}

const saveVideoMetadata = async (req, res) => {
    try{
        const { 
            problemId,
            cloudinaryPublicId, 
            secureUrl, 
            duration}
        = req.body;

        const userId = req.admin._id;

        // Verify the upload with cloudinary
        const cloudinaryResource = await cloudinary.api.resource(
            cloudinaryPublicId,
            {resource_type: 'video'}
        )

        if (!cloudinaryResource) {
            return res.status(400).json({ error: 'Video not found on Cloudinary' });
        }

        // Verify that no existing video metadata is associated with this problem (enforces a single video per problem)
        const isUploaded = await SolutionVideo.findOne({problemId});

        if(isUploaded){
            return res.status(409).json({ error: 'Video already exists' });
        }

        // Create thumbnail url
        const thumbnailUrl = cloudinary.url(cloudinaryResource.public_id, {
            resource_type: 'video',  
            transformation: [
                { width: 400, height: 225, crop: 'fill' },
                { quality: 'auto' },
                { start_offset: 30 }  
            ],
            format: 'jpg'
        })

        // Save the metadata of the video
        const videoSolution = await SolutionVideo.create({
            problemId,
            userId,
            cloudinaryPublicId,
            secureUrl: cloudinaryResource.secure_url || secureUrl,
            duration: cloudinaryResource.duration || duration,
            thumbnailUrl
        });

        // Return a successful response
        res.status(201).json({
            message: 'Video solution saved successfully',
            videoSolution: {
                id: videoSolution._id,
                thumbnailUrl: videoSolution.thumbnailUrl,
                duration: videoSolution.duration,
                uploadedAt: videoSolution.createdAt
            }
        });
    }
    catch (err) {
        console.error('Error saving video metadata:', err);
        res.status(500).json({ error: 'Failed to save video metadata' });
    }
    
}

const deleteVideo = async (req, res) => {
    try{
        const {problemId} = req.params;
        const userId = req.admin._id;

        // Delete the video metadata from the database
        const videoMetadata = await SolutionVideo.findOneAndDelete({problemId});

        if (!videoMetadata) {
        return res.status(404).json({ error: 'Video not found' });
        }

        // Now delete the video from cloudinary and all CDNs
        await cloudinary.uploader.destroy(videoMetadata.cloudinaryPublicId, {resource_type: 'video', invalidate: true});

        res.json({ message: 'Video deleted successfully' });
    }
    catch(err){
        console.error('Error deleting video:', err);
        res.status(500).json({ error: 'Failed to delete video' });
    }
}

module.exports = {getDigitalSignature, saveVideoMetadata, deleteVideo};