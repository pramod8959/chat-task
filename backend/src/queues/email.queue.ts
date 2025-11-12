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
 * Email Queue - Handle email sending in background
 */
export const emailQueue = new Queue('email', {
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
 * Email Queue Worker - Process email jobs
 */
export const emailWorker = new Worker(
  'email',
  async (job) => {
    const { to, subject, type } = job.data;

    logger.info(`Processing email job ${job.id}: ${type} to ${to}`);

    try {
      // TODO: Implement actual email sending logic (e.g., SendGrid, AWS SES, Nodemailer)
      // For now, just log the email
      logger.info(`Email sent: ${subject} to ${to}`);
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return { success: true, messageId: `msg_${Date.now()}` };
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

// Worker event handlers
emailWorker.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  logger.error(`Email job ${job?.id} failed:`, err);
});

/**
 * Add email to queue
 */
export const sendEmail = async (data: {
  to: string;
  subject: string;
  body: string;
  type: 'welcome' | 'notification' | 'password-reset';
}) => {
  const job = await emailQueue.add('send-email', data);
  logger.info(`Email job ${job.id} added to queue`);
  return job;
};
