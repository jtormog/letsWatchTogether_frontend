import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/app/lib/auth';

const mockUserStats = {
  "1": {
    general: {
      seriesVistas: 30,
      peliculasVistas: 45,
      episodiosVistos: 156,
      amigos: 18,
      horasVistas: 127
    },
    detailed: {
      seriesCompletadas: 12,
      seriesEnProgreso: 18,
      episodiosEstaTemporada: 24,
      recomendacionesRecibidas: 84,
      recomendacionesHechas: 23,
      generosFavoritos: ["Drama", "Thriller", "Sci-Fi"],
      plataformaMasUsada: "Netflix"
    }
  },
  "2": {
    general: {
      seriesVistas: 42,
      peliculasVistas: 28,
      episodiosVistos: 203,
      amigos: 25,
      horasVistas: 189
    },
    detailed: {
      seriesCompletadas: 15,
      seriesEnProgreso: 27,
      episodiosEstaTemporada: 31,
      recomendacionesRecibidas: 67,
      recomendacionesHechas: 41,
      generosFavoritos: ["Comedy", "Drama", "Romance"],
      plataformaMasUsada: "HBO"
    }
  }
};

export async function GET(req) {
  try {
    const { userId, error, status } = getUserIdFromRequest(req);
    
    if (error) {
      return NextResponse.json({ error }, { status });
    }
    
    if (!mockUserStats[userId]) {
      return unauthorizedResponse('Invalid token or user not found');
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    const stats = mockUserStats[userId];

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('User stats fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
