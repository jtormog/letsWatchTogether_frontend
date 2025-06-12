import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/app/lib/auth';

export async function GET(req) {
  try {
    const { userId, error, status, token } = getUserIdFromRequest(req);
    
    if (error) {
      return NextResponse.json({ error }, { status });
    }
    
    try {
      // Llamada a Laravel API para obtener datos sociales
      const laravelResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/user/social`, {
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
        
        return NextResponse.json(
          { error: 'Failed to fetch social data' }, 
          { status: laravelResponse.status }
        );
      }

      const laravelData = await laravelResponse.json();
      
      // Also fetch accepted friends using the friend requests API
      let acceptedFriends = [];
      try {
        // Get accepted friend requests (both sent and received) to build friends list
        const [acceptedReceivedResponse, acceptedSentResponse] = await Promise.all([
          fetch(`${process.env.LARAVEL_API_URL}/api/user/friend-requests/received?status=accepted`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          }),
          fetch(`${process.env.LARAVEL_API_URL}/api/user/friend-requests/sent?status=accepted`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          })
        ]);

        if (acceptedReceivedResponse.ok && acceptedSentResponse.ok) {
          const acceptedReceived = await acceptedReceivedResponse.json();
          const acceptedSent = await acceptedSentResponse.json();
          
          // Transform received friend requests to friends
          const friendsFromReceived = (acceptedReceived.data || []).map(request => ({
            id: request.sender.id,
            name: request.sender.name,
            username: request.sender.username || `@${request.sender.name.toLowerCase().replace(/\s+/g, '')}`,
            email: request.sender.email,
            avatar: request.sender.avatar || `/api/placeholder?width=60&height=60&text=${request.sender.name.charAt(0)}`,
            friendship_status: 'accepted',
            friendship_id: request.friendship_id
          }));
          
          // Transform sent friend requests to friends
          const friendsFromSent = (acceptedSent.data || []).map(request => ({
            id: request.recipient.id,
            name: request.recipient.name,
            username: request.recipient.username || `@${request.recipient.name.toLowerCase().replace(/\s+/g, '')}`,
            email: request.recipient.email,
            avatar: request.recipient.avatar || `/api/placeholder?width=60&height=60&text=${request.recipient.name.charAt(0)}`,
            friendship_status: 'accepted',
            friendship_id: request.friendship_id
          }));
          
          // Combine and deduplicate friends
          acceptedFriends = [...friendsFromReceived, ...friendsFromSent];
          
          // Remove duplicates based on user id
          const uniqueFriends = acceptedFriends.reduce((acc, friend) => {
            if (!acc.find(f => f.id === friend.id)) {
              acc.push(friend);
            }
            return acc;
          }, []);
          
          acceptedFriends = uniqueFriends;
        }
      } catch (friendsError) {
        console.error('Error fetching accepted friends:', friendsError);
      }
      
      // Transformar datos de Laravel al formato esperado por el frontend
      const transformedData = {
        friends: acceptedFriends.length > 0 ? acceptedFriends : (laravelData.data && laravelData.data.friends ? laravelData.data.friends.map(friendData => ({
          id: friendData.friend.id,
          name: friendData.friend.name,
          username: friendData.friend.username || `${(friendData.friend.email || '').toLowerCase().replace(/\s+/g, '')}`,
          email: friendData.friend.email,
          avatar: friendData.friend.avatar || `/api/placeholder?width=60&height=60&text=${(friendData.friend.name || 'U').charAt(0)}`,
          friendship_status: 'accepted',
          friendship_id: friendData.friendship_id
        })) : []),
        friendRequests: laravelData.data && laravelData.data.friend_requests ? laravelData.data.friend_requests.map(request => ({
          id: request.id,
          name: request.name,
          username: request.username || `@${(request.name || '').toLowerCase().replace(/\s+/g, '')}`,
          email: request.email,
          avatar: request.avatar || `/api/placeholder?width=60&height=60&text=${(request.name || 'U').charAt(0)}`,
          friendship_id: request.friendship_id,
          created_at: request.created_at
        })) : [],
        pendingRequests: laravelData.data && laravelData.data.pending_requests ? laravelData.data.pending_requests.map(request => ({
          id: request.id,
          name: request.name,
          username: request.username || `@${(request.name || '').toLowerCase().replace(/\s+/g, '')}`,
          email: request.email,
          avatar: request.avatar || `/api/placeholder?width=60&height=60&text=${(request.name || 'U').charAt(0)}`,
          friendship_id: request.friendship_id,
          created_at: request.created_at
        })) : []
      };

      return NextResponse.json({
        success: true,
        data: transformedData
      });

    } catch (fetchError) {
      console.error('Laravel API error:', fetchError);
      
      // Fallback to mock data when Laravel is not available
      
      const mockTransformedData = {
        friends: [
          {
            id: 1,
            name: "Ana García",
            username: "@anagarcia",
            email: "ana@example.com",
            avatar: "/api/placeholder?width=60&height=60&text=AG",
            friendship_status: "accepted",
            friendship_id: 1
          },
          {
            id: 2,
            name: "Carlos López",
            username: "@carloslopez",
            email: "carlos@example.com",
            avatar: "/api/placeholder?width=60&height=60&text=CL",
            friendship_status: "accepted",
            friendship_id: 2
          },
          {
            id: 3,
            name: "María Rodríguez",
            username: "@mariarodriguez",
            email: "maria@example.com",
            avatar: "/placeholder.svg?height=60&width=60&text=MR",
            friendship_status: "accepted",
            friendship_id: 3
          }
        ],
        friendRequests: [],
        pendingRequests: []
      };

      return NextResponse.json({
        success: true,
        data: mockTransformedData
      });
    }

  } catch (error) {
    console.error('Social data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
