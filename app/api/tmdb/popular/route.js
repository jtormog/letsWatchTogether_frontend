import { NextResponse } from 'next/server';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const LANGUAGE = 'es-ES';

async function fetchPopular(type) {
  const url = `${BASE_URL}/${type}/popular?api_key=${API_KEY}&language=${LANGUAGE}&page=1`;
  const res = await fetch(url);
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText} - ${data.status_message || 'Unknown error'}`);
  }
  
  return data.results || [];
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 5;

    const [movies, series] = await Promise.all([
      fetchPopular('movie'),
      fetchPopular('tv'),
    ]);

    const allItems = [
      ...movies.map(item => ({ ...item, tipo: 'película' })),
      ...series.map(item => ({ ...item, tipo: 'serie' })),
    ];

    const result = allItems
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching popular content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular content' },
      { status: 500 }
    );
  }
}
