import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/app/lib/auth';

export async function GET(req) {
  try {
    const { userId, error, status, token } = getUserIdFromRequest(req);
    
    if (error) {
      return NextResponse.json({ error }, { status });
    }
    
    // Get status parameter from URL search params
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status') || 'pending';
    
    // Validate status parameter
    const validStatuses = ['pending', 'accepted', 'declined'];
    if (!validStatuses.includes(statusParam)) {
      return NextResponse.json(
        { 
          error: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}` 
        }, 
        { status: 400 }
      );
    }

    try {
      // Call Laravel API to get received friend requests
      const laravelResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/user/friend-requests/received/${statusParam}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
          { error: errorData.message || 'Failed to fetch received friend requests' }, 
          { status: laravelResponse.status }
        );
      }

      const laravelData = await laravelResponse.json();
      
      // Transform Laravel data to frontend format
      const transformedRequests = laravelData.data ? laravelData.data.map(request => ({
        friendship_id: request.friendship_id,
        status: request.status,
        created_at: request.created_at,
        updated_at: request.updated_at,
        accepted_at: request.accepted_at,
        sender: {
          id: request.sender_id,
          name: request.sender_name,
          email: request.sender_email,
          avatar: request.sender_avatar || `https://via.placeholder.com/60x60/0de383/000000?text=${request.sender_name.charAt(0)}`,
          username: `@${request.sender_name.toLowerCase().replace(/\s+/g, '')}`
        }
      })) : [];

      return NextResponse.json({
        success: true,
        message: laravelData.message || `Received friend requests with status '${statusParam}' retrieved successfully`,
        data: transformedRequests
      });

    } catch (fetchError) {
      console.error('Laravel API error:', fetchError);
      
      // Fallback to mock data when Laravel is not available
      console.log('Using mock received friend requests as fallback');
      
      let mockRequests = [];
      
      if (statusParam === 'pending') {
        mockRequests = [
          {
            friendship_id: 101,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sender: {
              id: 4,
              name: "Pedro Martín",
              email: "pedro@example.com",
              avatar: "https://via.placeholder.com/60x60/0de383/000000?text=PM",
              username: "@pedromartin"
            }
          },
          {
            friendship_id: 102,
            status: 'pending',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString(),
            sender: {
              id: 5,
              name: "Laura Fernández",
              email: "laura@example.com",
              avatar: "https://via.placeholder.com/60x60/0de383/000000?text=LF",
              username: "@laurafernandez"
            }
          }
        ];
      }

      return NextResponse.json({
        success: true,
        message: `Mock received friend requests with status '${statusParam}' retrieved successfully`,
        data: mockRequests
      });
    }

  } catch (error) {
    console.error('Received friend requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
