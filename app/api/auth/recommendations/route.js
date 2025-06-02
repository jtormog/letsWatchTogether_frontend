import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else {
      const cookies = req.cookies.get('auth-token');
      token = cookies?.value;
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    try {
      // Llamada a Laravel API para obtener recomendaciones de amigos
      const laravelResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/user/friends/recommendations`, {
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
          { error: 'Failed to fetch recommendations' }, 
          { status: laravelResponse.status }
        );
      }

      const laravelData = await laravelResponse.json();
      
      // Transformar datos de Laravel al formato esperado por el frontend
      const transformedRecommendations = laravelData.map(item => ({
        id: item.id,
        title: item.title || item.name,
        overview: item.overview || item.description,
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null,
        mediaType: item.media_type || item.type,
        year: item.release_date ? new Date(item.release_date).getFullYear().toString() : 
              item.first_air_date ? new Date(item.first_air_date).getFullYear().toString() : "N/A"
      }));

      return NextResponse.json(transformedRecommendations);

    } catch (fetchError) {
      console.error('Laravel API error:', fetchError);
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
