// File: backend/src/tests/message.test.ts
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app';
import { User, IUser } from '../models/User';
import { Message } from '../models/Message';
import { generateTokens } from '../utils/jwt';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
  await Message.deleteMany({});
});

describe('Message Service', () => {
  let user1: IUser;
  let user2: IUser;
  let token1: string;

  beforeEach(async () => {
    // Create test users
    user1 = await User.create({
      email: 'user1@example.com',
      password: 'password123',
      username: 'user1',
    });

    user2 = await User.create({
      email: 'user2@example.com',
      password: 'password123',
      username: 'user2',
    });

    // Generate tokens
    const tokens1 = generateTokens(user1);
    token1 = tokens1.accessToken;
  });

  describe('Message Persistence', () => {
    it('should save message to database when sent via Socket.IO', async () => {
      const messageContent = 'Test message';

      // Create message directly via service
      const { sendMessage } = await import('../services/message.service');
      const message = await sendMessage({
        sender: user1._id.toString(),
        recipient: user2._id.toString(),
        content: messageContent,
      });

      expect(message).toHaveProperty('_id');
      expect(message.content).toBe(messageContent);
      // Sender is populated, so check the nested _id
      expect(typeof message.sender === 'object' && message.sender._id.toString()).toBe(user1._id.toString());
      expect(message.recipient.toString()).toBe(user2._id.toString());
      expect(message.delivered).toBe(false);
      expect(message.read).toBe(false);
    });

    it('should retrieve messages with pagination', async () => {
      const { sendMessage, getMessages } = await import('../services/message.service');

      // Send multiple messages
      const message1 = await sendMessage({
        sender: user1._id.toString(),
        recipient: user2._id.toString(),
        content: 'Message 1',
      });

      await sendMessage({
        sender: user1._id.toString(),
        recipient: user2._id.toString(),
        content: 'Message 2',
      });

      await sendMessage({
        sender: user1._id.toString(),
        recipient: user2._id.toString(),
        content: 'Message 3',
      });

      // Get first batch
      const messages = await getMessages({
        conversationId: message1.conversationId.toString(),
        limit: 2,
      });

      expect(messages).toHaveLength(2);
      // Messages are sorted newest first, then reversed, so oldest messages come first
      expect(messages[0].content).toBe('Message 2');
      expect(messages[1].content).toBe('Message 3');
    });

    it('should mark message as delivered', async () => {
      const { sendMessage, markAsDelivered } = await import('../services/message.service');

      const message = await sendMessage({
        sender: user1._id.toString(),
        recipient: user2._id.toString(),
        content: 'Test message',
      });

      const updatedMessage = await markAsDelivered(message._id.toString());

      expect(updatedMessage?.delivered).toBe(true);
      expect(updatedMessage?.deliveredAt).toBeTruthy();
    });

    it('should mark message as read', async () => {
      const { sendMessage, markAsRead } = await import('../services/message.service');

      const message = await sendMessage({
        sender: user1._id.toString(),
        recipient: user2._id.toString(),
        content: 'Test message',
      });

      const updatedMessage = await markAsRead(message._id.toString());

      expect(updatedMessage?.read).toBe(true);
      expect(updatedMessage?.readAt).toBeTruthy();
    });
  });

  describe('GET /api/messages/conversations', () => {
    it('should get user conversations', async () => {
      // Send a message to create conversation
      const { sendMessage } = await import('../services/message.service');
      await sendMessage({
        sender: user1._id.toString(),
        recipient: user2._id.toString(),
        content: 'Test message',
      });

      const response = await request(app)
        .get('/api/messages/conversations')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.conversations).toHaveLength(1);
      expect(response.body.conversations[0].participants).toHaveLength(2);
    });
  });
});
