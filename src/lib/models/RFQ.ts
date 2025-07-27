import mongoose, { Document, Schema } from 'mongoose';

export interface IRFQ extends Document {
  rfqId: string;
  rfqNumber: string;
  title: string;
  description: string;
  requester: {
    name: string;
    department?: string;
    email: string;
    phone?: string;
  };
  rfqType: 'aircraft_purchase' | 'parts_procurement' | 'maintenance_services' | 'ground_equipment' | 'fuel_supply' | 'catering' | 'other';
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  items: {
    itemId: string;
    itemName: string;
    description: string;
    quantity: number;
    unit: string;
    specifications?: string;
    estimatedValue?: number;
    requiredDeliveryDate?: Date;
  }[];
  technicalRequirements?: {
    requirement: string;
    mandatory: boolean;
    description?: string;
  }[];
  commercialRequirements?: {
    requirement: string;
    mandatory: boolean;
    description?: string;
  }[];
  deliveryRequirements: {
    deliveryLocation: string;
    requiredDeliveryDate: Date;
    deliveryTerms?: string;
    packagingRequirements?: string;
  };
  budgetRange?: {
    minBudget: number;
    maxBudget: number;
    currency: string;
  };
  evaluationCriteria?: {
    criteriaName: string;
    weight: number; // percentage
    description?: string;
  }[];
  rfqStatus: 'draft' | 'published' | 'under_evaluation' | 'awarded' | 'cancelled' | 'closed';
  publishDate?: Date;
  submissionDeadline: Date;
  questionDeadline?: Date;
  vendors: {
    vendorId: string;
    vendorName: string;
    contactPerson: string;
    email: string;
    phone?: string;
    invitationDate: Date;
    responseStatus: 'invited' | 'acknowledged' | 'submitted' | 'declined' | 'no_response';
    submissionDate?: Date;
    quotedAmount?: number;
    notes?: string;
  }[];
  clarifications?: {
    question: string;
    askedBy: string;
    questionDate: Date;
    answer?: string;
    answeredBy?: string;
    answerDate?: Date;
    isPublic: boolean;
  }[];
  evaluations?: {
    vendorId: string;
    evaluatedBy: string;
    evaluationDate: Date;
    technicalScore: number;
    commercialScore: number;
    totalScore: number;
    ranking: number;
    comments?: string;
    recommendation?: 'recommend' | 'conditional' | 'not_recommend';
  }[];
  awardDetails?: {
    awardedTo: string;
    awardDate: Date;
    awardedBy: string;
    awardAmount: number;
    contractNumber?: string;
    awardNotes?: string;
  };
  documents?: {
    documentName: string;
    documentType: 'specification' | 'drawing' | 'terms_conditions' | 'proposal' | 'evaluation' | 'other';
    filePath: string;
    uploadedBy: string;
    uploadDate: Date;
    isPublic: boolean;
  }[];
  approvals?: {
    approvalLevel: string;
    approvedBy: string;
    approvalDate: Date;
    comments?: string;
    status: 'pending' | 'approved' | 'rejected';
  }[];
  notes?: string;
  createdBy: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RFQSchema: Schema = new Schema({
  rfqId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  rfqNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  requester: {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    department: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
  },
  rfqType: {
    type: String,
    required: true,
    enum: ['aircraft_purchase', 'parts_procurement', 'maintenance_services', 'ground_equipment', 'fuel_supply', 'catering', 'other'],
    index: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true,
  },
  items: [{
    itemId: {
      type: String,
      required: true,
      trim: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    specifications: {
      type: String,
      required: false,
      trim: true,
    },
    estimatedValue: {
      type: Number,
      required: false,
      min: 0,
    },
    requiredDeliveryDate: {
      type: Date,
      required: false,
    },
  }],
  technicalRequirements: [{
    requirement: {
      type: String,
      required: true,
      trim: true,
    },
    mandatory: {
      type: Boolean,
      required: true,
      default: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
  }],
  commercialRequirements: [{
    requirement: {
      type: String,
      required: true,
      trim: true,
    },
    mandatory: {
      type: Boolean,
      required: true,
      default: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
  }],
  deliveryRequirements: {
    deliveryLocation: {
      type: String,
      required: true,
      trim: true,
    },
    requiredDeliveryDate: {
      type: Date,
      required: true,
      index: true,
    },
    deliveryTerms: {
      type: String,
      required: false,
      trim: true,
    },
    packagingRequirements: {
      type: String,
      required: false,
      trim: true,
    },
  },
  budgetRange: {
    minBudget: {
      type: Number,
      required: false,
      min: 0,
    },
    maxBudget: {
      type: Number,
      required: false,
      min: 0,
    },
    currency: {
      type: String,
      required: false,
      trim: true,
      default: 'USD',
    },
  },
  evaluationCriteria: [{
    criteriaName: {
      type: String,
      required: true,
      trim: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
  }],
  rfqStatus: {
    type: String,
    required: true,
    enum: ['draft', 'published', 'under_evaluation', 'awarded', 'cancelled', 'closed'],
    default: 'draft',
    index: true,
  },
  publishDate: {
    type: Date,
    required: false,
    index: true,
  },
  submissionDeadline: {
    type: Date,
    required: true,
    index: true,
  },
  questionDeadline: {
    type: Date,
    required: false,
  },
  vendors: [{
    vendorId: {
      type: String,
      required: true,
      trim: true,
    },
    vendorName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    invitationDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    responseStatus: {
      type: String,
      required: true,
      enum: ['invited', 'acknowledged', 'submitted', 'declined', 'no_response'],
      default: 'invited',
    },
    submissionDate: {
      type: Date,
      required: false,
    },
    quotedAmount: {
      type: Number,
      required: false,
      min: 0,
    },
    notes: {
      type: String,
      required: false,
      trim: true,
    },
  }],
  clarifications: [{
    question: {
      type: String,
      required: true,
      trim: true,
    },
    askedBy: {
      type: String,
      required: true,
      trim: true,
    },
    questionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    answer: {
      type: String,
      required: false,
      trim: true,
    },
    answeredBy: {
      type: String,
      required: false,
      trim: true,
    },
    answerDate: {
      type: Date,
      required: false,
    },
    isPublic: {
      type: Boolean,
      required: true,
      default: true,
    },
  }],
  evaluations: [{
    vendorId: {
      type: String,
      required: true,
      trim: true,
    },
    evaluatedBy: {
      type: String,
      required: true,
      trim: true,
    },
    evaluationDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    technicalScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    commercialScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    totalScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    ranking: {
      type: Number,
      required: true,
      min: 1,
    },
    comments: {
      type: String,
      required: false,
      trim: true,
    },
    recommendation: {
      type: String,
      required: false,
      enum: ['recommend', 'conditional', 'not_recommend'],
    },
  }],
  awardDetails: {
    awardedTo: {
      type: String,
      required: false,
      trim: true,
    },
    awardDate: {
      type: Date,
      required: false,
    },
    awardedBy: {
      type: String,
      required: false,
      trim: true,
    },
    awardAmount: {
      type: Number,
      required: false,
      min: 0,
    },
    contractNumber: {
      type: String,
      required: false,
      trim: true,
    },
    awardNotes: {
      type: String,
      required: false,
      trim: true,
    },
  },
  documents: [{
    documentName: {
      type: String,
      required: true,
      trim: true,
    },
    documentType: {
      type: String,
      required: true,
      enum: ['specification', 'drawing', 'terms_conditions', 'proposal', 'evaluation', 'other'],
    },
    filePath: {
      type: String,
      required: true,
      trim: true,
    },
    uploadedBy: {
      type: String,
      required: true,
      trim: true,
    },
    uploadDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isPublic: {
      type: Boolean,
      required: true,
      default: false,
    },
  }],
  approvals: [{
    approvalLevel: {
      type: String,
      required: true,
      trim: true,
    },
    approvedBy: {
      type: String,
      required: true,
      trim: true,
    },
    approvalDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    comments: {
      type: String,
      required: false,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  }],
  notes: {
    type: String,
    required: false,
    trim: true,
  },
  createdBy: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  assignedTo: {
    type: String,
    required: false,
    trim: true,
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
});

// Indexes for better performance
RFQSchema.index({ rfqStatus: 1, submissionDeadline: 1 });
RFQSchema.index({ rfqType: 1, priority: 1 });
RFQSchema.index({ category: 1, rfqStatus: 1 });
RFQSchema.index({ submissionDeadline: 1, rfqStatus: 1 });
RFQSchema.index({ 'requester.name': 1, createdAt: -1 });

// Update the updatedAt field before saving
RFQSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Export the model
export const RFQ = mongoose.models.RFQ || mongoose.model<IRFQ>('RFQ', RFQSchema); 