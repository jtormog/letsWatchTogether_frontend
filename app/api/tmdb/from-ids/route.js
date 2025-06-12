import { NextResponse } from 'next/server';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const LANGUAGE = 'es-ES';

export async function POST(req) {
  const { ids } = await req.json();

  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: 'ids must be an array' }, { status: 400 });
  }

  try {
    const fetchDetails = async (id) => {
      // Intentar primero como película
      try {
        const movieRes = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=${LANGUAGE}`);
        if (movieRes.ok) {
          const movieData = await movieRes.json();
          return {
            id: movieData.id,
            title: movieData.title,
            overview: movieData.overview,
            poster: movieData.poster_path ? `https://image.tmdb.org/t/p/w342${movieData.poster_path}` : null,
            mediaType: 'movie',
            type: 'película',
            year: movieData.release_date?.split('-')[0] || null,
          };
        }
      } catch (error) {
        console.log(`Error fetching movie ${id}:`, error);
      }

      // Si no es película, intentar como serie
      try {
        const tvRes = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=${LANGUAGE}`);
        if (tvRes.ok) {
          const tvData = await tvRes.json();
          return {
            id: tvData.id,
            title: tvData.name,
            overview: tvData.overview,
            poster: tvData.poster_path ? `https://image.tmdb.org/t/p/w342${tvData.poster_path}` : null,
            mediaType: 'tv',
            type: 'serie',
            year: tvData.first_air_date?.split('-')[0] || null,
          };
        }
      } catch (error) {
        console.log(`Error fetching TV show ${id}:`, error);
      }

      return null; // No se encontró ni como película ni como serie
    };

    const results = await Promise.all(ids.map(fetchDetails));
    const filtered = results.filter(Boolean);

    return NextResponse.json(filtered);
  } catch (err) {
    console.error('Error in from-ids endpoint:', err);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}
