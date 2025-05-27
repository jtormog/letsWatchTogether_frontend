import { NextResponse } from 'next/server';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const LANGUAGE = 'es-ES';

async function fetchFromTMDB(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY);
  url.searchParams.append('language', LANGUAGE);
  
  // Add additional parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });

  const res = await fetch(url.toString());
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(`TMDB API request failed: ${res.status} ${res.statusText} - ${data.status_message || 'Unknown error'}`);
  }
  
  return data;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = searchParams.get('page') || '1';
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const data = await fetchFromTMDB('/search/multi', {
      query,
      page
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error searching TMDB:', error);
    return NextResponse.json(
      { error: 'Failed to search content' },
      { status: 500 }
    );
  }
}
