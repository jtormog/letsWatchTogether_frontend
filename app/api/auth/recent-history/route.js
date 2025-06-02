import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/app/lib/auth';

const mockRecentHistory = {
  "1": [
    {
      id: 1,
      show: "Breaking Bad",
      episode: "S5E14 - Ozymandias",
      watchedAgo: "hace 1 día",
    },
    {
      id: 2,
      show: "Better Call Saul",
      episode: "S6E13 - Saul Gone",
      watchedAgo: "hace 2 días",
    },
    {
      id: 3,
      show: "The Mandalorian",
      episode: "S3E8 - The Rescue",
      watchedAgo: "hace 3 días",
    },
  ],
  "2": [
    {
      id: 1,
      show: "House of the Dragon",
      episode: "S1E10 - The Black Queen",
      watchedAgo: "hace 30 minutos",
    },
    {
      id: 2,
      show: "The Last of Us",
      episode: "S1E09 - Look for the Light",
      watchedAgo: "hace 1 día",
    },
    {
      id: 3,
      show: "Succession",
      episode: "S4E10 - With Open Eyes",
      watchedAgo: "hace 2 días",
    },
  ]
};

export async function GET(req) {
  try {
    const { userId, error, status } = getUserIdFromRequest(req);
    
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    await new Promise(resolve => setTimeout(resolve, 150));

    const history = mockRecentHistory[userId] || [];

    return NextResponse.json({
      success: true,
      history
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
