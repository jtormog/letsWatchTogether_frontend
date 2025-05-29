import { NextResponse } from 'next/server';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const LANGUAGE = 'es-ES';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  const page = searchParams.get('page') || '1';
  const tab = searchParams.get('tab') || 'populares';

  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  try {
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=${LANGUAGE}&query=${encodeURIComponent(query)}&page=${page}`);

    if (!res.ok) {
      throw new Error('Failed to fetch search results');
    }

    const data = await res.json();

    let filteredResults = data.results
      .filter(item => item.media_type === 'tv' || item.media_type === 'movie')
      .map(item => ({
        id: item.id,
        title: item.title || item.name,
        overview: item.overview,
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null,
        mediaType: item.media_type,
        year: item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || null,
        popularity: item.popularity,
        voteAverage: item.vote_average,
        releaseDate: item.release_date || item.first_air_date,
      }));

    switch (tab) {
      case 'populares':
        filteredResults.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'recientes':
        filteredResults.sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0));
        break;
      case 'valoradas':
        filteredResults.sort((a, b) => b.voteAverage - a.voteAverage);
        break;
      case 'recomendadas':
        break;
      default:
        break;
    }

    return NextResponse.json({
      results: filteredResults,
      totalPages: data.total_pages,
      currentPage: parseInt(page),
      totalResults: data.total_results
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error during search' }, { status: 500 });
  }
}
