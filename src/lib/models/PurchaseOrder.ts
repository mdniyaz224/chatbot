import mongoose, { Document, Schema } from 'mongoose';

export interface IPurchaseOrder extends Document {
  purchaseOrderId: string;
  poNumber: string;
  supplier: {
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  buyer: {
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  aircraftDetails: {
    manufacturer: string;
    model: string;
    variant?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    specifications?: string;
  };
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  paymentTerms: string;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
  deliveryTerms?: string;
  deliveryLocation?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'in_progress' | 'delivered' | 'cancelled' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  currency: string;
  exchangeRate?: number;
  taxes?: {
    taxType: string;
    taxRate: number;
    taxAmount: number;
  }[];
  totalAmount: number;
  attachments?: string[]; // file paths or URLs
  notes?: string;
  approvals?: {
    approvedBy: string;
    approvalDate: Date;
    approvalLevel: string;
    comments?: string;
  }[];
  milestones?: {
    milestoneName: string;
    expectedDate: Date;
    actualDate?: Date;
    status: 'pending' | 'completed' | 'overdue';
    description?: string;
  }[];
  createdBy: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderSchema: Schema = new Schema({
  purchaseOrderId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  poNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  supplier: {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    contactPerson: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    address: {
      type: String,
      required: false,
      trim: true,
    },
  },
  buyer: {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    contactPerson: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    address: {
      type: String,
      required: false,
      trim: true,
    },
  },
  aircraftDetails: {
    manufacturer: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    variant: {
      type: String,
      required: false,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    specifications: {
      type: String,
      required: false,
      trim: true,
    },
  },
  orderDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
  expectedDeliveryDate: {
    type: Date,
    required: false,
    index: true,
  },
  actualDeliveryDate: {
    type: Date,
    required: false,
  },
  paymentTerms: {
    type: String,
    required: true,
    trim: true,
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'partial', 'paid', 'overdue'],
    default: 'pending',
  },
  deliveryTerms: {
    type: String,
    required: false,
    trim: true,
  },
  deliveryLocation: {
    type: String,
    required: false,
    trim: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'pending_approval', 'approved', 'in_progress', 'delivered', 'cancelled', 'completed'],
    default: 'draft',
    index: true,
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true,
  },
  currency: {
    type: String,
    required: true,
    trim: true,
    default: 'USD',
  },
  exchangeRate: {
    type: Number,
    required: false,
    min: 0,
  },
  taxes: [{
    taxType: {
      type: String,
      required: true,
      trim: true,
    },
    taxRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    taxAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  attachments: [{
    type: String,
    trim: true,
  }],
  notes: {
    type: String,
    required: false,
    trim: true,
  },
  approvals: [{
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
    approvalLevel: {
      type: String,
      required: true,
      trim: true,
    },
    comments: {
      type: String,
      required: false,
      trim: true,
    },
  }],
  milestones: [{
    milestoneName: {
      type: String,
      required: true,
      trim: true,
    },
    expectedDate: {
      type: Date,
      required: true,
    },
    actualDate: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'overdue'],
      default: 'pending',
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
  }],
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
PurchaseOrderSchema.index({ status: 1, orderDate: -1 });
PurchaseOrderSchema.index({ 'supplier.name': 1, status: 1 });
PurchaseOrderSchema.index({ 'buyer.name': 1, status: 1 });
PurchaseOrderSchema.index({ expectedDeliveryDate: 1, status: 1 });
PurchaseOrderSchema.index({ priority: 1, status: 1 });
PurchaseOrderSchema.index({ paymentStatus: 1 });

// Update the updatedAt field before saving
PurchaseOrderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Export the model
export const PurchaseOrder = mongoose.models.PurchaseOrder || mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema); 