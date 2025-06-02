import { NextResponse } from 'next/server';

// NOTA: Este endpoint mantiene datos mock porque Laravel NO tiene un endpoint equivalente
// para obtener específicamente lo que los amigos quieren ver.
// Para migrar a Laravel, se necesitaría crear un endpoint que combine:
// - Sistema de amigos (ya existe en Laravel)
// - Watchlists de amigos (no existe en Laravel)
// - Filtrado por contenido que amigos quieren ver
// Endpoints Laravel relacionados disponibles:
// - api/user/friends/recommendations (recomendaciones de amigos, similar pero diferente)
// - Sistema de amigos completo ya existe en Laravel

const mockFriendsWantToSee = [
  {
    id: 66732,
    type: "tv",
    title: "Stranger Things",
    friendName: "Jesús Cristo",
    friendAvatar: "/placeholder.svg?height=100&width=100&text=JC"
  },
  {
    id: 1396,
    type: "tv", 
    title: "Breaking Bad",
    friendName: "Walter White",
    friendAvatar: "/placeholder.svg?height=100&width=100&text=WW"
  },
  {
    id: 1399,
    type: "tv",
    title: "Game of Thrones", 
    friendName: "Jon Snow",
    friendAvatar: "/placeholder.svg?height=100&width=100&text=JS"
  },
  {
    id: 438148,
    type: "movie",
    title: "Minions: El origen de Gru",
    friendName: "María García",
    friendAvatar: "/placeholder.svg?height=100&width=100&text=MG"
  },
  {
    id: 94605,
    type: "tv",
    title: "Arcane",
    friendName: "Ana López",
    friendAvatar: "/placeholder.svg?height=100&width=100&text=AL"
  }
];

function getFriendsWantToSeeForUser(userId) {
  const userMod = parseInt(userId) % 3;
  
  switch (userMod) {
    case 0:
      return mockFriendsWantToSee.filter(item => 
        [66732, 1396, 1399].includes(item.id)
      );
    case 1:
      return mockFriendsWantToSee.filter(item => 
        [1399, 438148, 94605].includes(item.id)
      );
    case 2:
      return mockFriendsWantToSee;
    default:
      return mockFriendsWantToSee.slice(0, 3);
  }
}

export async function POST(req) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' }, 
        { status: 400 }
      );
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    const friendsWantToSee = getFriendsWantToSeeForUser(userId);
    
    return NextResponse.json(friendsWantToSee);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch friends want to see data' }, 
      { status: 500 }
    );
  }
}
