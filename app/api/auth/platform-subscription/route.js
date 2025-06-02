import { NextResponse } from 'next/server';

export async function PUT(req) {
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

    const { platformId, platformName, subscribed } = await req.json();
    
    if ((!platformId && !platformName) || typeof subscribed !== 'boolean') {
      return NextResponse.json(
        { error: 'platformId/platformName and subscribed are required' }, 
        { status: 400 }
      );
    }

    try {
      const endpoint = subscribed ? 'subscribe' : 'unsubscribe';
      const method = subscribed ? 'POST' : 'DELETE';
      
      // Llamada a Laravel API para gestionar suscripción a plataforma
      const laravelResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/user/platforms/${platformId || platformName}/${endpoint}`, {
        method: method,
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
        
        const errorData = await laravelResponse.json();
        return NextResponse.json(
          { error: errorData.message || 'Failed to update platform subscription' }, 
          { status: laravelResponse.status }
        );
      }

      const laravelData = await laravelResponse.json();

      return NextResponse.json({
        success: true,
        message: `Suscripción a ${platformName || platformId} ${subscribed ? 'activada' : 'desactivada'}`,
        data: laravelData
      });

    } catch (fetchError) {
      console.error('Laravel API error:', fetchError);
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Platform subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Endpoint para obtener plataformas suscritas
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
      // Llamada a Laravel API para obtener plataformas suscritas
      const laravelResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/user/platforms/subscribed`, {
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
          { error: 'Failed to fetch subscribed platforms' }, 
          { status: laravelResponse.status }
        );
      }

      const laravelData = await laravelResponse.json();

      return NextResponse.json({
        success: true,
        platforms: laravelData
      });

    } catch (fetchError) {
      console.error('Laravel API error:', fetchError);
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Get platforms error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
