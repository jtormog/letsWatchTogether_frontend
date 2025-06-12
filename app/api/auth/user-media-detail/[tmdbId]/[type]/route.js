import { NextResponse } from 'next/server';

export async function GET(
  request,
  { params }
) {
  try {
    // Obtener el token de autenticación de las cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    const { tmdbId, type } = await params;

    // Validar parámetros requeridos
    if (!tmdbId || !type) {
      return NextResponse.json(
        { error: 'tmdbId and type parameters are required' }, 
        { status: 400 }
      );
    }

    // Validar tipo
    if (!['movie', 'tv'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be movie or tv' }, 
        { status: 400 }
      );
    }

    try {
      // Llamada a Laravel API para obtener detalles específicos del user media
      const laravelResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/user/media/tmdb/${tmdbId}/${type}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const responseData = await laravelResponse.json();

      if (!laravelResponse.ok) {
        // Si es 404, significa que el usuario no tiene datos para este contenido
        if (laravelResponse.status === 404) {
          return NextResponse.json(
            { 
              success: true,
              data: null,
              message: 'No user data found for this content'
            }
          );
        }

        console.error('Laravel API error:', responseData);
        return NextResponse.json(
          { 
            error: 'Failed to get user media details',
            details: responseData.message || 'Unknown error'
          }, 
          { status: laravelResponse.status }
        );
      }

      // Retornar la respuesta exitosa de Laravel
      return NextResponse.json(responseData);

    } catch (fetchError) {
      console.error('Error calling Laravel API:', fetchError);
      return NextResponse.json(
        { error: 'Failed to connect to backend service' },
        { status: 502 }
      );
    }

  } catch (error) {
    console.error('Error in user media detail route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
