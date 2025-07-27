import mongoose, { Schema } from 'mongoose';

export interface IAircraft {
  aircraftId: string;
  manufacturer: string;
  model: string;
  variant?: string;
  serialNumber: string;
  registrationNumber: string;
  yearOfManufacture: number;
  maxSeatingCapacity: number;
  fuelCapacity: number;
  maxRange: number; // in nautical miles
  cruisingSpeed: number; // in knots
  engineType: string;
  engineCount: number;
  aircraftType: 'commercial' | 'private' | 'cargo' | 'military';
  status: 'active' | 'maintenance' | 'retired' | 'available';
  acquisitionDate?: Date;
  purchasePrice?: number;
  currentValue?: number;
  location?: string;
  owner?: string;
  operator?: string;
  maintenanceSchedule?: {
    lastMaintenance: Date;
    nextMaintenance: Date;
    maintenanceType: string;
  };
  specifications?: {
    wingspan: number;
    length: number;
    height: number;
    emptyWeight: number;
    maxTakeoffWeight: number;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AircraftSchema: Schema = new Schema({
  aircraftId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
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
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  yearOfManufacture: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 5,
  },
  maxSeatingCapacity: {
    type: Number,
    required: true,
    min: 1,
  },
  fuelCapacity: {
    type: Number,
    required: true,
    min: 0,
  },
  maxRange: {
    type: Number,
    required: true,
    min: 0,
  },
  cruisingSpeed: {
    type: Number,
    required: true,
    min: 0,
  },
  engineType: {
    type: String,
    required: true,
    trim: true,
  },
  engineCount: {
    type: Number,
    required: true,
    min: 1,
  },
  aircraftType: {
    type: String,
    required: true,
    enum: ['commercial', 'private', 'cargo', 'military'],
    index: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'maintenance', 'retired', 'available'],
    default: 'available',
    index: true,
  },
  acquisitionDate: {
    type: Date,
    required: false,
  },
  purchasePrice: {
    type: Number,
    required: false,
    min: 0,
  },
  currentValue: {
    type: Number,
    required: false,
    min: 0,
  },
  location: {
    type: String,
    required: false,
    trim: true,
  },
  owner: {
    type: String,
    required: false,
    trim: true,
  },
  operator: {
    type: String,
    required: false,
    trim: true,
  },
  maintenanceSchedule: {
    lastMaintenance: {
      type: Date,
      required: false,
    },
    nextMaintenance: {
      type: Date,
      required: false,
    },
    maintenanceType: {
      type: String,
      required: false,
      trim: true,
    },
  },
  specifications: {
    wingspan: {
      type: Number,
      required: false,
      min: 0,
    },
    length: {
      type: Number,
      required: false,
      min: 0,
    },
    height: {
      type: Number,
      required: false,
      min: 0,
    },
    emptyWeight: {
      type: Number,
      required: false,
      min: 0,
    },
    maxTakeoffWeight: {
      type: Number,
      required: false,
      min: 0,
    },
  },
  notes: {
    type: String,
    required: false,
    trim: true,
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
AircraftSchema.index({ manufacturer: 1, model: 1 });
AircraftSchema.index({ aircraftType: 1, status: 1 });
AircraftSchema.index({ location: 1 });
AircraftSchema.index({ owner: 1 });
AircraftSchema.index({ 'maintenanceSchedule.nextMaintenance': 1 });

// Update the updatedAt field before saving
AircraftSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Export the model
export const Aircraft = mongoose.models.Aircraft || mongoose.model<IAircraft>('Aircraft', AircraftSchema); 