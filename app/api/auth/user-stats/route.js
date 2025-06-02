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
      mockUserStats[userId] = {
        general: {
          seriesVistas: 0,
          peliculasVistas: 0,
          episodiosVistos: 0,
          amigos: 0,
          horasVistas: 0
        },
        detailed: {
          seriesCompletadas: 0,
          seriesEnProgreso: 0,
          episodiosEstaTemporada: 0,
          recomendacionesRecibidas: 0,
          recomendacionesHechas: 0,
          generosFavoritos: ["Drama", "Comedy", "Action"],
          plataformaMasUsada: "Netflix"
        }
      };
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    const stats = mockUserStats[userId];

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
