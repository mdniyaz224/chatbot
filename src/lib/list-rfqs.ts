/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/list-rfqs.ts
import { connectToMongoDB } from './mongodb';
import { RFQ } from './models/RFQ';

async function listAllRFQs() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectToMongoDB();
    console.log('✅ Connected to MongoDB');

    // Count total RFQs
    const totalRFQs = await RFQ.countDocuments();
    console.log(`\n📊 Total RFQs in system: ${totalRFQs}`);

    if (totalRFQs === 0) {
      console.log('\n❌ No RFQs found in the database');
      console.log('💡 Run "npm run seed-all" to populate with sample data');
      return;
    }

    // Fetch all RFQs
    const rfqs = await RFQ.find({}).sort({ createdAt: -1 });
    
    console.log('\n📝 RFQ List (Latest First):');
    console.log('=' .repeat(100));

    rfqs.forEach((rfq, index) => {
      console.log(`\n${index + 1}. RFQ: ${rfq.rfqNumber}`);
      console.log(`   📌 Title: ${rfq.title}`);
      console.log(`   🏷️  Type: ${rfq.rfqType}`);
      console.log(`   📁 Category: ${rfq.category}`);
      console.log(`   ⚡ Priority: ${rfq.priority}`);
      console.log(`   📊 Status: ${rfq.rfqStatus}`);
      console.log(`   👤 Requester: ${rfq.requester.name} (${rfq.requester.department || 'N/A'})`);
      console.log(`   📧 Email: ${rfq.requester.email}`);
      console.log(`   📅 Submission Deadline: ${rfq.submissionDeadline.toDateString()}`);
      
      // Budget info if available
      if (rfq.budgetRange) {
        console.log(`   💰 Budget: ${rfq.budgetRange.currency} ${rfq.budgetRange.minBudget?.toLocaleString()} - ${rfq.budgetRange.maxBudget?.toLocaleString()}`);
      }
      
      // Items count
      if (rfq.items && rfq.items.length > 0) {
        console.log(`   📦 Items: ${rfq.items.length} item(s)`);
        rfq.items.forEach((item: any, itemIndex: number) => {
          console.log(`      ${itemIndex + 1}. ${item.itemName} (Qty: ${item.quantity} ${item.unit})`);
        });
      }
      
      console.log(`   📝 Description: ${rfq.description.substring(0, 100)}${rfq.description.length > 100 ? '...' : ''}`);
      console.log(`   🕒 Created: ${rfq.createdAt.toDateString()}`);
      console.log('   ' + '-'.repeat(90));
    });

    console.log(`\n✅ Listed ${rfqs.length} RFQs successfully`);

    // Summary by status
    console.log('\n📊 RFQ Summary by Status:');
    const statusCounts = await RFQ.aggregate([
      {
        $group: {
          _id: '$rfqStatus',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    statusCounts.forEach(status => {
      console.log(`   ${status._id}: ${status.count}`);
    });

    // Summary by type
    console.log('\n📊 RFQ Summary by Type:');
    const typeCounts = await RFQ.aggregate([
      {
        $group: {
          _id: '$rfqType',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    typeCounts.forEach(type => {
      console.log(`   ${type._id}: ${type.count}`);
    });

  } catch (error) {
    console.error('❌ Failed to list RFQs:', error);
    throw error;
  }
}

// Export the function
export { listAllRFQs };

// Auto-run when script is executed directly
if (require.main === module) {
  listAllRFQs()
    .then(() => {
      console.log('\n🎉 RFQ listing completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ RFQ listing failed:', error);
      process.exit(1);
    });
} 