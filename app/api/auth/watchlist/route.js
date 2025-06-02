import { NextResponse } from 'next/server';

// NOTA: Este endpoint mantiene datos mock porque Laravel NO tiene un endpoint equivalente
// para gestionar la lista de seguimiento (watchlist) del usuario.
// Para migrar a Laravel, se necesitaría crear:
// - POST api/user/watchlist (añadir contenido a watchlist)
// - GET api/user/watchlist (obtener watchlist del usuario)
// - DELETE api/user/watchlist/{id} (eliminar de watchlist)
// Endpoints Laravel relacionados disponibles:
// - api/user/media/{status} (podría usarse para contenido "plan to watch")

const mockWatchlist = [
	{
		id: 157336,
		title: 'Interestelar',
		overview:
			'Un grupo de exploradores hace uso de un agujero de gusano recientemente descubierto para superar las limitaciones de los viajes espaciales tripulados.',
		poster: 'https://image.tmdb.org/t/p/w342/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
		mediaType: 'movie',
		year: '2014',
	},
	{
		id: 60735,
		title: 'The Flash',
		overview:
			'Después de ser alcanzado por un rayo, Barry Allen despierta de un coma de nueve meses para descubrir que ha sido dotado del poder de la súper velocidad.',
		poster: 'https://image.tmdb.org/t/p/w342/lJA2RCMfsWoskqlQhXPSLFQGXEJ.jpg',
		mediaType: 'tv',
		year: '2014',
		progress: 65,
	},
	{
		id: 27205,
		title: 'Inception',
		overview:
			'Un ladrón que roba secretos corporativos a través del uso de la tecnología de compartir sueños, recibe la tarea inversa de plantar una idea en la mente de un CEO.',
		poster: 'https://image.tmdb.org/t/p/w342/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
		mediaType: 'movie',
		year: '2010',
	},
	{
		id: 82856,
		title: 'The Mandalorian',
		overview:
			'Después de las historias de Jango y Boba Fett, emerge otro guerrero en la galaxia. The Mandalorian está ambientado después de la caída del Imperio.',
		poster: 'https://image.tmdb.org/t/p/w342/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg',
		mediaType: 'tv',
		year: '2019',
		progress: 45,
	},
	{
		id: 603,
		title: 'Matrix',
		overview:
			'Un programador es llevado a un submundo de rebelión donde descubre que su realidad es una simulación por computadora controlada por máquinas cibernéticas.',
		poster: 'https://image.tmdb.org/t/p/w342/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
		mediaType: 'movie',
		year: '1999',
	},
];

function getWatchlistForUser(userId) {
	const userMod = parseInt(userId) % 3;

	switch (userMod) {
		case 0:
			return mockWatchlist.filter((item) =>
				[157336, 27205, 603].includes(item.id)
			);
		case 1:
			return mockWatchlist.filter((item) =>
				[60735, 82856, 157336].includes(item.id)
			);
		case 2:
			return mockWatchlist;
		default:
			return mockWatchlist.slice(0, 3);
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

		await new Promise((resolve) => setTimeout(resolve, 80));

		const watchlist = getWatchlistForUser(userId);

		return NextResponse.json(watchlist);
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to fetch watchlist' },
			{ status: 500 }
		);
	}
}
