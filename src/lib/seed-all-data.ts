// src/lib/seed-all-data.ts
import { connectToMongoDB } from './mongodb';
import { Aircraft } from './models/Aircraft';
import { PurchaseOrder } from './models/PurchaseOrder';
import { FlightLog } from './models/FlightLog';
import { RFQ } from './models/RFQ';
import { User } from './models/User';
import { KnowledgeBase } from './models/KnowledgeBase';

async function seedAllCollections() {
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
        password: "admin123" // In real app, this should be hashed
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
      console.log('⏭️  Users already exist');
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
      console.log('⏭️  Aircraft already exist');
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
      console.log('⏭️  Purchase orders already exist');
    }

    // 4. Seed Flight Logs
    console.log('\n🛫 Seeding Flight Logs...');
    const flightLogData = [
      {
        flightLogId: "FL001",
        flightNumber: "AC101",
        aircraftId: "AC001",
        registrationNumber: "N737BA",
        flightDate: new Date('2024-03-15'),
        departureAirport: {
          code: "JFK",
          name: "John F. Kennedy International Airport",
          location: "New York, NY"
        },
        arrivalAirport: {
          code: "LAX", 
          name: "Los Angeles International Airport",
          location: "Los Angeles, CA"
        },
        departureTime: new Date('2024-03-15T08:00:00Z'),
        arrivalTime: new Date('2024-03-15T14:30:00Z'),
        actualDepartureTime: new Date('2024-03-15T08:15:00Z'),
        actualArrivalTime: new Date('2024-03-15T14:45:00Z'),
        flightDuration: 390, // 6.5 hours
        actualFlightDuration: 390,
        distance: 2475,
        crew: {
          captain: {
            name: "Captain Robert Johnson",
            licenseNumber: "ATP-001234",
            email: "pilot.johnson@aviationco.com"
          },
          firstOfficer: {
            name: "First Officer Emily Davis",
            licenseNumber: "CPL-005678",
            email: "fo.davis@aviationco.com"
          },
          cabinCrew: [
            {
              name: "Sarah Martinez",
              position: "Lead Flight Attendant",
              licenseNumber: "FA-001122"
            },
            {
              name: "John Smith",
              position: "Flight Attendant", 
              licenseNumber: "FA-003344"
            }
          ]
        },
        passengers: {
          adultCount: 162,
          childCount: 15,
          infantCount: 3,
          totalCount: 180
        },
                 fuelConsumption: {
           fuelOnDeparture: 6200,
           fuelUsed: 4800,
           fuelOnArrival: 1400
         },
         flightConditions: {
           weather: "Clear, Light turbulence at FL350",
           visibility: "10+ miles",
           altitude: 35000
         },
         flightStatus: "completed",
         flightType: "passenger",
         remarks: "Normal flight operations",
         createdBy: "pilot.johnson@aviationco.com"
      },
      {
        flightLogId: "FL002",
        flightNumber: "AC205",
        aircraftId: "AC002",
        registrationNumber: "N320AB",
        flightDate: new Date('2024-03-16'),
        departureAirport: {
          code: "LAX",
          name: "Los Angeles International Airport", 
          location: "Los Angeles, CA"
        },
        arrivalAirport: {
          code: "SEA",
          name: "Seattle-Tacoma International Airport",
          location: "Seattle, WA"
        },
        departureTime: new Date('2024-03-16T16:00:00Z'),
        arrivalTime: new Date('2024-03-16T18:45:00Z'),
        actualDepartureTime: new Date('2024-03-16T16:20:00Z'),
        actualArrivalTime: new Date('2024-03-16T19:10:00Z'),
        flightDuration: 165, // 2.75 hours
        actualFlightDuration: 170,
        distance: 954,
        crew: {
          captain: {
            name: "Captain Lisa Thompson", 
            licenseNumber: "ATP-002345",
            email: "flight.ops@aviationco.com"
          },
          firstOfficer: {
            name: "First Officer Michael Brown",
            licenseNumber: "CPL-006789",
            email: "fo.brown@aviationco.com"
          },
          cabinCrew: [
            {
              name: "Jennifer Wilson",
              position: "Lead Flight Attendant",
              licenseNumber: "FA-002233"
            }
          ]
        },
        passengers: {
          adultCount: 145,
          childCount: 8,
          infantCount: 2,
          totalCount: 155
        },
                 fuelConsumption: {
           fuelOnDeparture: 4200,
           fuelUsed: 2100,
           fuelOnArrival: 2100
         },
         flightConditions: {
           weather: "Overcast, Rain, Moderate turbulence",
           visibility: "4-6 miles",
           altitude: 37000
         },
         flightStatus: "completed",
         flightType: "passenger",
         remarks: "Delayed departure due to weather",
         createdBy: "flight.ops@aviationco.com"
      },
      {
        flightLogId: "FL003",
        flightNumber: "EX001",
        aircraftId: "AC003",
        registrationNumber: "N600BG", 
        flightDate: new Date('2024-03-17'),
        departureAirport: {
          code: "TEB",
          name: "Teterboro Airport",
          location: "Teterboro, NJ"
        },
        arrivalAirport: {
          code: "MIA",
          name: "Miami International Airport",
          location: "Miami, FL"
        },
        departureTime: new Date('2024-03-17T09:00:00Z'),
        arrivalTime: new Date('2024-03-17T12:30:00Z'),
        actualDepartureTime: new Date('2024-03-17T09:05:00Z'),
        actualArrivalTime: new Date('2024-03-17T12:25:00Z'),
        flightDuration: 210, // 3.5 hours
        actualFlightDuration: 200,
        distance: 1089,
        crew: {
          captain: {
            name: "Captain David Miller",
            licenseNumber: "ATP-003456",
            email: "d.miller@privatejets.com"
          },
          firstOfficer: {
            name: "First Officer Amanda Clark",
            licenseNumber: "CPL-007890",
            email: "a.clark@privatejets.com"
          },
          cabinCrew: [
            {
              name: "Patricia Rodriguez",
              position: "Flight Attendant",
              licenseNumber: "FA-004455"
            }
          ]
        },
        passengers: {
          adultCount: 6,
          childCount: 2,
          infantCount: 0,
          totalCount: 8
        },
                 fuelConsumption: {
           fuelOnDeparture: 3500,
           fuelUsed: 1800,
           fuelOnArrival: 1700
         },
         flightConditions: {
           weather: "Clear, Smooth conditions",
           visibility: "10+ miles",
           altitude: 41000
         },
         flightStatus: "completed",
         flightType: "charter",
         remarks: "VIP charter flight",
         createdBy: "d.miller@privatejets.com"
      }
    ];

    const existingFlightLogs = await FlightLog.countDocuments();
    if (existingFlightLogs === 0) {
      const flightLogs = await FlightLog.insertMany(flightLogData);
      console.log(`✅ ${flightLogs.length} flight logs inserted`);
      totalInserted += flightLogs.length;
    } else {
      console.log('⏭️  Flight logs already exist');
    }

    // 5. Seed RFQs
    console.log('\n📝 Seeding RFQs...');
    const rfqData = [
      {
        rfqId: "RFQ001",
        rfqNumber: "RFQ-2024-001",
        title: "Aircraft Engine Maintenance Services",
        description: "Comprehensive maintenance services for Boeing 737 and Airbus A320 engines including scheduled inspections, repairs, and overhaul services.",
        requester: {
          name: "Sarah Chen",
          department: "Maintenance",
          email: "maintenance.chief@aviationco.com",
          phone: "+1-555-0456"
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
            unit: "engines",
            specifications: "FAA/EASA certified facility required",
            estimatedValue: 2500000,
            requiredDeliveryDate: new Date('2024-09-01')
          },
          {
            itemId: "ITM002", 
            itemName: "V2500 Engine Hot Section Inspection",
            description: "Hot section inspection and repair for V2500 engines",
            quantity: 1,
            unit: "engine",
            specifications: "OEM approved procedures",
            estimatedValue: 800000,
            requiredDeliveryDate: new Date('2024-07-15')
          }
        ],
        deliveryRequirements: {
          deliveryLocation: "Aviation Corp Maintenance Facility, Dallas TX",
          requiredDeliveryDate: new Date('2024-09-01'),
          deliveryTerms: "FOB Destination",
          packagingRequirements: "Engine preservation and shipping containers"
        },
        budgetRange: {
          minBudget: 3000000,
          maxBudget: 4000000,
          currency: "USD"
        },
                 submissionDeadline: new Date('2024-05-15'),
         rfqStatus: "published",
         issuedDate: new Date('2024-03-15'),
         validUntil: new Date('2024-12-31'),
         expectedAwardDate: new Date('2024-06-01'),
         createdBy: "maintenance.chief@aviationco.com",
         vendors: [
           {
             vendorId: "V001",
             vendorName: "MainTech Aviation Services",
             contactPerson: "Robert Smith",
             email: "r.smith@maintech.com",
             phone: "+1-555-1001",
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
          department: "Procurement",
          email: "procurement.manager@aviationco.com", 
          phone: "+1-555-0123"
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
            unit: "gallons/year",
            specifications: "ASTM D1655, DEF STAN 91-91 compliant",
            estimatedValue: 150000000,
            requiredDeliveryDate: new Date('2024-06-01')
          }
        ],
        deliveryRequirements: {
          deliveryLocation: "Multiple airports: JFK, LAX, DFW",
          requiredDeliveryDate: new Date('2024-06-01'),
          deliveryTerms: "Into-wing delivery",
          packagingRequirements: "Direct fuel truck delivery"
        },
        budgetRange: {
          minBudget: 140000000,
          maxBudget: 180000000,
          currency: "USD"
        },
                 submissionDeadline: new Date('2024-04-30'),
         rfqStatus: "evaluation",
         issuedDate: new Date('2024-02-01'),
         validUntil: new Date('2025-01-31'),
         expectedAwardDate: new Date('2024-05-15'),
         createdBy: "procurement.manager@aviationco.com",
         vendors: [
           {
             vendorId: "V002",
             vendorName: "Global Fuel Solutions",
             contactPerson: "Maria Garcia",
             email: "m.garcia@globalfuel.com",
             phone: "+1-555-2002",
             invitationDate: new Date('2024-02-01'),
             responseStatus: "submitted"
           },
           {
             vendorId: "V003", 
             vendorName: "AeroFuel International",
             contactPerson: "David Chen",
             email: "d.chen@aerofuel.com",
             phone: "+1-555-3003",
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
          department: "Ground Operations",
          email: "flight.ops@aviationco.com",
          phone: "+1-555-0789"
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
            unit: "units", 
            specifications: "Suitable for Boeing 737 and Airbus A320",
            estimatedValue: 450000,
            requiredDeliveryDate: new Date('2024-08-01')
          },
          {
            itemId: "ITM005",
            itemName: "Ground Power Unit",
            description: "28V DC and 400Hz AC ground power unit",
            quantity: 2,
            unit: "units",
            specifications: "Portable, diesel powered",
            estimatedValue: 120000,
            requiredDeliveryDate: new Date('2024-07-01')
          }
        ],
        deliveryRequirements: {
          deliveryLocation: "Aviation Corp Main Hub, Dallas TX",
          requiredDeliveryDate: new Date('2024-08-01'),
          deliveryTerms: "DDP Dallas",
          packagingRequirements: "Standard export packaging"
        },
        budgetRange: {
          minBudget: 500000,
          maxBudget: 700000,
          currency: "USD"
        },
                 submissionDeadline: new Date('2024-04-15'),
         rfqStatus: "draft",
         issuedDate: new Date('2024-03-10'),
         validUntil: new Date('2024-10-31'),
         expectedAwardDate: new Date('2024-05-01'),
         createdBy: "flight.ops@aviationco.com",
         vendors: [
           {
             vendorId: "V004",
             vendorName: "GroundTech Equipment",
             contactPerson: "Jennifer Wilson",
             email: "j.wilson@groundtech.com",
             phone: "+1-555-4004",
             invitationDate: new Date('2024-03-10'),
             responseStatus: "invited"
           }
         ]
      }
    ];

    const existingRFQs = await RFQ.countDocuments();
    if (existingRFQs === 0) {
      const rfqs = await RFQ.insertMany(rfqData);
      console.log(`✅ ${rfqs.length} RFQs inserted`);
      totalInserted += rfqs.length;
    } else {
      console.log('⏭️  RFQs already exist');
    }

    // 6. Seed Knowledge Base (if not already done)
    console.log('\n📚 Checking Knowledge Base...');
    const existingKB = await KnowledgeBase.countDocuments();
    if (existingKB === 0) {
      console.log('🌱 Knowledge Base is empty, run: npm run seed');
    } else {
      console.log(`✅ Knowledge Base already has ${existingKB} entries`);
    }

    console.log('\n🎉 Database seeding completed!');
    console.log(`📊 Total new records inserted: ${totalInserted}`);
    console.log('\n📋 Summary:');
    console.log(`👥 Users: ${await User.countDocuments()}`);
    console.log(`✈️  Aircraft: ${await Aircraft.countDocuments()}`);
    console.log(`📋 Purchase Orders: ${await PurchaseOrder.countDocuments()}`);
    console.log(`🛫 Flight Logs: ${await FlightLog.countDocuments()}`);
    console.log(`📝 RFQs: ${await RFQ.countDocuments()}`);
    console.log(`📚 Knowledge Base: ${await KnowledgeBase.countDocuments()}`);

  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    throw error;
  }
}

// Export the function
export { seedAllCollections };

// Auto-run when script is executed directly
if (require.main === module) {
  seedAllCollections()
    .then(() => {
      console.log('✅ All data seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Data seeding failed:', error);
      process.exit(1);
    });
} 