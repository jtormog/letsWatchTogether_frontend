// app/api/tmdb/get-by-id/route.js
import { NextResponse } from 'next/server';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const LANGUAGE = 'es-ES';

async function getWorkById(id, type) {
  const res = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=${LANGUAGE}`);
  if (!res.ok) return null;
  const data = await res.json();
  return { ...data, tipo: type };
}

export async function POST(req) {
  try {
    const { works } = await req.json(); // expects: [{ id: 550, type: 'movie' }, ...]

    if (!Array.isArray(works)) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    const results = await Promise.all(
      works.map(({ id, type }) => getWorkById(id, type))
    );

    return NextResponse.json(results.filter(Boolean));
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
