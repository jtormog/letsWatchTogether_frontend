import { NextResponse } from 'next/server';

const mockUsers = {
  "user1": {
    id: "1",
    name: "Juan Pérez",
    username: "@juanperez",
    email: "juan@example.com",
    avatar: "/placeholder.svg?height=120&width=120&text=JP",
    preferences: {
      language: "es",
      notifications: true,
      autoplay: true
    },
    subscription: {
      platforms: ["Netflix", "HBO", "Disney+"],
      plan: "premium"
    },
    stats: {
      seriesVistas: 30,
      peliculasVistas: 45,
      episodiosVistos: 156,
      amigos: 18
    }
  },
  "user2": {
    id: "2", 
    name: "María García",
    username: "@mariagarcia",
    email: "maria@example.com",
    avatar: "/placeholder.svg?height=120&width=120&text=MG",
    preferences: {
      language: "es",
      notifications: false,
      autoplay: false
    },
    subscription: {
      platforms: ["Netflix", "Prime Video"],
      plan: "basic"
    },
    stats: {
      seriesVistas: 42,
      peliculasVistas: 28,
      episodiosVistos: 203,
      amigos: 25
    }
  }
};

function getBasicUserData(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    avatar: user.avatar,
    subscription: {
      platforms: user.subscription.platforms
    },
    stats: user.stats
  };
};

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' }, 
        { status: 400 }
      );
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const userId = username === "juan@example.com" ? "user1" : "user2";
    const fullUser = mockUsers[userId];

    if (!fullUser) {
      return NextResponse.json(
        { error: 'Invalid credentials' }, 
        { status: 401 }
      );
    }

    const token = `mock-jwt-token-${fullUser.id}-${Date.now()}`;

    const basicUser = getBasicUserData(fullUser);

    const response = NextResponse.json({
      success: true,
      user: basicUser,
      token
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
