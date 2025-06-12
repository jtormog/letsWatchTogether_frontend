import { NextResponse } from 'next/server';
import { ErrorMessages, createErrorResponse } from '../../../../utils/errorMessages.js';

// Mock friends recommendations data for fallback when external API is unavailable
const mockFriendsRecommendations = [
  {
    id: 550,
    title: "Fight Club",
    overview: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
    poster: "https://image.tmdb.org/t/p/w342/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    type: "movie",
    year: "1999",
    friendName: "Carlos M.",
    friendAvatar: "/api/placeholder?width=100&height=100&text=CM",
    addedAt: "2024-01-15"
  },
  {
    id: 82856,
    title: "The Mandalorian",
    overview: "After the fall of the Galactic Empire, lawlessness has spread throughout the galaxy.",
    poster: "https://image.tmdb.org/t/p/w342/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
    type: "tv",
    year: "2019",
    friendName: "Ana L.",
    friendAvatar: "/api/placeholder?width=100&height=100&text=AL",
    addedAt: "2024-01-10"
  },
  {
    id: 19404,
    title: "Dilwale Dulhania Le Jayenge",
    overview: "Raj is a rich, carefree, happy-go-lucky second generation NRI. Simran is the daughter of Chaudhary Baldev Singh.",
    poster: "https://image.tmdb.org/t/p/w342/2CAL2433ZeIihfX1Hb2139CX0pW.jpg",
    type: "movie",
    year: "1995",
    friendName: "Miguel S.",
    friendAvatar: "/api/placeholder?width=100&height=100&text=MS",
    addedAt: "2024-01-08"
  }
];

function getFriendsRecommendationsForUser(userId) {
  const userMod = parseInt(userId) % 3;
  
  switch (userMod) {
    case 0:
      return [mockFriendsRecommendations[0]];
    case 1:
      return mockFriendsRecommendations.slice(0, 2);
    case 2:
      return mockFriendsRecommendations;
    default:
      return [mockFriendsRecommendations[1]];
  }
}

export async function POST(request) {
  try {
    // Obtener el token de autenticación de las cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      console.log('No authentication token found, providing limited recommendations');
      return NextResponse.json(
        createErrorResponse({ message: 'No authentication token found' }, 401), 
        { status: 401 }
      );
    }

    // Obtener el userId del cuerpo de la petición
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        createErrorResponse({ message: 'User ID is required' }, 400), 
        { status: 400 }
      );
    }

    console.log(`Fetching friends recommendations for user ${userId}`);

    // Check if Laravel API URL is configured
    if (!process.env.LARAVEL_API_URL) {
      console.log('Laravel API URL not configured, using mock data');
      const mockData = getFriendsRecommendationsForUser(userId);
      return NextResponse.json(mockData);
    }

    try {
      console.log(`Attempting to fetch from Laravel API: ${process.env.LARAVEL_API_URL}/api/user/friends/want-to-see`);
      
      // Llamada a Laravel API para obtener recomendaciones de amigos
      const laravelResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/user/friends/want-to-see`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });

      if (!laravelResponse.ok) {
        const errorText = await laravelResponse.text();
        console.error('Laravel API error:', laravelResponse.status, errorText);
        console.log('Falling back to mock data due to API error');
        
        if (laravelResponse.status === 401) {
          return NextResponse.json(
            createErrorResponse({ message: 'Authentication expired' }, 401), 
            { status: 401 }
          );
        }
        
        // Fall back to mock data instead of returning error
        const mockData = getFriendsRecommendationsForUser(userId);
        return NextResponse.json(mockData);
      }

      const data = await laravelResponse.json();
      console.log('Laravel API response:', data);
      
      // La nueva API de Laravel retorna un array de items con tmdb_id, type y users_who_want_to_see
      let itemsArray = [];
      
      if (data && data.success && Array.isArray(data.data)) {
        // Convertir el formato de la nueva API a formato esperado para TMDB
        itemsArray = data.data.map(item => ({
          id: item.tmdb_id,
          type: item.type,
          friendName: item.users_who_want_to_see[0]?.user_name || 'Amigo',
          friendAvatar: null, // No viene en la respuesta actual
          addedAt: item.users_who_want_to_see[0]?.added_at
        }));
      }
      // Fallback para otros formatos de respuesta
      else if (Array.isArray(data)) {
        itemsArray = data.map(item => ({
          id: item.tmdb_id || item.id,
          type: item.type,
          friendName: item.users_who_want_to_see?.[0]?.user_name || item.friendName || 'Amigo',
          friendAvatar: item.friendAvatar || null,
          addedAt: item.users_who_want_to_see?.[0]?.added_at || item.addedAt
        }));
      }
      
      console.log('Processed items array:', itemsArray);
      
      if (!Array.isArray(itemsArray) || itemsArray.length === 0) {
        console.log('No items found in Laravel response');
        return NextResponse.json([]);
      }
      
      // Obtener detalles de TMDB para cada item directamente (evitar fetch interno)
      try {
        console.log('Fetching TMDB details for items:', itemsArray);
        
        const TMDB_API_KEY = process.env.TMDB_API_KEY;
        const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
        const LANGUAGE = 'es-ES';
        
        if (!TMDB_API_KEY) {
          console.log('TMDB API key not configured, falling back to mock data');
          const mockData = getFriendsRecommendationsForUser(userId);
          return NextResponse.json(mockData);
        }
        
        const fetches = itemsArray.map(async (item) => {
          console.log('Processing item:', item);
          
          // Validar que el item tenga la estructura correcta
          if (!item || typeof item !== 'object') {
            console.error('Invalid item structure:', item);
            return null;
          }
          
          const { type, id, friendName, friendAvatar, addedAt } = item;
          
          if (!['tv', 'movie'].includes(type) || !id) {
            console.error('Invalid item type or ID:', { type, id });
            return null;
          }

          try {
            const res = await fetch(`${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=${LANGUAGE}`, {
              signal: AbortSignal.timeout(3000)
            });
            
            if (!res.ok) {
              console.error(`TMDB API error for ${type}/${id}:`, res.status);
              return null;
            }

            const data = await res.json();
            console.log(`TMDB data for ${type}/${id}:`, data);

            return {
              id: data.id,
              title: data.title || data.name,
              overview: data.overview,
              poster: data.poster_path ? `https://image.tmdb.org/t/p/w342${data.poster_path}` : null,
              mediaType: type,
              year: data.release_date?.split('-')[0] || data.first_air_date?.split('-')[0] || null,
              friendName,
              friendAvatar,
              addedAt
            };
          } catch (fetchError) {
            console.error(`Error fetching ${type}/${id} from TMDB:`, fetchError);
            return null;
          }
        });

        const tmdbResults = await Promise.all(fetches);
        const tmdbData = tmdbResults.filter(Boolean);
        
        console.log('TMDB API results:', tmdbData);
        
        // If no TMDB data was fetched successfully, fall back to mock
        if (tmdbData.length === 0) {
          console.log('No valid TMDB data returned, falling back to mock data');
          const mockData = getFriendsRecommendationsForUser(userId);
          return NextResponse.json(mockData);
        }
        
        // Transformar datos de TMDB al formato esperado por el frontend
        const transformedFriendsRecommendations = tmdbData.map(item => ({
          id: item.id,
          title: item.title,
          overview: item.overview,
          poster: item.poster,
          type: item.mediaType,
          year: item.year || "N/A",
          friendName: item.friendName,
          friendAvatar: item.friendAvatar,
          addedAt: item.addedAt
        }));
        
        console.log('Transformed recommendations:', transformedFriendsRecommendations);
        return NextResponse.json(transformedFriendsRecommendations);
        
      } catch (tmdbError) {
        console.error('Error fetching TMDB details:', tmdbError);
        console.log('Falling back to mock data due to TMDB error');
        const mockData = getFriendsRecommendationsForUser(userId);
        return NextResponse.json(mockData);
      }

    } catch (fetchError) {
      console.error('Error fetching from Laravel API:', fetchError.message);
      console.log('Falling back to mock data due to fetch error');
      const mockData = getFriendsRecommendationsForUser(userId);
      return NextResponse.json(mockData);
    }

  } catch (error) {
    console.error('Error in friends-want-to-see endpoint:', error);
    return NextResponse.json(
      createErrorResponse(error), 
      { status: 500 }
    );
  }
}
