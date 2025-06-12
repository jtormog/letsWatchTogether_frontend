import { NextResponse } from 'next/server';
import { ErrorMessages, createErrorResponse } from '../../../../utils/errorMessages.js';

export async function POST(request) {
  try {
    // Obtener el token de autenticación de las cookies
    const token = request.cookies.get('auth-token')?.value;
    
    console.log('User media API - Token status:', {
      tokenExists: !!token,
      tokenLength: token?.length,
      tokenStart: token?.substring(0, 10) + '...'
    });
    
    if (!token) {
      console.error('User media API - No authentication token found');
      return NextResponse.json(
        createErrorResponse({ message: 'No authentication token found' }, 401), 
        { status: 401 }
      );
    }

    // Obtener los datos del cuerpo de la petición
    const body = await request.json();
    const { tmdb_id, recommended, liked, type, status, episode } = body;
    
    console.log('User media API - Request body:', {
      tmdb_id,
      recommended,
      liked,
      type,
      status,
      episode
    });
    
    // Validar datos requeridos
    if (!tmdb_id || typeof recommended !== 'boolean' || !type || !status) {
      console.error('User media API - Missing required fields:', {
        tmdb_id: !!tmdb_id,
        recommended: typeof recommended,
        type: !!type,
        status: !!status
      });
      return NextResponse.json(
        createErrorResponse({ message: 'Missing required fields: tmdb_id, recommended, type, status' }, 400), 
        { status: 400 }
      );
    }

    // Validar valores permitidos
    if (!['movie', 'tv'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be movie or tv' }, 
        { status: 400 }
      );
    }

    if (!['watching', 'completed', 'planned'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be watching, completed, or planned' }, 
        { status: 400 }
      );
    }

    // Check if Laravel API URL is configured
    if (!process.env.LARAVEL_API_URL) {
      console.error('User media API - Laravel API URL not configured');
      return NextResponse.json(
        createErrorResponse({ message: 'Backend service not configured' }, 502), 
        { status: 502 }
      );
    }

    try {
      // Llamada a Laravel API para crear/actualizar user media
      console.log('User media API - Calling Laravel API:', {
        url: `${process.env.LARAVEL_API_URL}/api/user/media`,
        authToken: token.substring(0, 10) + '...',
        payload: {
          tmdb_id: parseInt(tmdb_id),
          recommended,
          liked: liked || false,
          type,
          status,
          episode: episode || null
        }
      });
      
      const laravelResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/user/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tmdb_id: parseInt(tmdb_id),
          recommended,
          liked: liked || false,
          type,
          status,
          episode: episode || null
        }),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(8000) // Increased timeout for user actions
      });

      console.log('User media API - Laravel response status:', laravelResponse.status);
      
      // Handle different response scenarios
      let responseData;
      try {
        responseData = await laravelResponse.json();
        console.log('User media API - Laravel response data:', responseData);
      } catch (jsonError) {
        console.error('User media API - Failed to parse Laravel response as JSON:', jsonError);
        responseData = { message: 'Invalid response format from server' };
      }

      if (!laravelResponse.ok) {
        console.error('User media API - Laravel API error:', {
          status: laravelResponse.status,
          statusText: laravelResponse.statusText,
          data: responseData
        });

        // Handle authentication errors specifically
        if (laravelResponse.status === 401) {
          return NextResponse.json(
            createErrorResponse({ status: 401 }), 
            { status: 401 }
          );
        }

        // Enhanced error message extraction
        const errorMessage = responseData?.message || 
                           responseData?.error || 
                           responseData?.errors || 
                           'Unknown server error';
        
        console.error('User media API - Detailed error:', {
          extractedMessage: errorMessage,
          fullResponse: responseData
        });

        return NextResponse.json(
          createErrorResponse({ 
            message: `Laravel API error: ${errorMessage}`,
            status: laravelResponse.status 
          }, laravelResponse.status), 
          { status: laravelResponse.status }
        );
      }

      // Retornar la respuesta exitosa de Laravel
      return NextResponse.json(responseData, { 
        status: laravelResponse.status 
      });

    } catch (fetchError) {
      console.error('User media API - Error calling Laravel API:', {
        error: fetchError.message,
        stack: fetchError.stack,
        cause: fetchError.cause,
        isTimeout: fetchError.message.includes('AbortError') || fetchError.message.includes('timeout'),
        isNetwork: fetchError.message.includes('network') || fetchError.message.includes('ECONNREFUSED')
      });

      // Provide specific error messages based on error type
      if (fetchError.message.includes('AbortError') || fetchError.message.includes('timeout')) {
        return NextResponse.json(
          createErrorResponse(fetchError, 504, 'network'),
          { status: 504 }
        );
      }

      if (fetchError.message.includes('network') || fetchError.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          createErrorResponse(fetchError, 502, 'network'),
          { status: 502 }
        );
      }

      return NextResponse.json(
        createErrorResponse(fetchError, 502),
        { status: 502 }
      );
    }

  } catch (error) {
    console.error('User media API - Unexpected error:', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      createErrorResponse(error),
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Obtener el token de autenticación de las cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        createErrorResponse({ message: 'No authentication token found' }, 401), 
        { status: 401 }
      );
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const tmdb_id = searchParams.get('tmdb_id');
    const type = searchParams.get('type');

    if (!tmdb_id || !type) {
      return NextResponse.json(
        createErrorResponse({ message: 'tmdb_id and type parameters are required' }, 400), 
        { status: 400 }
      );
    }

    // Check if Laravel API URL is configured
    if (!process.env.LARAVEL_API_URL) {
      console.error('User media GET API - Laravel API URL not configured');
      return NextResponse.json(
        createErrorResponse({ message: 'Backend service not configured' }, 502), 
        { status: 502 }
      );
    }

    try {
      // Llamada a Laravel API para obtener user media específico
      const laravelResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/user/media?tmdb_id=${tmdb_id}&type=${type}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        // Add timeout for GET requests
        signal: AbortSignal.timeout(5000)
      });

      let responseData;
      try {
        responseData = await laravelResponse.json();
      } catch (jsonError) {
        console.error('User media GET API - Failed to parse Laravel response as JSON:', jsonError);
        responseData = { message: 'Invalid response format from server' };
      }

      if (!laravelResponse.ok) {
        console.error('User media GET API - Laravel API error:', responseData);

        // Handle authentication errors specifically
        if (laravelResponse.status === 401) {
          return NextResponse.json(
            createErrorResponse({ status: 401 }), 
            { status: 401 }
          );
        }

        const errorMessage = responseData?.message || 
                           responseData?.error || 
                           'Unknown server error';

        return NextResponse.json(
          createErrorResponse({ 
            message: `Failed to get user media: ${errorMessage}`,
            status: laravelResponse.status 
          }, laravelResponse.status), 
          { status: laravelResponse.status }
        );
      }

      // Retornar la respuesta exitosa de Laravel
      return NextResponse.json(responseData);

    } catch (fetchError) {
      console.error('User media GET API - Error calling Laravel API:', {
        error: fetchError.message,
        isTimeout: fetchError.message.includes('AbortError') || fetchError.message.includes('timeout'),
        isNetwork: fetchError.message.includes('network') || fetchError.message.includes('ECONNREFUSED')
      });

      if (fetchError.message.includes('AbortError') || fetchError.message.includes('timeout')) {
        return NextResponse.json(
          createErrorResponse(fetchError, 504, 'network'),
          { status: 504 }
        );
      }

      return NextResponse.json(
        createErrorResponse(fetchError, 502, 'network'),
        { status: 502 }
      );
    }

  } catch (error) {
    console.error('User media GET API - Unexpected error:', error);
    return NextResponse.json(
      createErrorResponse(error),
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Obtener el token de autenticación de las cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        createErrorResponse({ message: 'No authentication token found' }, 401), 
        { status: 401 }
      );
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const tmdb_id = searchParams.get('tmdb_id');
    const type = searchParams.get('type');

    if (!tmdb_id || !type) {
      return NextResponse.json(
        createErrorResponse({ message: 'tmdb_id and type parameters are required' }, 400), 
        { status: 400 }
      );
    }

    // Check if Laravel API URL is configured
    if (!process.env.LARAVEL_API_URL) {
      console.error('User media DELETE API - Laravel API URL not configured');
      return NextResponse.json(
        createErrorResponse({ message: 'Backend service not configured' }, 502), 
        { status: 502 }
      );
    }

    try {
      // Llamada a Laravel API para eliminar user media
      console.log('User media DELETE API - Calling Laravel API:', {
        url: `${process.env.LARAVEL_API_URL}/api/user/media`,
        tmdb_id,
        type
      });

      const laravelResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/user/media?tmdb_id=${tmdb_id}&type=${type}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        // Add timeout for DELETE requests
        signal: AbortSignal.timeout(5000)
      });

      let responseData;
      try {
        responseData = await laravelResponse.json();
      } catch (jsonError) {
        console.error('User media DELETE API - Failed to parse Laravel response as JSON:', jsonError);
        responseData = { message: 'Invalid response format from server' };
      }

      if (!laravelResponse.ok) {
        console.error('User media DELETE API - Laravel API error:', responseData);

        // Handle authentication errors specifically
        if (laravelResponse.status === 401) {
          return NextResponse.json(
            createErrorResponse({ status: 401 }), 
            { status: 401 }
          );
        }

        const errorMessage = responseData?.message || 
                           responseData?.error || 
                           'Unknown server error';

        return NextResponse.json(
          createErrorResponse({ 
            message: `Failed to delete user media: ${errorMessage}`,
            status: laravelResponse.status 
          }, laravelResponse.status), 
          { status: laravelResponse.status }
        );
      }

      // Retornar la respuesta exitosa de Laravel
      return NextResponse.json(responseData);

    } catch (fetchError) {
      console.error('User media DELETE API - Error calling Laravel API:', {
        error: fetchError.message,
        isTimeout: fetchError.message.includes('AbortError') || fetchError.message.includes('timeout'),
        isNetwork: fetchError.message.includes('network') || fetchError.message.includes('ECONNREFUSED')
      });

      if (fetchError.message.includes('AbortError') || fetchError.message.includes('timeout')) {
        return NextResponse.json(
          createErrorResponse(fetchError, 504, 'network'),
          { status: 504 }
        );
      }

      return NextResponse.json(
        createErrorResponse(fetchError, 502, 'network'),
        { status: 502 }
      );
    }

  } catch (error) {
    console.error('User media DELETE API - Unexpected error:', error);
    return NextResponse.json(
      createErrorResponse(error),
      { status: 500 }
    );
  }
}
