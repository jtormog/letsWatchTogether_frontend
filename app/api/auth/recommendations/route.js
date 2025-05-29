import { NextResponse } from 'next/server';

const mockRecommendations = [
  {
    id: 550,
    title: "El Club de la Lucha",
    overview: "Un empleado de oficina insomne y un fabricante de jabón forman un club de lucha clandestino que evoluciona hacia algo mucho más grande.",
    poster: "https://image.tmdb.org/t/p/w342/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg",
    mediaType: "movie",
    year: "1999"
  },
  {
    id: 13,
    title: "Forrest Gump",
    overview: "La historia de la vida de Forrest Gump, un hombre con un coeficiente intelectual bajo pero con un gran corazón.",
    poster: "https://image.tmdb.org/t/p/w342/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    mediaType: "movie",
    year: "1994"
  },
  {
    id: 1399,
    title: "Juego de Tronos",
    overview: "Nueve familias nobles luchan por el control de las tierras míticas de Poniente, mientras un antiguo enemigo regresa después de estar inactivo durante milenios.",
    poster: "https://image.tmdb.org/t/p/w342/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    mediaType: "tv",
    year: "2011"
  },
  {
    id: 94605,
    title: "Arcane",
    overview: "En las ciudades utópicas de Piltover y la oprimida clandestinidad de Zaun, dos hermanas luchan en lados opuestos de una guerra entre tecnologías mágicas y creencias en conflicto.",
    poster: "https://image.tmdb.org/t/p/w342/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg",
    mediaType: "tv",
    year: "2021"
  },
  {
    id: 238,
    title: "El Padrino",
    overview: "La historia del patriarca de una poderosa familia criminal y su transformación de patriarca renuente a jefe despiadado.",
    poster: "https://image.tmdb.org/t/p/w342/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    mediaType: "movie",
    year: "1972"
  },
  {
    id: 1402,
    title: "The Walking Dead",
    overview: "El sheriff Rick Grimes despierta de un coma para encontrar un mundo apocalíptico devastado por los caminantes y debe liderar a un grupo de supervivientes.",
    poster: "https://image.tmdb.org/t/p/w342/rqeYMLryjcawh2JeRpCVUDXYM5b.jpg",
    mediaType: "tv",
    year: "2010"
  }
];

function getRecommendationsForUser(userId) {
  const userMod = parseInt(userId) % 3;
  
  switch (userMod) {
    case 0:
      return mockRecommendations.filter(item => 
        [550, 238, 1399, 1402].includes(item.id)
      );
    case 1:
      return mockRecommendations.filter(item => 
        [13, 1399, 94605, 550].includes(item.id)
      );
    case 2:
      return mockRecommendations.slice(0, 4);
    default:
      return mockRecommendations.slice(0, 3);
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

    await new Promise(resolve => setTimeout(resolve, 100));

    const recommendations = getRecommendationsForUser(userId);
    
    return NextResponse.json(recommendations);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' }, 
      { status: 500 }
    );
  }
}
