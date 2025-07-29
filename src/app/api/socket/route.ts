import { NextRequest, NextResponse } from 'next/server';
import { getIO } from '@/app/lib/socketServer';

export async function GET(req: NextRequest) {
  try {
    // Initialize the WebSocket server
    const io = getIO();
    
    // Return a simple response indicating the WebSocket server is ready
    return NextResponse.json({ 
      message: 'WebSocket server is running',
      status: 'ready'
    });
  } catch (error) {
    console.error('WebSocket server error:', error);
    return NextResponse.json({ 
      error: 'WebSocket server failed to start' 
    }, { status: 500 });
  }
} 