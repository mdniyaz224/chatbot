import mongoose, { Document, Schema } from 'mongoose';

export interface IKnowledgeBase extends Document {
  topic: string;
  content: string;
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeBaseSchema: Schema = new Schema({
  topic: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: false,
    trim: true,
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better search performance
KnowledgeBaseSchema.index({ topic: 'text', content: 'text' });

// Export the model
export const KnowledgeBase = mongoose.models.KnowledgeBase || mongoose.model<IKnowledgeBase>('KnowledgeBase', KnowledgeBaseSchema); 