/* eslint-disable @typescript-eslint/no-unused-vars */
// src/lib/seed.ts
import { connectToMongoDB } from './mongodb';
import { KnowledgeBase } from './models/KnowledgeBase';

async function seedKnowledgeBase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectToMongoDB();
    console.log('✅ Connected to MongoDB');

    // Your knowledge data
    const knowledgeData = [
      {
        topic: "RFQ Process",
        content: "An RFQ (Request for Quotation) is a document used to invite vendors to bid on supplying specific products or services. It typically includes specifications, quantity, and deadlines.",
        category: "Procurement",
        tags: ["rfq", "procurement", "vendor", "quotation", "bidding"]
      },
      {
        topic: "Purchase Order",
        content: "A Purchase Order (PO) is a commercial document issued by a buyer to a seller, indicating types, quantities, and agreed prices for products or services. It becomes a legal contract once accepted.",
        category: "Procurement",
        tags: ["purchase order", "po", "contract", "buyer", "seller", "commercial"]
      },
      {
        topic: "Flight Log",
        content: "A Flight Log is a document used to record all operational information about a flight, including departure and arrival times, fuel used, pilot-in-command, and any incidents during the flight.",
        category: "Aviation Operations",
        tags: ["flight log", "flight operations", "pilot", "aircraft", "fuel", "flight record"]
      },
      {
        topic: "Aircraft Maintenance",
        content: "Aircraft maintenance refers to the routine and scheduled inspection, repair, and overhaul of aircraft to ensure airworthiness. It includes line maintenance, base maintenance, and engine checks.",
        category: "Aviation Maintenance",
        tags: ["maintenance", "aircraft", "inspection", "airworthiness", "repair", "overhaul"]
      },
      {
        topic: "Invoice vs Purchase Order",
        content: "A Purchase Order is issued by the buyer to request goods/services, while an Invoice is sent by the seller to request payment. A PO initiates a transaction; an invoice finalizes it.",
        category: "Procurement",
        tags: ["invoice", "purchase order", "payment", "transaction", "buyer", "seller"]
      },
      {
        topic: "Vendor Selection Criteria",
        content: "Vendor selection is based on several factors such as cost, quality, delivery timelines, past performance, certifications, and compliance with industry standards.",
        category: "Procurement",
        tags: ["vendor selection", "cost", "quality", "delivery", "performance", "certification"]
      },
      {
        topic: "Types of Procurement",
        content: "Procurement can be classified as direct, indirect, goods-based, or services-based. Direct procurement refers to purchasing materials for production, while indirect is for operations.",
        category: "Procurement",
        tags: ["procurement types", "direct procurement", "indirect procurement", "goods", "services"]
      },
      {
        topic: "Quotation",
        content: "A quotation is a formal statement from a seller that provides a proposed price for specific goods or services. It includes terms like delivery time, pricing, and validity period.",
        category: "Procurement",
        tags: ["quotation", "pricing", "delivery time", "validity", "seller", "proposal"]
      },
      {
        topic: "Aircraft Registration",
        content: "Aircraft registration is the national marking system for civil aircraft. Each aircraft must be registered with a national authority and display unique registration marks.",
        category: "Aviation Regulations",
        tags: ["aircraft registration", "registration marks", "civil aviation", "national authority"]
      },
      {
        topic: "Airworthiness Certificate",
        content: "An Airworthiness Certificate is a document issued by a civil aviation authority to certify that an aircraft is airworthy at the time of issue and meets design and manufacturing standards.",
        category: "Aviation Regulations",
        tags: ["airworthiness", "certificate", "civil aviation", "standards", "aircraft safety"]
      },
      {
        topic: "Flight Plan",
        content: "A flight plan is a document filed with air traffic control that contains information about a proposed flight including route, altitude, departure and arrival airports, and estimated times.",
        category: "Aviation Operations",
        tags: ["flight plan", "air traffic control", "route", "altitude", "departure", "arrival"]
      },
      {
        topic: "Aircraft Insurance",
        content: "Aircraft insurance provides coverage for aircraft hull damage, liability for bodily injury and property damage, and other aviation-related risks. It's mandatory for commercial operations.",
        category: "Aviation Finance",
        tags: ["aircraft insurance", "hull coverage", "liability", "commercial aviation", "risk management"]
      }
    ];

    // Check if data already exists
    const existingCount = await KnowledgeBase.countDocuments();
    console.log(`📊 Current knowledge base entries: ${existingCount}`);

    if (existingCount === 0) {
      console.log('🌱 Seeding knowledge base with initial data...');
      const result = await KnowledgeBase.insertMany(knowledgeData);
      console.log(`✅ ${result.length} knowledge entries inserted successfully!`);
      
      // Display inserted topics
      result.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.topic} (${item.category})`);
      });
    } else {
      console.log('📚 Knowledge base already contains data.');
      console.log('🔄 Adding only new entries that don\'t exist...');
      
      let addedCount = 0;
      for (const item of knowledgeData) {
        const exists = await KnowledgeBase.findOne({ topic: item.topic });
        if (!exists) {
          await KnowledgeBase.create(item);
          console.log(`➕ Added: ${item.topic}`);
          addedCount++;
        } else {
          console.log(`⏭️  Skipped (exists): ${item.topic}`);
        }
      }
      
      if (addedCount > 0) {
        console.log(`✅ ${addedCount} new knowledge entries added!`);
      } else {
        console.log('✨ All knowledge entries already exist in the database.');
      }
    }

    // Verify the data
    const finalCount = await KnowledgeBase.countDocuments();
    console.log(`📊 Total knowledge base entries: ${finalCount}`);

    // Create text index if it doesn't exist (should already exist from model definition)
    try {
      await KnowledgeBase.collection.createIndex({ topic: "text", content: "text" });
      console.log('🔍 Text search index ensured');
    } catch (error) {
      console.log('📝 Text index already exists or couldn\'t be created');
    }

    console.log('🎉 Knowledge base seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Failed to seed knowledge base:', error);
    throw error;
  } finally {
    // Note: We don't close the connection here since we're using the cached connection
    // The connection will be reused by the application
    console.log('🔌 Seed operation finished');
  }
}

// Export the function for potential programmatic use
export { seedKnowledgeBase };

// Auto-run when script is executed directly
if (require.main === module) {
  seedKnowledgeBase()
    .then(() => {
      console.log('✅ Seeding script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding script failed:', error);
      process.exit(1);
    });
} 