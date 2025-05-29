import { NextResponse } from 'next/server';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const LANGUAGE = 'es-ES';

async function fetchFromTmdb(path) {
  const res = await fetch(`${BASE_URL}${path}?api_key=${API_KEY}&language=${LANGUAGE}`);
  if (!res.ok) throw new Error(`TMDB error: ${path}`);
  return res.json();
}

export async function POST(req) {
  try {
    const { tvId, mediaType = 'tv' } = await req.json();

    console.log(`Fetching details for ${mediaType === 'movie' ? 'película' : 'serie'} with ID: ${tvId}`);

    if (!tvId) {
      return NextResponse.json({ error: 'Missing tvId' }, { status: 400 });
    }

    const show = await fetchFromTmdb(`/${mediaType}/${tvId}`);
    const credits = await fetchFromTmdb(`/${mediaType}/${tvId}/credits`);

    const cast = credits.cast.slice(0, 10).map(actor => ({
      name: actor.name,
      avatar: actor.profile_path
        ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
        : null,
    }));

    let creator = '';
    if (mediaType === 'tv') {
      creator = show.created_by[0]?.name || '';
    } else {
      const director = credits.crew?.find(person => person.job === 'Director');
      creator = director?.name || '';
    }

    let seasonsList = [];
    
    if (mediaType === 'tv' && show.seasons) {
      seasonsList = await Promise.all(
        show.seasons.map(async season => {
          const seasonData = await fetchFromTmdb(`/tv/${tvId}/season/${season.season_number}`);
          return {
            season: season.season_number,
            episodes: seasonData.episodes.length,
            episodesList: seasonData.episodes.map(ep => ({
              number: ep.episode_number,
              title: ep.name,
              duration: ep.runtime ? `${ep.runtime} min` : 'Desconocido',
              description: ep.overview || '',
            })),
          };
        })
      );
    }

    const result = {
      id: show.id.toString(),
      title: mediaType === 'movie' ? show.title : show.name,
      description: show.overview,
      backgroundImage: show.backdrop_path ? `https://image.tmdb.org/t/p/w780${show.backdrop_path}` : null,
      poster: show.poster_path ? `https://image.tmdb.org/t/p/w342${show.poster_path}` : null,
      year: mediaType === 'movie' 
        ? show.release_date?.split('-')[0] || ''
        : show.first_air_date?.split('-')[0] || '',
      seasons: mediaType === 'tv' ? show.number_of_seasons : 0,
      episodes: mediaType === 'tv' ? show.number_of_episodes : 0,
      genres: show.genres.map(g => g.name),
      creator: mediaType === 'tv' ? (show.created_by[0]?.name || '') : (show.director || ''),
      cast,
      seasonsList,
      runtime: mediaType === 'movie' ? show.runtime : null,
      mediaType,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener detalles' }, { status: 500 });
  }
}
