// File: backend/src/models/Conversation.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  groupAdmin?: mongoose.Types.ObjectId;
  lastMessage?: mongoose.Types.ObjectId;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      required: function(this: IConversation) {
        return this.isGroup;
      },
    },
    groupAvatar: {
      type: String,
    },
    groupAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: function(this: IConversation) {
        return this.isGroup;
      },
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding conversations by participants
conversationSchema.index({ participants: 1 });

// Validate participant count based on conversation type
conversationSchema.pre('save', function (next) {
  if (this.isGroup) {
    // Group chats must have at least 2 participants
    if (this.participants.length < 2) {
      next(new Error('Group conversation must have at least 2 participants'));
    } else {
      next();
    }
  } else {
    // 1-to-1 chats must have exactly 2 participants
    if (this.participants.length !== 2) {
      next(new Error('One-to-one conversation must have exactly 2 participants'));
    } else {
      next();
    }
  }
});

export const Conversation = mongoose.model<IConversation>(
  'Conversation',
  conversationSchema
);
