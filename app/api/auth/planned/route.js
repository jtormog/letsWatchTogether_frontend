import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Obtener el token de autenticación de las cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Obtener el userId del cuerpo de la petición
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400 }
      );
    }

    try {
      // Llamada a Laravel API para obtener lo que el usuario planea ver
      const laravelResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/user/media/planned`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!laravelResponse.ok) {
        const errorText = await laravelResponse.text();
        console.error('Laravel API error:', laravelResponse.status, errorText);
        
        if (laravelResponse.status === 401) {
          return NextResponse.json(
            { error: 'Authentication expired' }, 
            { status: 401 }
          );
        }
        
        return NextResponse.json(
          { error: 'Failed to fetch planned content from Laravel API' }, 
          { status: laravelResponse.status }
        );
      }

      const data = await laravelResponse.json();
      console.log('Laravel API response:', data);
      
      // Verificar si hay datos en la respuesta
      if (!data || !data.success || !Array.isArray(data.data)) {
        console.log('No planned content found in Laravel response');
        return NextResponse.json([]);
      }
      
      const itemsArray = data.data;
      console.log('Processed items array:', itemsArray);
      
      if (itemsArray.length === 0) {
        console.log('No items found in Laravel response');
        return NextResponse.json([]);
      }
      
      // Obtener detalles de TMDB para cada item
      try {
        console.log('Fetching TMDB details for items:', itemsArray);
        
        const TMDB_API_KEY = process.env.TMDB_API_KEY;
        const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
        const LANGUAGE = 'es-ES';
        
        const fetches = itemsArray.map(async (item) => {
          console.log('Processing item:', item);
          
          // Validar que el item tenga la estructura correcta
          if (!item || typeof item !== 'object') {
            console.error('Invalid item structure:', item);
            return null;
          }
          
          const { type, tmdb_id } = item;
          
          if (!['tv', 'movie'].includes(type) || !tmdb_id) {
            console.error('Invalid item type or tmdb_id:', { type, tmdb_id });
            return null;
          }

          try {
            const res = await fetch(`${TMDB_BASE_URL}/${type}/${tmdb_id}?api_key=${TMDB_API_KEY}&language=${LANGUAGE}`);
            
            if (!res.ok) {
              console.error(`TMDB API error for ${type}/${tmdb_id}:`, res.status);
              return null;
            }

            const tmdbData = await res.json();
            console.log(`TMDB data for ${type}/${tmdb_id}:`, tmdbData);

            return {
              id: tmdbData.id,
              title: tmdbData.title || tmdbData.name,
              overview: tmdbData.overview,
              poster: tmdbData.poster_path ? `https://image.tmdb.org/t/p/w342${tmdbData.poster_path}` : null,
              mediaType: type,
              year: tmdbData.release_date?.split('-')[0] || tmdbData.first_air_date?.split('-')[0] || null,
              type: type === 'movie' ? 'película' : 'serie',
              voteAverage: tmdbData.vote_average,
              popularity: tmdbData.popularity,
              releaseDate: tmdbData.release_date || tmdbData.first_air_date,
              // Agregar información específica para contenido planeado
              status: 'planned',
              genres: tmdbData.genres?.map(g => g.name) || []
            };
          } catch (fetchError) {
            console.error(`Error fetching ${type}/${tmdb_id} from TMDB:`, fetchError);
            return null;
          }
        });

        const tmdbResults = await Promise.all(fetches);
        const tmdbData = tmdbResults.filter(Boolean);
        
        console.log('TMDB API results:', tmdbData);
        
        return NextResponse.json(tmdbData);
        
      } catch (tmdbError) {
        console.error('Error fetching TMDB details:', tmdbError);
        return NextResponse.json(
          { error: 'Failed to process movie/TV details' }, 
          { status: 500 }
        );
      }

    } catch (fetchError) {
      console.error('Error fetching from Laravel API:', fetchError);
      return NextResponse.json(
        { error: 'Failed to connect to Laravel API' }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in planned endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
