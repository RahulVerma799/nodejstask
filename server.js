const express = require('express');
const Redis = require('redis');
const { RateLimiterRedis } = require('rate-limiter-flexible');
const winston = require('winston');


const redisClient = Redis.createClient();
redisClient.on('error', (err) => console.log('redis error:', err));


const logger = winston.createLogger({
  transports: [
  new winston.transports.File({ 
    filename: 'task-log.log' }),
  ],
});


async function task(userId) {
  const logEntry = `${userId} task complete at-${new Date().toISOString()}`;
  logger.info(logEntry);  
  console.log(logEntry); 
}


const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rate-limit',
  points: 20, 
  duration: 60, 
  blockDuration: 1,
});


const app = express();
app.use(express.json());


app.post('/api/task', async (req, res) => {
  const {user_id} = req.body;

  if (!user_id) {
    return res.status(400).json({
      success:false,
      message: 'userid is required.' });
  }

  try {
    
            await rateLimiter.consume(user_id, 1);

    
      await task(user_id);
      
    res.status(200).json({ 
      success:true,
      message: `task for ${user_id} completed.` });
  } catch (rejRes) {
    
    res.status(429).json({
      success:false,
      message: `rate limit exceed for ${user_id}. task is in queued.` });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`working ${process.pid} start port ${PORT}`);
});
