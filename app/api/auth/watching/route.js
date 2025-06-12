import { NextResponse } from 'next/server';

// Helper function to fetch media details from TMDB
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

export async function POST(request) {
  try {
    // Obtener el userId y limit del cuerpo de la petición primero
    const { userId, limit = 20 } = await request.json();
    
    // Obtener el token de autenticación de las cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      console.log('No authentication token found');
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400 }
      );
    }

    // Check if Laravel API URL is configured
    if (!process.env.LARAVEL_API_URL) {
      console.error('Laravel API URL not configured');
      return NextResponse.json(
        { error: 'Backend API not configured' }, 
        { status: 500 }
      );
    }

    try {
      // Llamada a Laravel API para obtener lo que el usuario está viendo
      const laravelResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/user/media/watching?limit=${limit}`, {
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
          { error: 'Failed to fetch watching content from Laravel API' }, 
          { status: laravelResponse.status }
        );
      }

      const data = await laravelResponse.json();
      console.log('Laravel API response:', data);
      
      // Verificar si hay datos en la respuesta
      if (!data || !data.success || !Array.isArray(data.data)) {
        console.log('No watching content found in Laravel response');
        return NextResponse.json([]);
      }
      
      const itemsArray = data.data;
      console.log('Processed items array:', itemsArray);
      
      if (itemsArray.length === 0) {
        console.log('No items found in Laravel response');
        return NextResponse.json([]);
      }
      
      // Obtener detalles de TMDB para cada item
      const tmdbPromises = itemsArray.slice(0, limit).map(async (item) => {
        try {
          if (!item || !item.tmdb_id || !item.type) {
            console.error('Invalid item structure:', item);
            return null;
          }

          const tmdbDetails = await fetchTMDBDetails(item.tmdb_id, item.type);
          
          // Calculate progress percentage from episode data only if episode exists
          let calculatedProgress = null;
          
          if (item.episode && item.type === 'tv') {
            console.log('Processing episode data for progress calculation:', {
              tmdb_id: item.tmdb_id,
              episode: item.episode,
              type: item.type
            });
            
            // Check if episode is in new format (e.g., "15/120")
            const progressMatch = item.episode.match(/^(\d+)\/(\d+)$/);
            if (progressMatch) {
              const currentEpisode = parseInt(progressMatch[1]);
              const totalEpisodes = parseInt(progressMatch[2]);
              calculatedProgress = Math.round((currentEpisode / totalEpisodes) * 100);
              
              console.log('Calculated progress from new format:', {
                currentEpisode,
                totalEpisodes,
                calculatedProgress
              });
            } else {
              // Try to parse legacy format (e.g., "S2E5") and fetch total episodes
              const seasonEpisodeMatch = item.episode.match(/S(\d+)E(\d+)/);
              if (seasonEpisodeMatch) {
                const seasonNumber = parseInt(seasonEpisodeMatch[1]);
                const episodeNumber = parseInt(seasonEpisodeMatch[2]);
                
                console.log('Processing legacy format:', {
                  seasonNumber,
                  episodeNumber
                });
                
                try {
                  // Fetch detailed TV show info to get total episodes
                  const tvDetailsResponse = await fetch(`https://api.themoviedb.org/3/tv/${item.tmdb_id}?api_key=${process.env.TMDB_API_KEY}&language=es-ES`);
                  if (tvDetailsResponse.ok) {
                    const tvDetails = await tvDetailsResponse.json();
                    
                    let currentEpisodeTotal = 0;
                    let totalEpisodes = 0;
                    
                    // Calculate total episodes across all seasons
                    for (const season of tvDetails.seasons || []) {
                      if (season.season_number === 0) continue; // Skip specials
                      
                      totalEpisodes += season.episode_count;
                      
                      if (season.season_number < seasonNumber) {
                        currentEpisodeTotal += season.episode_count;
                      } else if (season.season_number === seasonNumber) {
                        currentEpisodeTotal += episodeNumber;
                      }
                    }
                    
                    if (totalEpisodes > 0) {
                      calculatedProgress = Math.round((currentEpisodeTotal / totalEpisodes) * 100);
                      
                      console.log('Calculated progress from legacy format:', {
                        currentEpisodeTotal,
                        totalEpisodes,
                        calculatedProgress
                      });
                    }
                  }
                } catch (tvError) {
                  console.error('Error fetching TV details for progress calculation:', tvError);
                }
              }
            }
          }
          
          // Build the result object
          const result = {
            id: tmdbDetails.id,
            title: tmdbDetails.title || tmdbDetails.name,
            overview: tmdbDetails.overview,
            poster: tmdbDetails.poster_path ? `https://image.tmdb.org/t/p/w342${tmdbDetails.poster_path}` : null,
            type: item.type === 'movie' ? 'película' : 'serie',
            mediaType: item.type,
            year: tmdbDetails.release_date ? new Date(tmdbDetails.release_date).getFullYear().toString() : 
                  tmdbDetails.first_air_date ? new Date(tmdbDetails.first_air_date).getFullYear().toString() : "N/A",
            status: 'watching'
          };
          
          // Only include progress if we have episode data and calculated progress
          if (calculatedProgress !== null) {
            result.progress = calculatedProgress;
          }
          
          return result;
        } catch (error) {
          console.error(`Error fetching TMDB details for ${item.type} ${item.tmdb_id}:`, error);
          return null;
        }
      });

      const watchingItems = (await Promise.all(tmdbPromises)).filter(item => item !== null);
      console.log('Final watching items with TMDB details:', watchingItems);

      return NextResponse.json(watchingItems);

    } catch (fetchError) {
      console.error('Error fetching from Laravel API:', fetchError);
      return NextResponse.json(
        { error: 'Failed to connect to backend API' }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in watching endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
