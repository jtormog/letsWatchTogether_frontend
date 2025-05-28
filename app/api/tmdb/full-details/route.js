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
    const { tvId } = await req.json();

    if (!tvId) {
      return NextResponse.json({ error: 'Missing tvId' }, { status: 400 });
    }

    const show = await fetchFromTmdb(`/tv/${tvId}`);
    const credits = await fetchFromTmdb(`/tv/${tvId}/credits`);

    const cast = credits.cast.slice(0, 10).map(actor => ({
      name: actor.name,
      avatar: actor.profile_path
        ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
        : null,
    }));

    const seasonsList = await Promise.all(
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

    const result = {
      id: show.id.toString(),
      title: show.name,
      description: show.overview,
      backgroundImage: show.backdrop_path ? `https://image.tmdb.org/t/p/w780${show.backdrop_path}` : null,
      poster: show.poster_path ? `https://image.tmdb.org/t/p/w342${show.poster_path}` : null,
      year: show.first_air_date?.split('-')[0] || '',
      seasons: show.number_of_seasons,
      episodes: show.number_of_episodes,
      genres: show.genres.map(g => g.name),
      creator: show.created_by[0]?.name || '',
      cast,
      seasonsList,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener detalles' }, { status: 500 });
  }
}
