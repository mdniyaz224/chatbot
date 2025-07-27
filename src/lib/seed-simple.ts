// src/lib/seed-simple.ts
import { connectToMongoDB } from './mongodb';
import { Aircraft } from './models/Aircraft';
import { PurchaseOrder } from './models/PurchaseOrder';
import { User } from './models/User';
import { KnowledgeBase } from './models/KnowledgeBase';

async function seedEssentialData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectToMongoDB();
    console.log('✅ Connected to MongoDB');

    let totalInserted = 0;

    // 1. Seed Users
    console.log('\n👥 Seeding Users...');
    const userData = [
      {
        email: "admin@aviationco.com",
        name: "Admin User",
        provider: "local",
        password: "admin123"
      },
      {
        email: "pilot.johnson@aviationco.com", 
        name: "Captain Robert Johnson",
        provider: "local"
      },
      {
        email: "maintenance.chief@aviationco.com",
        name: "Sarah Chen",
        provider: "local"
      },
      {
        email: "procurement.manager@aviationco.com",
        name: "Michael Rodriguez", 
        provider: "local"
      },
      {
        email: "flight.ops@aviationco.com",
        name: "Lisa Thompson",
        provider: "local"
      }
    ];

    const existingUsers = await User.countDocuments();
    if (existingUsers === 0) {
      const users = await User.insertMany(userData);
      console.log(`✅ ${users.length} users inserted`);
      totalInserted += users.length;
    } else {
      console.log(`⏭️  Users already exist (${existingUsers} found)`);
    }

    // 2. Seed Aircraft
    console.log('\n✈️  Seeding Aircraft...');
    const aircraftData = [
      {
        aircraftId: "AC001",
        manufacturer: "Boeing",
        model: "737-800",
        variant: "MAX",
        serialNumber: "B737-001",
        registrationNumber: "N737BA",
        yearOfManufacture: 2019,
        maxSeatingCapacity: 189,
        fuelCapacity: 6875,
        maxRange: 3850,
        cruisingSpeed: 453,
        engineType: "CFM56-7B",
        engineCount: 2,
        aircraftType: "commercial",
        status: "active",
        acquisitionDate: new Date('2019-06-15'),
        purchasePrice: 89000000,
        currentValue: 78000000,
        location: "JFK International Airport",
        owner: "Aviation Corp",
        operator: "Aviation Corp",
        maintenanceSchedule: {
          lastMaintenance: new Date('2024-01-15'),
          nextMaintenance: new Date('2024-07-15'),
          maintenanceType: "C-Check"
        },
        specifications: {
          wingspan: 35.8,
          length: 39.5,
          height: 12.5,
          emptyWeight: 45070,
          maxTakeoffWeight: 79016
        },
        notes: "Primary aircraft for domestic routes"
      },
      {
        aircraftId: "AC002", 
        manufacturer: "Airbus",
        model: "A320",
        variant: "neo",
        serialNumber: "A320-002",
        registrationNumber: "N320AB",
        yearOfManufacture: 2020,
        maxSeatingCapacity: 180,
        fuelCapacity: 6400,
        maxRange: 3700,
        cruisingSpeed: 447,
        engineType: "CFM56-5B",
        engineCount: 2,
        aircraftType: "commercial",
        status: "active",
        acquisitionDate: new Date('2020-03-20'),
        purchasePrice: 98000000,
        currentValue: 87000000,
        location: "LAX International Airport",
        owner: "Aviation Corp",
        operator: "Aviation Corp",
        maintenanceSchedule: {
          lastMaintenance: new Date('2024-02-10'),
          nextMaintenance: new Date('2024-08-10'),
          maintenanceType: "A-Check"
        },
        specifications: {
          wingspan: 35.8,
          length: 37.6,
          height: 11.8,
          emptyWeight: 42600,
          maxTakeoffWeight: 78000
        },
        notes: "Fuel-efficient aircraft for medium-haul routes"
      },
      {
        aircraftId: "AC003",
        manufacturer: "Bombardier",
        model: "Global 6000",
        serialNumber: "BD700-003",
        registrationNumber: "N600BG",
        yearOfManufacture: 2018,
        maxSeatingCapacity: 17,
        fuelCapacity: 4100,
        maxRange: 6000,
        cruisingSpeed: 488,
        engineType: "Rolls-Royce BR710",
        engineCount: 2,
        aircraftType: "private",
        status: "active",
        acquisitionDate: new Date('2018-09-10'),
        purchasePrice: 56000000,
        currentValue: 45000000,
        location: "Teterboro Airport",
        owner: "Executive Holdings",
        operator: "Private Jets Inc",
        maintenanceSchedule: {
          lastMaintenance: new Date('2024-01-05'),
          nextMaintenance: new Date('2024-04-05'),
          maintenanceType: "Progressive"
        },
        specifications: {
          wingspan: 28.7,
          length: 30.3,
          height: 7.6,
          emptyWeight: 22226,
          maxTakeoffWeight: 45360
        },
        notes: "Executive transport for VIP passengers"
      },
      {
        aircraftId: "AC004",
        manufacturer: "Boeing",
        model: "747-8F",
        serialNumber: "B747-004",
        registrationNumber: "N747CF",
        yearOfManufacture: 2021,
        maxSeatingCapacity: 1, // Minimum required by schema (cargo aircraft)
        fuelCapacity: 19870,
        maxRange: 4390,
        cruisingSpeed: 493,
        engineType: "GEnx-2B67",
        engineCount: 4,
        aircraftType: "cargo",
        status: "active",
        acquisitionDate: new Date('2021-11-30'),
        purchasePrice: 378000000,
        currentValue: 340000000,
        location: "Memphis International Airport",
        owner: "Cargo Airways",
        operator: "Cargo Airways",
        maintenanceSchedule: {
          lastMaintenance: new Date('2024-01-20'),
          nextMaintenance: new Date('2024-10-20'),
          maintenanceType: "Heavy Maintenance"
        },
        specifications: {
          wingspan: 68.4,
          length: 76.3,
          height: 19.4,
          emptyWeight: 220128,
          maxTakeoffWeight: 448000
        },
        notes: "Heavy cargo transport aircraft"
      },
      {
        aircraftId: "AC005",
        manufacturer: "Cessna",
        model: "Citation CJ4",
        serialNumber: "C525-005",
        registrationNumber: "N525CC",
        yearOfManufacture: 2022,
        maxSeatingCapacity: 10,
        fuelCapacity: 975,
        maxRange: 1800,
        cruisingSpeed: 376,
        engineType: "Williams FJ44-4A",
        engineCount: 2,
        aircraftType: "private",
        status: "maintenance",
        acquisitionDate: new Date('2022-05-15'),
        purchasePrice: 9000000,
        currentValue: 8200000,
        location: "Phoenix Sky Harbor",
        owner: "Regional Express",
        operator: "Regional Express",
        maintenanceSchedule: {
          lastMaintenance: new Date('2024-02-01'),
          nextMaintenance: new Date('2024-05-01'),
          maintenanceType: "100-hour"
        },
        specifications: {
          wingspan: 15.5,
          length: 16.3,
          height: 4.6,
          emptyWeight: 4853,
          maxTakeoffWeight: 7759
        },
        notes: "Light business jet for regional flights"
      }
    ];

    const existingAircraft = await Aircraft.countDocuments();
    if (existingAircraft === 0) {
      const aircraft = await Aircraft.insertMany(aircraftData);
      console.log(`✅ ${aircraft.length} aircraft inserted`);
      totalInserted += aircraft.length;
    } else {
      console.log(`⏭️  Aircraft already exist (${existingAircraft} found)`);
    }

    // 3. Seed Purchase Orders
    console.log('\n📋 Seeding Purchase Orders...');
    const purchaseOrderData = [
      {
        purchaseOrderId: "PO001",
        poNumber: "PO-2024-001",
        supplier: {
          name: "Boeing Commercial Airplanes",
          contactPerson: "James Wilson",
          email: "j.wilson@boeing.com",
          phone: "+1-206-544-2121",
          address: "100 N Riverside, Chicago, IL 60606"
        },
        buyer: {
          name: "Aviation Corp",
          contactPerson: "Michael Rodriguez",
          email: "procurement.manager@aviationco.com",
          phone: "+1-555-0123",
          address: "123 Aviation Blvd, Dallas, TX 75201"
        },
        aircraftDetails: {
          manufacturer: "Boeing",
          model: "737 MAX 8",
          variant: "200",
          quantity: 1,
          unitPrice: 121600000,
          totalPrice: 121600000,
          specifications: "Standard configuration with LEAP-1B engines"
        },
        orderDate: new Date('2024-01-15'),
        expectedDeliveryDate: new Date('2025-06-15'),
        paymentTerms: "30% advance, 70% on delivery",
        paymentStatus: "partial",
        deliveryTerms: "EXW Seattle",
        deliveryLocation: "Boeing Delivery Center, Seattle",
        status: "in_progress",
        priority: "high",
        currency: "USD",
        totalAmount: 121600000,
        notes: "New aircraft for fleet expansion",
        createdBy: "procurement.manager@aviationco.com"
      },
      {
        purchaseOrderId: "PO002",
        poNumber: "PO-2024-002", 
        supplier: {
          name: "Airbus S.A.S",
          contactPerson: "Marie Dubois",
          email: "m.dubois@airbus.com",
          phone: "+33-5-61-93-33-33",
          address: "2 Rond-Point Emile Dewoitine, 31700 Blagnac, France"
        },
        buyer: {
          name: "Aviation Corp",
          contactPerson: "Michael Rodriguez", 
          email: "procurement.manager@aviationco.com",
          phone: "+1-555-0123",
          address: "123 Aviation Blvd, Dallas, TX 75201"
        },
        aircraftDetails: {
          manufacturer: "Airbus",
          model: "A320neo",
          quantity: 2,
          unitPrice: 110600000,
          totalPrice: 221200000,
          specifications: "Standard single-aisle configuration"
        },
        orderDate: new Date('2024-02-01'),
        expectedDeliveryDate: new Date('2025-12-01'),
        paymentTerms: "20% advance, 80% on delivery",
        paymentStatus: "pending",
        deliveryTerms: "FCA Hamburg",
        deliveryLocation: "Airbus Hamburg Delivery Center",
        status: "approved",
        priority: "medium",
        currency: "USD",
        totalAmount: 221200000,
        notes: "Fleet modernization program",
        createdBy: "procurement.manager@aviationco.com"
      },
      {
        purchaseOrderId: "PO003",
        poNumber: "PO-2024-003",
        supplier: {
          name: "Pratt & Whitney",
          contactPerson: "Robert Chen",
          email: "r.chen@pw.utc.com",
          phone: "+1-860-565-4321",
          address: "400 Main St, East Hartford, CT 06118"
        },
        buyer: {
          name: "Aviation Corp",
          contactPerson: "Sarah Chen",
          email: "maintenance.chief@aviationco.com", 
          phone: "+1-555-0456",
          address: "123 Aviation Blvd, Dallas, TX 75201"
        },
        aircraftDetails: {
          manufacturer: "Pratt & Whitney",
          model: "PW1100G-JM Engine",
          quantity: 4,
          unitPrice: 15000000,
          totalPrice: 60000000,
          specifications: "Spare engines for A320neo fleet"
        },
        orderDate: new Date('2024-01-20'),
        expectedDeliveryDate: new Date('2024-08-15'),
        paymentTerms: "Net 30 days",
        paymentStatus: "paid",
        deliveryTerms: "DAP Dallas",
        deliveryLocation: "Aviation Corp Maintenance Facility",
        status: "delivered",
        priority: "high",
        currency: "USD",
        totalAmount: 60000000,
        notes: "Spare engine inventory for maintenance",
        createdBy: "maintenance.chief@aviationco.com"
      }
    ];

    const existingPOs = await PurchaseOrder.countDocuments();
    if (existingPOs === 0) {
      const pos = await PurchaseOrder.insertMany(purchaseOrderData);
      console.log(`✅ ${pos.length} purchase orders inserted`);
      totalInserted += pos.length;
    } else {
      console.log(`⏭️  Purchase orders already exist (${existingPOs} found)`);
    }

    // 4. Seed Knowledge Base (if not already done)
    console.log('\n📚 Checking Knowledge Base...');
    const existingKB = await KnowledgeBase.countDocuments();
    if (existingKB === 0) {
      console.log('🌱 Knowledge Base is empty, run: npm run seed');
    } else {
      console.log(`✅ Knowledge Base already has ${existingKB} entries`);
    }

    console.log('\n🎉 Essential database seeding completed!');
    console.log(`📊 Total new records inserted: ${totalInserted}`);
    console.log('\n📋 Current Database Summary:');
    console.log(`👥 Users: ${await User.countDocuments()}`);
    console.log(`✈️  Aircraft: ${await Aircraft.countDocuments()}`);
    console.log(`📋 Purchase Orders: ${await PurchaseOrder.countDocuments()}`);
    console.log(`📚 Knowledge Base: ${await KnowledgeBase.countDocuments()}`);

    console.log('\n💡 Next Steps:');
    console.log('- Run "npm run seed" if Knowledge Base is empty');
    console.log('- Complex collections (FlightLogs, RFQs) require schema updates before seeding');
    console.log('- Your ChatGPT-like chatbot is now ready with substantial data!');

  } catch (error) {
    console.error('❌ Failed to seed essential data:', error);
    throw error;
  }
}

// Export the function
export { seedEssentialData };

// Auto-run when script is executed directly
if (require.main === module) {
  seedEssentialData()
    .then(() => {
      console.log('✅ Essential data seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Essential data seeding failed:', error);
      process.exit(1);
    });
} 