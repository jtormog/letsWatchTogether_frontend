import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/app/lib/auth';

export async function POST(req) {
  try {
    const { userId, error, status, token } = getUserIdFromRequest(req);
    
    if (error) {
      return NextResponse.json({ error }, { status });
    }
    
    const { email, friendId } = await req.json();
    
    if (!email && !friendId) {
      return NextResponse.json(
        { error: 'Email or friend ID is required' }, 
        { status: 400 }
      );
    }

    try {
      // Llamada a Laravel API para enviar solicitud de amistad
      const requestBody = {};
      if (email) {
        requestBody.friend_email = email; // Laravel API expects 'friend_email'
      }
      if (friendId) {
        requestBody.friend_id = friendId;
      }

      const laravelResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/user/friend-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
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
          { error: errorData.message || 'Failed to send friend request' }, 
          { status: laravelResponse.status }
        );
      }

      const laravelData = await laravelResponse.json();

      return NextResponse.json({
        success: true,
        message: laravelData.message || 'Friend request sent successfully',
        data: laravelData
      });

    } catch (fetchError) {
      console.error('Laravel API error:', fetchError);
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Friend request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
