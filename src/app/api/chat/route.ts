import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';
import { Aircraft } from '@/lib/models/Aircraft';
import { PurchaseOrder } from '@/lib/models/PurchaseOrder';
import { FlightLog } from '@/lib/models/FlightLog';
import { RFQ } from '@/lib/models/RFQ';
import { KnowledgeBase } from '@/lib/models/KnowledgeBase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';

// Types for request body
interface ConversationMessage {
  id: string;
  text?: string;
  content?: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

// Initialize Google Gemini client
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'LOADED' : 'NOT FOUND');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyCcdQIzWLpum8nbRjyPl8NVW-JRB1vbmn4');

// Constants for Gemini configuration
const GEMINI_CONFIG = {
  model: 'gemini-1.5-flash',
  maxTokens: 2048,
  temperature: 0.7,
  maxHistoryMessages: 20, // Limit conversation history to manage tokens
  systemPrompt: `You are an intelligent AI assistant with access to a comprehensive aviation management database. Your role is to:

1. **PRIORITIZE** database information when available - this is the most accurate and up-to-date information
2. **PROVIDE** helpful, accurate answers to ANY question, even if not in the database
3. **BE CONVERSATIONAL** and friendly while maintaining professionalism
4. **INDICATE** when information comes from the database vs. general knowledge

RESPONSE STRATEGY:
- If database results are provided: Use them as the primary source and mention "Based on our database..." or "According to our records..."
- If no database results: Provide helpful general knowledge and mention "Based on general knowledge..." or "Generally speaking..."
- For aviation/procurement topics: Always try to be comprehensive and practical
- For other topics: Provide accurate, helpful information as any good AI assistant would

DATABASE CONTAINS:
- Aircraft information (registration, manufacturer, model, status, location, etc.)
- Purchase orders (suppliers, amounts, aircraft details, status, etc.)  
- Flight logs (flight numbers, routes, crew, dates, status, etc.)
- RFQs (titles, types, status, deadlines, requesters, etc.)
- Knowledge base (aviation concepts, procurement processes, definitions, etc.)

Be helpful, accurate, and conversational. Users should feel like they're talking to a knowledgeable assistant who has both specific database access AND general knowledge.`,
};

// Function to estimate token count (rough approximation)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4); // Rough estimate: 1 token ≈ 4 characters
}

// Function to optimize conversation history for token limits
function optimizeConversationHistory(history: ConversationMessage[]): ConversationMessage[] {
  if (!history || history.length === 0) return [];
  
  // Sort by timestamp and take most recent messages
  const sortedHistory = history
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-GEMINI_CONFIG.maxHistoryMessages);
  
  return sortedHistory;
}

// Function to search relevant aviation data based on user query
async function searchAviationData(query: string): Promise<string> {
  try {
    const searchKeywords = query.toLowerCase();
    const context: string[] = [];

    // Enhanced search - search ALL collections for ANY relevant data
    console.log(`🔍 Searching database for: "${query}"`);

    // Search Aircraft data (enhanced access)
    try {
      let aircraft = [];
      
      // Enhanced search for aircraft-related queries
      const aircraftKeywords = ['aircraft', 'plane', 'airplane', 'jet', 'boeing', 'airbus', 'fleet'];
      const isAircraftQuery = aircraftKeywords.some(keyword => searchKeywords.includes(keyword)) ||
                             searchKeywords.includes('how many') || 
                             searchKeywords.includes('count') ||
                             searchKeywords.includes('list') ||
                             searchKeywords.includes('show');
      
      if (isAircraftQuery) {
        // Get all aircraft for counting/listing
        aircraft = await Aircraft.find({}).limit(20);
      } else {
        // Specific search within aircraft fields
        aircraft = await Aircraft.find({
          $or: [
            { manufacturer: { $regex: searchKeywords, $options: 'i' } },
            { model: { $regex: searchKeywords, $options: 'i' } },
            { registrationNumber: { $regex: searchKeywords, $options: 'i' } },
            { status: { $regex: searchKeywords, $options: 'i' } },
            { aircraftType: { $regex: searchKeywords, $options: 'i' } },
            { location: { $regex: searchKeywords, $options: 'i' } }
          ]
        }).limit(10);
      }
      
      if (aircraft.length > 0) {
        context.push(`\n--- AIRCRAFT DATA (${aircraft.length} found) ---`);
        aircraft.forEach(ac => {
          context.push(`Aircraft: ${ac.manufacturer} ${ac.model} | Registration: ${ac.registrationNumber} | Status: ${ac.status} | Type: ${ac.aircraftType} | Location: ${ac.location || 'N/A'}`);
        });
        
        if (isAircraftQuery) {
          context.push(`TOTAL AIRCRAFT IN FLEET: ${aircraft.length}`);
        }
      }
    } catch (err) {
      console.error('Aircraft search error:', err);
      // Continue - don't let this break other searches
    }

    // Search Purchase Orders (enhanced access)
    try {
      let purchaseOrders = [];
      
      // Enhanced search for purchase order queries
      const poKeywords = ['purchase', 'order', 'po', 'supplier', 'procurement', 'buying'];
      const isPOQuery = poKeywords.some(keyword => searchKeywords.includes(keyword)) ||
                       searchKeywords.includes('how many') || 
                       searchKeywords.includes('count') ||
                       searchKeywords.includes('list') ||
                       searchKeywords.includes('show');
      
      if (isPOQuery) {
        // Get all purchase orders for counting/listing
        purchaseOrders = await PurchaseOrder.find({}).limit(20);
      } else {
        // Specific search within PO fields
        purchaseOrders = await PurchaseOrder.find({
          $or: [
            { 'supplier.name': { $regex: searchKeywords, $options: 'i' } },
            { 'buyer.name': { $regex: searchKeywords, $options: 'i' } },
            { 'aircraftDetails.manufacturer': { $regex: searchKeywords, $options: 'i' } },
            { 'aircraftDetails.model': { $regex: searchKeywords, $options: 'i' } },
            { status: { $regex: searchKeywords, $options: 'i' } },
            { paymentStatus: { $regex: searchKeywords, $options: 'i' } },
            { poNumber: { $regex: searchKeywords, $options: 'i' } }
          ]
        }).limit(10);
      }
      
      if (purchaseOrders.length > 0) {
        context.push(`\n--- PURCHASE ORDERS (${purchaseOrders.length} found) ---`);
        purchaseOrders.forEach(po => {
          context.push(`PO: ${po.poNumber} | Aircraft: ${po.aircraftDetails.manufacturer} ${po.aircraftDetails.model} | Supplier: ${po.supplier.name} | Status: ${po.status} | Amount: ${po.currency} ${po.totalAmount.toLocaleString()}`);
        });
        
        if (isPOQuery) {
          context.push(`TOTAL PURCHASE ORDERS: ${purchaseOrders.length}`);
        }
      }
    } catch (err) {
      console.error('Purchase Orders search error:', err);
      // Continue - don't let this break other searches
    }

    // Search Flight Logs (enhanced access)
    try {
      let flightLogs = [];
      
      // Enhanced search for flight-related queries
      const flightKeywords = ['flight', 'log', 'trip', 'route', 'pilot', 'captain'];
      const isFlightQuery = flightKeywords.some(keyword => searchKeywords.includes(keyword)) ||
                           searchKeywords.includes('how many') || 
                           searchKeywords.includes('count') ||
                           searchKeywords.includes('list') ||
                           searchKeywords.includes('show');
      
      if (isFlightQuery) {
        // Get all flight logs for counting/listing
        flightLogs = await FlightLog.find({}).limit(20);
      } else {
        // Specific search within flight log fields
        flightLogs = await FlightLog.find({
          $or: [
            { flightNumber: { $regex: searchKeywords, $options: 'i' } },
            { registrationNumber: { $regex: searchKeywords, $options: 'i' } },
            { 'departureAirport.code': { $regex: searchKeywords, $options: 'i' } },
            { 'departureAirport.name': { $regex: searchKeywords, $options: 'i' } },
            { 'arrivalAirport.code': { $regex: searchKeywords, $options: 'i' } },
            { 'arrivalAirport.name': { $regex: searchKeywords, $options: 'i' } },
            { 'crew.captain.name': { $regex: searchKeywords, $options: 'i' } },
            { flightStatus: { $regex: searchKeywords, $options: 'i' } },
            { flightType: { $regex: searchKeywords, $options: 'i' } }
          ]
        }).limit(10);
      }
      
      if (flightLogs.length > 0) {
        context.push(`\n--- FLIGHT LOGS (${flightLogs.length} found) ---`);
        flightLogs.forEach(fl => {
          context.push(`Flight: ${fl.flightNumber} | Aircraft: ${fl.registrationNumber} | Route: ${fl.departureAirport.code} → ${fl.arrivalAirport.code} | Captain: ${fl.crew.captain.name} | Status: ${fl.flightStatus} | Date: ${fl.flightDate.toISOString().split('T')[0]}`);
        });
        
        if (isFlightQuery) {
          context.push(`TOTAL FLIGHT LOGS: ${flightLogs.length}`);
        }
      }
    } catch (err) {
      console.error('Flight Logs search error:', err);
      // Continue - don't let this break other searches
    }

    // Search RFQs (enhanced with better keyword matching)
    try {
      let rfqs = [];
      
      // Enhanced search that includes common RFQ-related terms
      const rfqKeywords = ['rfq', 'request', 'quotation', 'quote', 'procurement', 'tender', 'bid'];
      const isRFQQuery = rfqKeywords.some(keyword => searchKeywords.includes(keyword)) || 
                        searchKeywords.includes('how many') || 
                        searchKeywords.includes('count') ||
                        searchKeywords.includes('list') ||
                        searchKeywords.includes('show');
      
      if (isRFQQuery) {
        // If it's a general RFQ query, get all RFQs for counting/listing
        rfqs = await RFQ.find({}).limit(20);
      } else {
        // Specific search within RFQ fields
        rfqs = await RFQ.find({
          $or: [
            { title: { $regex: searchKeywords, $options: 'i' } },
            { rfqType: { $regex: searchKeywords, $options: 'i' } },
            { category: { $regex: searchKeywords, $options: 'i' } },
            { 'requester.name': { $regex: searchKeywords, $options: 'i' } },
            { rfqStatus: { $regex: searchKeywords, $options: 'i' } },
            { rfqNumber: { $regex: searchKeywords, $options: 'i' } },
            { description: { $regex: searchKeywords, $options: 'i' } }
          ]
        }).limit(10);
      }
      
      if (rfqs.length > 0) {
        context.push(`\n--- RFQ DATA (${rfqs.length} found) ---`);
        rfqs.forEach(rfq => {
          context.push(`RFQ: ${rfq.rfqNumber} | Title: ${rfq.title} | Type: ${rfq.rfqType} | Status: ${rfq.rfqStatus} | Deadline: ${rfq.submissionDeadline.toISOString().split('T')[0]} | Requester: ${rfq.requester.name}`);
        });
        
        // Add summary for count queries
        if (isRFQQuery) {
          context.push(`TOTAL RFQS IN SYSTEM: ${rfqs.length}`);
        }
      }
    } catch (err) {
      console.error('RFQs search error:', err);
      // Continue - don't let this break other searches
    }

    // Search Knowledge Base (always search - this contains your topic/content data)
    try {
      console.log('🔍 Searching KnowledgeBase collection...');
      const knowledgeItems = await KnowledgeBase.find({
        $or: [
          { topic: { $regex: searchKeywords, $options: 'i' } },
          { content: { $regex: searchKeywords, $options: 'i' } },
          { category: { $regex: searchKeywords, $options: 'i' } },
          { tags: { $in: [new RegExp(searchKeywords, 'i')] } }
        ]
      }).limit(10);
      
      console.log(`📊 KnowledgeBase search results: ${knowledgeItems.length} items found`);
      
      if (knowledgeItems.length > 0) {
        context.push(`\n--- KNOWLEDGE BASE ---`);
        knowledgeItems.forEach(kb => {
          const contextEntry = `Topic: ${kb.topic} | Content: ${kb.content}`;
          context.push(contextEntry);
          console.log(`✅ Found: ${kb.topic}`);
        });
      }
    } catch (err) {
      console.error('Knowledge Base search error:', err);
    }

    // Alternative search for any other collections (optional fallback)
    try {
      const db = mongoose.connection.db;
      if (db) {
        const collections = await db.listCollections().toArray();
        
        // Try to find any collection that might contain topic/content data
        for (const collection of collections) {
          if (collection.name.toLowerCase().includes('knowledge') || 
              collection.name.toLowerCase().includes('faq') ||
              collection.name.toLowerCase().includes('content') ||
              collection.name.toLowerCase().includes('topic')) {
            
            const results = await db.collection(collection.name).find({
              $or: [
                { topic: { $regex: searchKeywords, $options: 'i' } },
                { content: { $regex: searchKeywords, $options: 'i' } }
              ]
            }).limit(5).toArray();
            
            if (results.length > 0) {
              context.push(`\n--- ${collection.name.toUpperCase()} ---`);
                             results.forEach((item) => {
                 if (item.topic && item.content) {
                   context.push(`Topic: ${item.topic} | Content: ${item.content}`);
                 }
               });
            }
          }
        }
      }
    } catch (err) {
      console.error('Alternative search error:', err);
      // Continue - don't let this break the main search
    }

    return context.length > 0 ? context.join('\n') : '';
  } catch (error) {
    console.error('Error searching aviation data:', error);
    return '';
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { message, conversationHistory, userId, conversationId } = await request.json();

    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    try {
      await connectToMongoDB();
      console.log('MongoDB connected successfully');
    } catch (dbError) {
      console.error('MongoDB connection failed:', dbError);
      // Continue without DB for testing
    }

    // Save user's message to database
    let userMessage;
    try {
      userMessage = new Message({
        content: message.trim(),
        role: 'user',
        timestamp: new Date(),
        conversationId: conversationId,
        userId: userId,
      });
      await userMessage.save();
      console.log('User message saved to DB');
    } catch (dbError) {
      console.error('Failed to save user message:', dbError);
      // Continue without saving for testing
    }

    // Search for relevant aviation data
    let aviationContext = '';
    try {
      aviationContext = await searchAviationData(message.trim());

      if (aviationContext && aviationContext.trim()) {
        console.log('✅ Database results found for query:', message.trim());
      } else {
        console.log('❌ No database results found for query:', message.trim());
      }
    } catch (searchError) {
      console.error('Aviation data search failed:', searchError);
      // Continue without aviation data
    }

    // 🚀 ENHANCED GEMINI API LOGIC
    
    // 1. Prepare conversation context with optimized system prompt
    let conversationText = GEMINI_CONFIG.systemPrompt + '\n\n';

    // 2. Add optimized conversation history (latest messages only)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const optimizedHistory = optimizeConversationHistory(conversationHistory);
      
      optimizedHistory.forEach((msg: ConversationMessage) => {
        if (msg.sender === 'user' || msg.sender === 'assistant') {
          const content = msg.text || msg.content || '';
          if (content.trim()) { // Only add non-empty messages
            conversationText += `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${content.trim()}\n\n`;
          }
        }
      });
    }

    // 3. Add database search results (use if available, supplement with general knowledge if needed)
    if (aviationContext && aviationContext.trim()) {
      conversationText += `DATABASE SEARCH RESULTS:\n${aviationContext}\n\n`;
      conversationText += `INSTRUCTIONS: You have relevant database information above. Use this as your primary source and mention "According to our database..." or "Based on our records...". If the user needs additional context beyond what's in the database, you can supplement with general knowledge while clearly indicating the source.\n\n`;
    } else {
      conversationText += `DATABASE SEARCH RESULTS: No specific data found in the database for this query.\n\n`;
      conversationText += `INSTRUCTIONS: No database results were found, so provide a helpful response using your general knowledge. Be conversational and helpful. If this is related to aviation or procurement, provide comprehensive information. For other topics, answer as a knowledgeable AI assistant would. You can mention "I don't have specific information about this in our database, but I can help with general information..."\n\n`;
    }

    // 4. Add the current user message
    conversationText += `User Query: ${message.trim()}\n\nDatabase Assistant Response:`;

    // 5. Estimate total tokens for monitoring
    const totalTokens = estimateTokens(conversationText);
    console.log(`📊 Estimated tokens: ${totalTokens}`);

    // 6. Call Google Gemini API with enhanced parameters
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_CONFIG.model,
      generationConfig: {
        maxOutputTokens: GEMINI_CONFIG.maxTokens,
        temperature: GEMINI_CONFIG.temperature,
      },
    });

    const result = await model.generateContent(conversationText);
    const response = await result.response;
    
    // 7. Extract assistant's response content with validation
    const assistantResponse = response.text()?.trim();
    
    if (!assistantResponse) {
      throw new Error('No response content received from Gemini');
    }

    console.log(`🔍 Gemini API response received successfully`);

    // Save AI response to database
    try {
      const aiMessage = new Message({
        content: assistantResponse,
        role: 'assistant',
        timestamp: new Date(),
        conversationId: conversationId,
        userId: userId,
      });
      await aiMessage.save();
      console.log('AI message saved to DB');
    } catch (dbError) {
      console.error('Failed to save AI message:', dbError);
      // Continue without saving for testing
    }

    // Return the assistant's response to frontend
    return NextResponse.json({
      message: assistantResponse,
      success: true,
      conversationId: conversationId || userMessage._id.toString(),
    });

  } catch (error) {
    console.error('Error in /api/chat:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');

    // Enhanced error handling for Gemini specific errors
    if (error instanceof Error) {
      // Gemini API key errors
      if (error.message.includes('API key') || error.message.includes('authentication') || error.message.includes('INVALID_ARGUMENT')) {
        return NextResponse.json(
          { error: 'Gemini API authentication error. Please check your API key.' },
          { status: 500 }
        );
      }

      // Gemini rate limit errors
      if (error.message.includes('rate limit') || error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
        return NextResponse.json(
          { error: 'Gemini API rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      // Gemini model/content errors
      if (error.message.includes('content_filter') || error.message.includes('safety') || error.message.includes('SAFETY')) {
        return NextResponse.json(
          { error: 'Message content violates Gemini safety policies. Please rephrase your message.' },
          { status: 400 }
        );
      }

      // MongoDB connection errors
      if (error.message.includes('MongoDB') || error.message.includes('connection')) {
        return NextResponse.json(
          { error: 'Database connection error. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
} 