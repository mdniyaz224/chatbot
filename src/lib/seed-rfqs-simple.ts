// src/lib/seed-rfqs-simple.ts
import { connectToMongoDB } from './mongodb';
import { RFQ } from './models/RFQ';

async function seedSimpleRFQs() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectToMongoDB();
    console.log('✅ Connected to MongoDB');

    // Check if RFQs already exist
    const existingRFQs = await RFQ.countDocuments();
    if (existingRFQs > 0) {
      console.log(`⏭️  RFQs already exist (${existingRFQs} found)`);
      return;
    }

    // Minimal RFQ data with only essential required fields
    const minimalRFQData = [
      {
        rfqId: "RFQ001",
        rfqNumber: "RFQ-2024-001",
        title: "Aircraft Engine Maintenance Services",
        description: "Comprehensive maintenance services for Boeing 737 and Airbus A320 engines including scheduled inspections, repairs, and overhaul services.",
        requester: {
          name: "Sarah Chen",
          email: "maintenance.chief@aviationco.com"
        },
        rfqType: "maintenance_services",
        category: "Engine Maintenance",
        priority: "high",
        items: [
          {
            itemId: "ITM001",
            itemName: "CFM56 Engine Overhaul",
            description: "Complete overhaul service for CFM56-7B engines",
            quantity: 2,
            unit: "engines"
          }
        ],
        deliveryRequirements: {
          deliveryLocation: "Aviation Corp Maintenance Facility, Dallas TX",
          requiredDeliveryDate: new Date('2024-09-01')
        },
        submissionDeadline: new Date('2024-05-15'),
        rfqStatus: "published",
        createdBy: "maintenance.chief@aviationco.com",
        vendors: [
          {
            vendorId: "V001",
            vendorName: "MainTech Aviation Services",
            contactPerson: "Robert Smith",
            email: "r.smith@maintech.com",
            invitationDate: new Date('2024-03-15'),
            responseStatus: "acknowledged"
          }
        ]
      },
      {
        rfqId: "RFQ002",
        rfqNumber: "RFQ-2024-002",
        title: "Aviation Fuel Supply Contract",
        description: "Long-term contract for aviation fuel supply at multiple airport locations including JFK, LAX, and DFW.",
        requester: {
          name: "Michael Rodriguez",
          email: "procurement.manager@aviationco.com"
        },
        rfqType: "fuel_supply",
        category: "Fuel & Energy",
        priority: "medium",
        items: [
          {
            itemId: "ITM003",
            itemName: "Jet A-1 Fuel",
            description: "Premium grade Jet A-1 aviation fuel",
            quantity: 50000000,
            unit: "gallons/year"
          }
        ],
        deliveryRequirements: {
          deliveryLocation: "Multiple airports: JFK, LAX, DFW",
          requiredDeliveryDate: new Date('2024-06-01')
        },
        submissionDeadline: new Date('2024-04-30'),
                 rfqStatus: "under_evaluation",
        createdBy: "procurement.manager@aviationco.com",
        vendors: [
          {
            vendorId: "V002",
            vendorName: "Global Fuel Solutions",
            contactPerson: "Maria Garcia",
            email: "m.garcia@globalfuel.com",
            invitationDate: new Date('2024-02-01'),
            responseStatus: "submitted"
          }
        ]
      },
      {
        rfqId: "RFQ003",
        rfqNumber: "RFQ-2024-003",
        title: "Ground Support Equipment Procurement",
        description: "Purchase of various ground support equipment including baggage tractors, aircraft tugs, and ground power units.",
        requester: {
          name: "Lisa Thompson",
          email: "flight.ops@aviationco.com"
        },
        rfqType: "ground_equipment",
        category: "Ground Support",
        priority: "low",
        items: [
          {
            itemId: "ITM004",
            itemName: "Aircraft Tug",
            description: "Heavy duty aircraft tug for narrow-body aircraft",
            quantity: 3,
            unit: "units"
          }
        ],
        deliveryRequirements: {
          deliveryLocation: "Aviation Corp Main Hub, Dallas TX",
          requiredDeliveryDate: new Date('2024-08-01')
        },
        submissionDeadline: new Date('2024-04-15'),
        rfqStatus: "draft",
        createdBy: "flight.ops@aviationco.com",
        vendors: [
          {
            vendorId: "V004",
            vendorName: "GroundTech Equipment",
            contactPerson: "Jennifer Wilson",
            email: "j.wilson@groundtech.com",
            invitationDate: new Date('2024-03-10'),
            responseStatus: "invited"
          }
        ]
      }
    ];

    console.log('\n📝 Seeding RFQs with minimal data...');
    const rfqs = await RFQ.insertMany(minimalRFQData);
    console.log(`✅ ${rfqs.length} RFQs inserted successfully!`);

    console.log('\n📊 RFQ Summary:');
    console.log(`📝 Total RFQs: ${await RFQ.countDocuments()}`);

  } catch (error) {
    console.error('❌ Failed to seed RFQs:', error);
    throw error;
  }
}

// Export the function
export { seedSimpleRFQs };

// Auto-run when script is executed directly
if (require.main === module) {
  seedSimpleRFQs()
    .then(() => {
      console.log('✅ RFQ seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ RFQ seeding failed:', error);
      process.exit(1);
    });
} 