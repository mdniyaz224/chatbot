import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  title: string;
  userId?: string; // Optional: for authenticated users
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  isActive: boolean;
}

const ConversationSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    default: 'New Conversation',
  },
  userId: {
    type: String,
    required: false,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  messageCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Indexes for better performance
ConversationSchema.index({ userId: 1, updatedAt: -1 }); // User's conversations, most recent first
ConversationSchema.index({ createdAt: -1 }); // All conversations, newest first
ConversationSchema.index({ isActive: 1, updatedAt: -1 }); // Active conversations

// Update the updatedAt field before saving
ConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Export the model
export const Conversation = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema); 