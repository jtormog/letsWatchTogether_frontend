import { NextResponse } from 'next/server';
import { ErrorMessages, createErrorResponse } from '../../../../utils/errorMessages.js';

async function fetchTMDBDetails(tmdbId, mediaType) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error('TMDB API key not configured');
  }

  const endpoint = mediaType === 'movie' 
    ? `https://api.themoviedb.org/3/movie/${tmdbId}`
    : `https://api.themoviedb.org/3/tv/${tmdbId}`;

  const response = await fetch(`${endpoint}?api_key=${apiKey}&language=es-ES`);
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return await response.json();
}

export async function POST(req) {
  try {
    // Get userId and limit from request body first
    const { userId, limit = 20 } = await req.json();
    
    const authHeader = req.headers.get('authorization');
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else {
      const cookies = req.cookies.get('auth-token');
      token = cookies?.value;
    }

    if (!token) {
      console.log('No authentication token found');
      return NextResponse.json(
        createErrorResponse({ message: 'Authentication required' }, 401), 
        { status: 401 }
      );
    }

    console.log(`Fetching recommendations for user ${userId} with limit ${limit}`);

    // Check if Laravel API URL is configured
    if (!process.env.LARAVEL_API_URL) {
      console.error('Laravel API URL not configured');
      return NextResponse.json(
        createErrorResponse({ message: 'Backend API not configured' }, 500), 
        { status: 500 }
      );
    }

    try {
      console.log(`Attempting to fetch from Laravel API: ${process.env.LARAVEL_API_URL}/api/user/friends/recommendations`);
      
      // Llamada a Laravel API para obtener recomendaciones de amigos
      const laravelResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/user/friends/recommendations?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000)
      });

      if (!laravelResponse.ok) {
        console.log(`Laravel API responded with status ${laravelResponse.status}`);
        
        if (laravelResponse.status === 401) {
          return NextResponse.json(
            createErrorResponse({ status: 401 }), 
            { status: 401 }
          );
        }
        
        return NextResponse.json(
          createErrorResponse({ message: 'Failed to fetch recommendations from backend' }, laravelResponse.status), 
          { status: laravelResponse.status }
        );
      }

      const laravelData = await laravelResponse.json();
      console.log('Laravel API response:', laravelData);
      
      // Handle Laravel response structure: { success: true, message: '...', data: {...} }
      if (!laravelData.success || !laravelData.data) {
        console.log('Laravel API returned unsuccessful response or no data');
        return NextResponse.json([]);
      }

      const recommendationsData = laravelData.data;
      console.log('Recommendations data from Laravel:', recommendationsData);

      // Convert the data object to an array of {tmdb_id, type} pairs
      const mediaItems = [];
      for (const [type, tmdbId] of Object.entries(recommendationsData)) {
        if (tmdbId) {
          mediaItems.push({ tmdb_id: tmdbId, type: type });
        }
      }

      console.log('Media items to fetch from TMDB:', mediaItems);

      if (mediaItems.length === 0) {
        console.log('No recommendations found');
        return NextResponse.json([]);
      }

      // Fetch details from TMDB for each recommendation
      const tmdbPromises = mediaItems.slice(0, limit).map(async (item) => {
        try {
          const tmdbDetails = await fetchTMDBDetails(item.tmdb_id, item.type);
          return {
            id: tmdbDetails.id,
            title: tmdbDetails.title || tmdbDetails.name,
            overview: tmdbDetails.overview,
            poster: tmdbDetails.poster_path ? `https://image.tmdb.org/t/p/w342${tmdbDetails.poster_path}` : null,
            mediaType: item.type,
            year: tmdbDetails.release_date ? new Date(tmdbDetails.release_date).getFullYear().toString() : 
                  tmdbDetails.first_air_date ? new Date(tmdbDetails.first_air_date).getFullYear().toString() : "N/A"
          };
        } catch (error) {
          console.error(`Error fetching TMDB details for ${item.type} ${item.tmdb_id}:`, error);
          return null; // Skip this item if TMDB fetch fails
        }
      });

      const recommendations = (await Promise.all(tmdbPromises)).filter(item => item !== null);
      console.log('Final recommendations with TMDB details:', recommendations);

      return NextResponse.json(recommendations);

    } catch (fetchError) {
      console.error('Laravel API fetch error:', fetchError.message);
      return NextResponse.json(
        createErrorResponse({ message: 'Failed to connect to backend API' }, 500), 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Recommendations endpoint error:', error);
    return NextResponse.json(
      createErrorResponse(error), 
      { status: 500 }
    );
  }
}
