// File: backend/src/models/Message.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  delivered: boolean;
  read: boolean;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    mediaUrl: {
      type: String,
      default: null,
    },
    mediaType: {
      type: String,
      enum: ['image', 'video', 'audio', 'file', null],
      default: null,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    read: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient message queries (conversationId + createdAt for pagination)
messageSchema.index({ conversationId: 1, createdAt: -1 });

// Index for finding undelivered messages
messageSchema.index({ recipient: 1, delivered: 1 });

// Text index for message search functionality
messageSchema.index({ content: 'text' });

// Index for sender queries
messageSchema.index({ sender: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
