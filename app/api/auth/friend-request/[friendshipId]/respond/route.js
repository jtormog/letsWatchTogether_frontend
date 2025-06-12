import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/app/lib/auth';

export async function PATCH(req, { params }) {
  try {
    const { userId, error, status, token } = getUserIdFromRequest(req);
    
    if (error) {
      return NextResponse.json({ error }, { status });
    }
    
    const { friendshipId } = params;
    const { action } = await req.json();
    
    // Validate action parameter
    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "decline"' }, 
        { status: 400 }
      );
    }

    try {
      // Call Laravel API to respond to friend request
      const laravelResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/user/friend-request/${friendshipId}/respond`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      if (!laravelResponse.ok) {
        if (laravelResponse.status === 401) {
          return NextResponse.json(
            { error: 'Authentication expired' }, 
            { status: 401 }
          );
        }
        
        const errorData = await laravelResponse.json();
        return NextResponse.json(
          { error: errorData.message || 'Failed to respond to friend request' }, 
          { status: laravelResponse.status }
        );
      }

      const laravelData = await laravelResponse.json();

      return NextResponse.json({
        success: true,
        message: laravelData.message || `Friend request ${action}ed successfully`,
        data: laravelData.data
      });

    } catch (fetchError) {
      console.error('Laravel API error:', fetchError);
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Respond to friend request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
