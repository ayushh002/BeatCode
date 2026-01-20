const redisClient = require('../Config/redis');

const rateLimiter = async (req, res, next) => {
    try {
        const redisKey = `rate-limiter:${req.payload?._id || req.ip}`;

        const exists = await redisClient.exists(redisKey);

        if (exists)
            return res.status(429).json({ error: 'Please wait few seconds before submitting again' });

        await redisClient.set(redisKey, 'cooldown-time', {
            EX: 10,// expires after 10 seconds
            NX: true // only set if it doesn’t already exist
        })

        next();
    } catch (err) {
        console.error("Rate Limit Error: ", err);
        res.status(500).json({ error: "Internal Server Error."});
    }
};

module.exports = rateLimiter;
