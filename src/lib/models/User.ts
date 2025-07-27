import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  password?: string; // Optional for OAuth users
  provider?: 'local' | 'google' | 'github'; // Authentication provider
  providerId?: string; // ID from OAuth provider
  avatar?: string; // Profile picture URL
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: false, // Not required for OAuth users
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local',
  },
  providerId: {
    type: String,
    required: false,
  },
  avatar: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ provider: 1, providerId: 1 });

// Update the updatedAt field before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Export the model
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 