import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/app/lib/auth';

const mockLiked = [
  { id: 278, type: "movie" },
  { id: 1396, type: "tv" },
  { id: 424, type: "movie" },
  { id: 1398, type: "tv" },
  { id: 155, type: "movie" },
  { id: 46952, type: "tv" }
];

function getLikedForUser(userId) {
  const userMod = parseInt(userId) % 4;
  
  switch (userMod) {
    case 0:
      return mockLiked.filter(item => 
        [278, 424, 155].includes(item.id)
      );
    case 1:
      return mockLiked.filter(item => 
        [1396, 1398, 46952].includes(item.id)
      );
    case 2:
      return mockLiked.filter(item => 
        [278, 1396, 155, 1398].includes(item.id)
      );
    case 3:
      return mockLiked;
    default:
      return mockLiked.slice(0, 3);
  }
}

export async function GET(req) {
  try {
    const { userId, error, status, token } = getUserIdFromRequest(req);
    
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    // Intentar obtener los datos desde Laravel API
    if (process.env.LARAVEL_API_URL && token) {
      try {
        const response = await fetch(`${process.env.LARAVEL_API_URL}/api/user/media/liked`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.success && Array.isArray(data.data)) {
            const likedWorks = data.data.map(item => ({
              id: item.tmdb_id,
              type: item.type === 'movie' ? 'movie' : 'tv'
            }));
            
            return NextResponse.json(likedWorks);
          }
        }
      } catch (apiError) {
      }
    }

    await new Promise(resolve => setTimeout(resolve, 90));
    const liked = getLikedForUser(userId);
    
    return NextResponse.json(liked);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch liked content' }, 
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' }, 
        { status: 400 }
      );
    }

    await new Promise(resolve => setTimeout(resolve, 90));

    const liked = getLikedForUser(userId);
    
    return NextResponse.json(liked);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch liked content' }, 
      { status: 500 }
    );
  }
}
