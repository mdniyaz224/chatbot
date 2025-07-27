import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  conversationId?: string; // Optional: for grouping messages by conversation
  userId?: string; // Optional: for user authentication support
}

const MessageSchema: Schema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant'],
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  conversationId: {
    type: String,
    required: false,
    index: true, // Add index for faster queries
  },
  userId: {
    type: String,
    required: false,
    index: true, // Add index for faster user-specific queries
  },
});

// Add compound indexes for better query performance
MessageSchema.index({ timestamp: -1 }); // Latest messages first
MessageSchema.index({ conversationId: 1, timestamp: 1 }); // Messages by conversation, chronological
MessageSchema.index({ userId: 1, timestamp: -1 }); // User messages, latest first
MessageSchema.index({ userId: 1, conversationId: 1, timestamp: 1 }); // User's conversation history

// Export the model, handling the case where it might already be compiled
export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema); 