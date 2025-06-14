import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/app/lib/auth';

export async function GET(req) {
  try {
    const { userId, error, status, token } = getUserIdFromRequest(req);
    
    if (error) {
      return NextResponse.json({ error }, { status });
    }
    
    try {
      const response = await fetch(`${process.env.LARAVEL_API_URL}/api/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        const userData = await response.json();
        
        const transformedUser = {
          id: userData.user.id.toString(),
          name: userData.user.name,
          username: userData.user.email,
          email: userData.user.email,
          avatar: userData.user.avatar || `/api/placeholder?width=120&height=120&text=${userData.user.name.charAt(0)}`,
          preferences: {
            language: "es",
            notifications: true,
            autoplay: true
          },
          subscription: {
            platforms: [],
            plan: "basic"
          },
          stats: {
            seriesVistas: 0,
            peliculasVistas: 0,
            episodiosVistos: 0,
            amigos: 0
          }
        };

        return NextResponse.json({
          success: true,
          user: transformedUser
        });
      }
    } catch (apiError) {
    }

    let user = mockUsers[userId];
    
    if (!user) {
      user = {
        id: userId,
        name: "OAuth User",
        username: "@oauthuser" + userId,
        email: "oauth.user." + userId + "@example.com",
        avatar: "/api/placeholder?width=120&height=120&text=OU",
        preferences: {
          language: "es",
          notifications: true,
          autoplay: false
        },
        subscription: {
          platforms: [],
          plan: "basic"
        },
        stats: {
          seriesVistas: 0,
          peliculasVistas: 0,
          episodiosVistos: 0,
          amigos: 0
        }
      };
      
      mockUsers[userId] = user;
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
