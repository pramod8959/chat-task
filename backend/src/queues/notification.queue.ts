import { Queue, Worker } from 'bullmq';
import { config } from '../config';
import logger from '../config/logger';

// Redis connection for BullMQ
const redisConnection = {
  host: config.redisUrl.includes('redis://') 
    ? config.redisUrl.replace('redis://', '').split(':')[0]
    : config.redisUrl.split(':')[0],
  port: config.redisUrl.includes(':') 
    ? parseInt(config.redisUrl.split(':').pop()?.replace(/\/$/, '') || '6379')
    : 6379,
};

/**
 * Notification Queue - Handle push notifications in background
 */
export const notificationQueue = new Queue('notification', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

/**
 * Notification Queue Worker - Process notification jobs
 */
export const notificationWorker = new Worker(
  'notification',
  async (job) => {
    const { userId, title, type } = job.data;

    logger.info(`Processing notification job ${job.id}: ${type} for user ${userId}`);

    try {
      // TODO: Implement actual push notification logic (e.g., Firebase, OneSignal, AWS SNS)
      // For now, just log the notification
      logger.info(`Notification sent: ${title} to user ${userId}`);
      
      // Simulate notification sending delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return { success: true, notificationId: `notif_${Date.now()}` };
    } catch (error) {
      logger.error('Error sending notification:', error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 10,
  }
);

// Worker event handlers
notificationWorker.on('completed', (job) => {
  logger.info(`Notification job ${job.id} completed`);
});

notificationWorker.on('failed', (job, err) => {
  logger.error(`Notification job ${job?.id} failed:`, err);
});

/**
 * Add notification to queue
 */
export const sendNotification = async (data: {
  userId: string;
  title: string;
  message: string;
  type: 'message' | 'friend-request' | 'system';
}) => {
  const job = await notificationQueue.add('send-notification', data);
  logger.info(`Notification job ${job.id} added to queue`);
  return job;
};
