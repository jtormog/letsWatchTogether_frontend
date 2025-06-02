import { NextResponse } from 'next/server';
import { getUserIdFromRequest, unauthorizedResponse } from '@/app/lib/auth';

// NOTA: Este endpoint mantiene datos mock porque Laravel NO tiene un endpoint equivalente
// para obtener el perfil completo del usuario con preferencias y configuración.
// Para migrar a Laravel, se necesitaría crear un nuevo endpoint en Laravel que retorne:
// - Datos básicos del usuario (nombre, email, avatar)
// - Preferencias del usuario (idioma, notificaciones, autoplay)
// - Suscripciones a plataformas
// - Estadísticas básicas
// Endpoints Laravel relacionados disponibles:
// - No existe equivalente directo
// - Podría combinarse con: api/user/platforms/subscribed + api/user/media-stats

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
    const { userId, error, status, token } = getUserIdFromRequest(req);
    
    if (error) {
      return NextResponse.json({ error }, { status });
    }
    
    try {
      const response = await fetch(`${process.env.LARAVEL_API_URL}/api/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        const userData = await response.json();
        
        const transformedUser = {
          id: userData.user.id.toString(),
          name: userData.user.name,
          username: userData.user.email,
          email: userData.user.email,
          avatar: userData.user.avatar || `/placeholder.svg?height=120&width=120&text=${userData.user.name.charAt(0)}`,
          preferences: {
            language: "es",
            notifications: true,
            autoplay: true
          },
          subscription: {
            platforms: [],
            plan: "basic"
          },
          stats: {
            seriesVistas: 0,
            peliculasVistas: 0,
            episodiosVistos: 0,
            amigos: 0
          }
        };

        return NextResponse.json({
          success: true,
          user: transformedUser
        });
      }
    } catch (apiError) {
    }

    let user = mockUsers[userId];
    
    if (!user) {
      user = {
        id: userId,
        name: "OAuth User",
        username: "@oauthuser" + userId,
        email: "oauth.user." + userId + "@example.com",
        avatar: "/placeholder.svg?height=120&width=120&text=OU",
        preferences: {
          language: "es",
          notifications: true,
          autoplay: false
        },
        subscription: {
          platforms: [],
          plan: "basic"
        },
        stats: {
          seriesVistas: 0,
          peliculasVistas: 0,
          episodiosVistos: 0,
          amigos: 0
        }
      };
      
      mockUsers[userId] = user;
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
