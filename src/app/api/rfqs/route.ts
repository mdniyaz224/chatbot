/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';
import { RFQ } from '@/lib/models/RFQ';

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectToMongoDB();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    // Build query filter
    const filter: any = {};
    if (status && status !== 'all') {
      filter.rfqStatus = status;
    }
    if (type && type !== 'all') {
      filter.rfqType = type;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch RFQs with pagination
    const [rfqs, total] = await Promise.all([
      RFQ.find(filter)
        .sort({ submissionDeadline: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      RFQ.countDocuments(filter)
    ]);

    // Get status summary
    const statusSummary = await RFQ.aggregate([
      {
        $group: {
          _id: '$rfqStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get type summary
    const typeSummary = await RFQ.aggregate([
      {
        $group: {
          _id: '$rfqType',
          count: { $sum: 1 }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      rfqs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      summary: {
        total,
        byStatus: statusSummary.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byType: typeSummary.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Error fetching RFQs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch RFQs',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectToMongoDB();

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'rfqType', 'submissionDeadline', 'requester'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Field '${field}' is required` },
          { status: 400 }
        );
      }
    }

    // Generate RFQ number if not provided
    if (!body.rfqNumber) {
      const lastRFQ: any = await RFQ.findOne()
        .sort({ createdAt: -1 })
        .select('rfqNumber')
        .lean();
      
      let nextNumber = 1;
      if (lastRFQ && lastRFQ?.rfqNumber) {
        const match = lastRFQ?.rfqNumber?.match(/RFQ-(\d{4})-(\d{3})/);
        if (match) {
          const year = new Date().getFullYear();
          const currentYear = parseInt(match[1]);
          const currentNumber = parseInt(match[2]);
          
          if (year === currentYear) {
            nextNumber = currentNumber + 1;
          }
        }
      }
      
      body.rfqNumber = `RFQ-${new Date().getFullYear()}-${nextNumber.toString().padStart(3, '0')}`;
    }

    // Create new RFQ
    const newRFQ = new RFQ(body);
    await newRFQ.save();

    return NextResponse.json({
      success: true,
      rfq: newRFQ,
      message: 'RFQ created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating RFQ:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create RFQ',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 