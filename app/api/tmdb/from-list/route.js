import { NextResponse } from 'next/server';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const LANGUAGE = 'es-ES';

export async function POST(req) {
  try {
    const items = await req.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Request body must be an array' }, { status: 400 });
    }

    if (items.length === 0) {
      return NextResponse.json([]);
    }
    
    const fetches = items.map(async (item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      
      const { type, id } = item;
      
      if (!['tv', 'movie'].includes(type) || !id) {
        return null;
      }

      try {
        const res = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=${LANGUAGE}`);
        
        if (!res.ok) {
          return null;
        }

        const data = await res.json();

        return {
          id: data.id,
          title: data.title || data.name,
          overview: data.overview,
          poster: data.poster_path ? `https://image.tmdb.org/t/p/w342${data.poster_path}` : null,
          mediaType: type,
          year: data.release_date?.split('-')[0] || data.first_air_date?.split('-')[0] || null,
        };
      } catch (fetchError) {
        return null;
      }
    });

    const results = await Promise.all(fetches);
    const filtered = results.filter(Boolean);
    
    return NextResponse.json(filtered);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}
