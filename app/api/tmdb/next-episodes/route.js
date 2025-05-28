import { NextResponse } from 'next/server';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const LANGUAGE = 'es-ES';

async function getFutureEpisodes(tvId) {
  const showRes = await fetch(`${BASE_URL}/tv/${tvId}?api_key=${API_KEY}&language=${LANGUAGE}`);
  if (!showRes.ok) return null;
  const showData = await showRes.json();

  const seasons = showData.seasons || [];
  const today = new Date();

  const allEpisodes = [];

  for (const season of seasons) {
    const res = await fetch(`${BASE_URL}/tv/${tvId}/season/${season.season_number}?api_key=${API_KEY}&language=${LANGUAGE}`);
    if (!res.ok) continue;
    const data = await res.json();

    const futureEps = (data.episodes || []).filter(ep => {
      return ep.air_date && new Date(ep.air_date) > today;
    });

    allEpisodes.push(...futureEps.map(ep => ({
      serieId: tvId,
      serieName: showData.name,
      airDate: ep.air_date,
      season: ep.season_number,
      episode: ep.episode_number,
      episodeTitle: ep.name,
    })));
  }

  return allEpisodes;
}

export async function POST(req) {
  try {
    const { tvIds } = await req.json();

    if (!Array.isArray(tvIds)) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    const resultsPerSerie = await Promise.all(tvIds.map(getFutureEpisodes));
    const allEpisodes = resultsPerSerie.flat().filter(Boolean);

    return NextResponse.json(allEpisodes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
