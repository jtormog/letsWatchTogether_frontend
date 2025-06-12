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
      // Call Laravel API to get sent friend requests
      const laravelResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/user/friend-requests/sent/${statusParam}`, {
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
          { error: errorData.message || 'Failed to fetch sent friend requests' }, 
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
        recipient: {
          id: request.recipient_id,
          name: request.recipient_name,
          email: request.recipient_email,
          avatar: request.recipient_avatar || `https://via.placeholder.com/60x60/0de383/000000?text=${request.recipient_name.charAt(0)}`,
          username: `${request.recipient_email.toLowerCase().replace(/\s+/g, '')}`
        }
      })) : [];

      return NextResponse.json({
        success: true,
        message: laravelData.message || `Sent friend requests with status '${statusParam}' retrieved successfully`,
        data: transformedRequests
      });

    } catch (fetchError) {
      console.error('Laravel API error:', fetchError);
      
      // Fallback to mock data when Laravel is not available
      console.log('Using mock sent friend requests as fallback');
      
      let mockRequests = [];
      
      if (statusParam === 'pending') {
        mockRequests = [
          {
            friendship_id: 201,
            status: 'pending',
            created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            updated_at: new Date(Date.now() - 172800000).toISOString(),
            recipient: {
              id: 6,
              name: "Sofia Morales",
              email: "sofia@example.com",
              avatar: "https://via.placeholder.com/60x60/0de383/000000?text=SM",
              username: "@sofiamorales"
            }
          }
        ];
      }

      return NextResponse.json({
        success: true,
        message: `Mock sent friend requests with status '${statusParam}' retrieved successfully`,
        data: mockRequests
      });
    }

  } catch (error) {
    console.error('Sent friend requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
