import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { name, email, password, password_confirmation } = await req.json();
    
    // Validaciones básicas
    if (!name || !email || !password || !password_confirmation) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' }, 
        { status: 400 }
      );
    }

    if (password !== password_confirmation) {
      return NextResponse.json(
        { error: 'Las contraseñas no coinciden' }, 
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' }, 
        { status: 400 }
      );
    }

    if (name.length > 255) {
      return NextResponse.json(
        { error: 'El nombre no puede exceder 255 caracteres' }, 
        { status: 400 }
      );
    }

    if (email.length > 255) {
      return NextResponse.json(
        { error: 'El email no puede exceder 255 caracteres' }, 
        { status: 400 }
      );
    }

    let authData = null;

    try {
      const authResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          name: name.trim(),
          email: email.trim(),
          password,
          password_confirmation
        }),
      });

      if (authResponse.ok) {
        authData = await authResponse.json();
      } else {
        const errorData = await authResponse.json();
        
        // Manejar errores específicos de Laravel
        if (errorData.errors) {
          const firstError = Object.values(errorData.errors)[0];
          const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          return NextResponse.json(
            { error: errorMessage }, 
            { status: 400 }
          );
        }
        
        return NextResponse.json(
          { error: errorData.message || 'Error en el registro' }, 
          { status: authResponse.status || 400 }
        );
      }
    } catch (fetchError) {
      console.error('Laravel API error:', fetchError);
      return NextResponse.json(
        { error: 'Servicio de autenticación no disponible' },
        { status: 503 }
      );
    }
    
    const transformedUser = {
      id: authData.user.id.toString(),
      name: authData.user.name,
      username: authData.user.email,
      email: authData.user.email,
      avatar: authData.user.avatar || "https://via.placeholder.com/120x120/0de383/000000?text=" + authData.user.name.charAt(0),
      subscription: {
        platforms: []
      },
      stats: {
        seriesVistas: 0,
        peliculasVistas: 0,
        episodiosVistos: 0,
        amigos: 0
      }
    };

    const response = NextResponse.json({
      success: true,
      message: authData.message,
      user: transformedUser,
      token: authData.token,
      token_type: authData.token_type
    });

    response.cookies.set('auth-token', authData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,
      path: '/'
    });

    response.cookies.set('user-id', authData.user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
