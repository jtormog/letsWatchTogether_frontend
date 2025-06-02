import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/app/lib/auth';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else {
      const cookies = req.cookies.get('auth-token');
      token = cookies?.value;
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    try {
      // Llamada a Laravel API para obtener estadísticas reales
      const laravelResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/user/media-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!laravelResponse.ok) {
        if (laravelResponse.status === 401) {
          return NextResponse.json(
            { error: 'Authentication expired' }, 
            { status: 401 }
          );
        }
        
        return NextResponse.json(
          { error: 'Failed to fetch user stats' }, 
          { status: laravelResponse.status }
        );
      }

      const laravelData = await laravelResponse.json();
      
      // Transformar datos de Laravel al formato esperado por el frontend
      const transformedStats = {
        general: {
          seriesVistas: laravelData.total_series || 0,
          peliculasVistas: laravelData.total_movies || 0,
          episodiosVistos: laravelData.total_episodes || 0,
          amigos: laravelData.friends_count || 0,
          horasVistas: laravelData.total_hours || 0
        },
        detailed: {
          seriesCompletadas: laravelData.completed_series || 0,
          seriesEnProgreso: laravelData.in_progress_series || 0,
          episodiosEstaTemporada: laravelData.episodes_this_season || 0,
          recomendacionesRecibidas: laravelData.recommendations_received || 0,
          recomendacionesHechas: laravelData.recommendations_made || 0,
          generosFavoritos: laravelData.favorite_genres || ["Drama", "Comedy", "Action"],
          plataformaMasUsada: laravelData.most_used_platform || "Netflix"
        }
      };

      return NextResponse.json({
        success: true,
        stats: transformedStats
      });

    } catch (fetchError) {
      console.error('Laravel API error:', fetchError);
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('User stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
