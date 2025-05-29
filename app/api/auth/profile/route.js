import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/app/lib/auth';

const mockUsers = {
  "1": {
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
  "2": {
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

export async function GET(req) {
  try {
    const { userId, error, status } = getUserIdFromRequest(req);
    
    if (error) {
      return NextResponse.json({ error }, { status });
    }
    
    console.log('Available mock users:', Object.keys(mockUsers));
    
    if (!mockUsers[userId]) {
      console.log('User not found in mockUsers');
      return unauthorizedResponse('Invalid token or user not found');
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    const user = mockUsers[userId];

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
