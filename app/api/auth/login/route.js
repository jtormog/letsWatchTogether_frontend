import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' }, 
        { status: 400 }
      );
    }

    let authData = null;

    try {
      const authResponse = await fetch(`${process.env.LARAVEL_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          email: username,
          password 
        }),
      });

      if (authResponse.ok) {
        authData = await authResponse.json();
      } else {
        const errorData = await authResponse.json();
        return NextResponse.json(
          { error: errorData.message || 'Invalid credentials' }, 
          { status: authResponse.status || 401 }
        );
      }
    } catch (fetchError) {
      return NextResponse.json(
        { error: 'Authentication service unavailable' },
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
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
