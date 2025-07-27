import mongoose, { Document, Schema } from 'mongoose';

export interface IFlightLog extends Document {
  flightLogId: string;
  flightNumber: string;
  aircraftId: string;
  registrationNumber: string;
  flightDate: Date;
  departureAirport: {
    code: string; // IATA/ICAO code
    name: string;
    location: string;
  };
  arrivalAirport: {
    code: string; // IATA/ICAO code
    name: string;
    location: string;
  };
  departureTime: Date;
  arrivalTime: Date;
  actualDepartureTime?: Date;
  actualArrivalTime?: Date;
  flightDuration: number; // in minutes
  actualFlightDuration?: number; // in minutes
  distance: number; // in nautical miles
  crew: {
    captain: {
      name: string;
      licenseNumber: string;
      email?: string;
    };
    firstOfficer?: {
      name: string;
      licenseNumber: string;
      email?: string;
    };
    flightEngineer?: {
      name: string;
      licenseNumber: string;
      email?: string;
    };
    cabinCrew?: {
      name: string;
      position: string;
      licenseNumber?: string;
    }[];
  };
  passengers?: {
    adultCount: number;
    childCount: number;
    infantCount: number;
    totalCount: number;
  };
  cargo?: {
    weight: number; // in kg
    description?: string;
  };
  fuelConsumption: {
    fuelOnDeparture: number; // in gallons or liters
    fuelOnArrival: number;
    fuelUsed: number;
    fuelEfficiency?: number; // nm per gallon
  };
  flightConditions: {
    weather: string;
    visibility: string;
    windSpeed?: number;
    windDirection?: number;
    temperature?: number;
    altitude: number; // cruising altitude in feet
  };
  flightType: 'passenger' | 'cargo' | 'charter' | 'training' | 'maintenance' | 'positioning';
  flightStatus: 'scheduled' | 'in_progress' | 'completed' | 'delayed' | 'cancelled' | 'diverted';
  delayReasons?: string[];
  incidents?: {
    incidentType: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    reportedBy: string;
    timeOfIncident: Date;
  }[];
  maintenanceRequired?: {
    maintenanceType: string;
    description: string;
    urgency: 'routine' | 'urgent' | 'critical';
    reportedBy: string;
  }[];
  route?: {
    waypoints: string[];
    flightLevel: number;
    routeDistance: number;
  };
  operationalNotes?: string;
  pilotRemarks?: string;
  dispatchRemarks?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const FlightLogSchema: Schema = new Schema({
  flightLogId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  flightNumber: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  aircraftId: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  registrationNumber: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  flightDate: {
    type: Date,
    required: true,
    index: true,
  },
  departureAirport: {
    code: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
  },
  arrivalAirport: {
    code: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
  },
  departureTime: {
    type: Date,
    required: true,
  },
  arrivalTime: {
    type: Date,
    required: true,
  },
  actualDepartureTime: {
    type: Date,
    required: false,
  },
  actualArrivalTime: {
    type: Date,
    required: false,
  },
  flightDuration: {
    type: Number,
    required: true,
    min: 0,
  },
  actualFlightDuration: {
    type: Number,
    required: false,
    min: 0,
  },
  distance: {
    type: Number,
    required: true,
    min: 0,
  },
  crew: {
    captain: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      licenseNumber: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: false,
        trim: true,
        lowercase: true,
      },
    },
    firstOfficer: {
      name: {
        type: String,
        required: false,
        trim: true,
      },
      licenseNumber: {
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
    },
    flightEngineer: {
      name: {
        type: String,
        required: false,
        trim: true,
      },
      licenseNumber: {
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
    },
    cabinCrew: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      position: {
        type: String,
        required: true,
        trim: true,
      },
      licenseNumber: {
        type: String,
        required: false,
        trim: true,
      },
    }],
  },
  passengers: {
    adultCount: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
    },
    childCount: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
    },
    infantCount: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
    },
    totalCount: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
    },
  },
  cargo: {
    weight: {
      type: Number,
      required: false,
      min: 0,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
  },
  fuelConsumption: {
    fuelOnDeparture: {
      type: Number,
      required: true,
      min: 0,
    },
    fuelOnArrival: {
      type: Number,
      required: true,
      min: 0,
    },
    fuelUsed: {
      type: Number,
      required: true,
      min: 0,
    },
    fuelEfficiency: {
      type: Number,
      required: false,
      min: 0,
    },
  },
  flightConditions: {
    weather: {
      type: String,
      required: true,
      trim: true,
    },
    visibility: {
      type: String,
      required: true,
      trim: true,
    },
    windSpeed: {
      type: Number,
      required: false,
      min: 0,
    },
    windDirection: {
      type: Number,
      required: false,
      min: 0,
      max: 360,
    },
    temperature: {
      type: Number,
      required: false,
    },
    altitude: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  flightType: {
    type: String,
    required: true,
    enum: ['passenger', 'cargo', 'charter', 'training', 'maintenance', 'positioning'],
    index: true,
  },
  flightStatus: {
    type: String,
    required: true,
    enum: ['scheduled', 'in_progress', 'completed', 'delayed', 'cancelled', 'diverted'],
    default: 'scheduled',
    index: true,
  },
  delayReasons: [{
    type: String,
    trim: true,
  }],
  incidents: [{
    incidentType: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
    },
    reportedBy: {
      type: String,
      required: true,
      trim: true,
    },
    timeOfIncident: {
      type: Date,
      required: true,
    },
  }],
  maintenanceRequired: [{
    maintenanceType: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    urgency: {
      type: String,
      required: true,
      enum: ['routine', 'urgent', 'critical'],
    },
    reportedBy: {
      type: String,
      required: true,
      trim: true,
    },
  }],
  route: {
    waypoints: [{
      type: String,
      trim: true,
    }],
    flightLevel: {
      type: Number,
      required: false,
      min: 0,
    },
    routeDistance: {
      type: Number,
      required: false,
      min: 0,
    },
  },
  operationalNotes: {
    type: String,
    required: false,
    trim: true,
  },
  pilotRemarks: {
    type: String,
    required: false,
    trim: true,
  },
  dispatchRemarks: {
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
FlightLogSchema.index({ flightDate: -1, flightStatus: 1 });
FlightLogSchema.index({ aircraftId: 1, flightDate: -1 });
FlightLogSchema.index({ flightNumber: 1, flightDate: -1 });
FlightLogSchema.index({ 'departureAirport.code': 1, 'arrivalAirport.code': 1 });
FlightLogSchema.index({ flightType: 1, flightStatus: 1 });
FlightLogSchema.index({ 'crew.captain.name': 1 });

// Update the updatedAt field before saving
FlightLogSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Export the model
export const FlightLog = mongoose.models.FlightLog || mongoose.model<IFlightLog>('FlightLog', FlightLogSchema); 