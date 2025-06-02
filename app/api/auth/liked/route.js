import { NextResponse } from 'next/server';

// NOTA: Este endpoint mantiene datos mock porque Laravel NO tiene un endpoint equivalente
// para gestionar contenido marcado como "me gusta" por el usuario.
// Para migrar a Laravel, se necesitaría crear:
// - POST api/user/liked (marcar contenido como favorito)
// - GET api/user/liked (obtener contenido favorito del usuario)
// - DELETE api/user/liked/{id} (quitar de favoritos)
// Endpoints Laravel relacionados disponibles:
// - Ninguno específico para sistema de "likes"

const mockLiked = [
  {
    id: 278,
    title: "Cadena Perpetua",
    overview: "Dos hombres encarcelados se unen a lo largo de varios años, encontrando consuelo y eventual redención a través de actos de decencia común.",
    poster: "https://image.tmdb.org/t/p/w342/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    mediaType: "movie",
    year: "1994"
  },
  {
    id: 1396,
    title: "Breaking Bad",
    overview: "Un profesor de química de secundaria con cáncer terminal se asocia con un ex estudiante para asegurar el futuro financiero de su familia fabricando y vendiendo metanfetamina.",
    poster: "https://image.tmdb.org/t/p/w342/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg",
    mediaType: "tv",
    year: "2008"
  },
  {
    id: 424,
    title: "La Lista de Schindler",
    overview: "En la Polonia ocupada por los alemanes durante la Segunda Guerra Mundial, el industrial Oskar Schindler se preocupa por sus trabajadores judíos después de presenciar su persecución por los nazis.",
    poster: "https://image.tmdb.org/t/p/w342/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
    mediaType: "movie",
    year: "1993"
  },
  {
    id: 1398,
    title: "Los Soprano",
    overview: "Tony Soprano, un jefe de la mafia de Nueva Jersey, lucha por manejar su vida familiar y profesional, lo que genera crisis de ansiedad que lo envían a terapia psiquiátrica.",
    poster: "https://image.tmdb.org/t/p/w342/rTc7ZXdroqjkKivFPvCPX0Ru7uw.jpg",
    mediaType: "tv",
    year: "1999"
  },
  {
    id: 155,
    title: "El Caballero Oscuro",
    overview: "Cuando el Joker emerge para causar el caos, Batman debe aceptar una de las pruebas psicológicas y físicas más grandes para luchar contra la injusticia.",
    poster: "https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    mediaType: "movie",
    year: "2008"
  },
  {
    id: 46952,
    title: "The Wire",
    overview: "Un drama policial que explora la escena de las drogas en Baltimore a través de los ojos de los traficantes de drogas y las fuerzas del orden.",
    poster: "https://image.tmdb.org/t/p/w342/dg7NuKDjmS6OzuNy33qt8kSkPA1.jpg",
    mediaType: "tv",
    year: "2002"
  }
];

function getLikedForUser(userId) {
  const userMod = parseInt(userId) % 4;
  
  switch (userMod) {
    case 0:
      return mockLiked.filter(item => 
        [278, 424, 155].includes(item.id)
      );
    case 1:
      return mockLiked.filter(item => 
        [1396, 1398, 46952].includes(item.id)
      );
    case 2:
      return mockLiked.filter(item => 
        [278, 1396, 155, 1398].includes(item.id)
      );
    case 3:
      return mockLiked;
    default:
      return mockLiked.slice(0, 3);
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

    await new Promise(resolve => setTimeout(resolve, 90));

    const liked = getLikedForUser(userId);
    
    return NextResponse.json(liked);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch liked content' }, 
      { status: 500 }
    );
  }
}
