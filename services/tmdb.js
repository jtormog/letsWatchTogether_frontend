export async function getTopPopularMixed(limit = 5) {
  try {
    const response = await fetch(`/api/tmdb/popular?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Ha habido un error al obtener las tendencias');
  }
}

export async function getWorksByIds(works = []) {
  try {
    const response = await fetch('/api/tmdb/get-by-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ works }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Ha habido un error al obtener las obras por ID');
  }
}

export async function getNextEpisodesForUserSeries(tvIds = []) {
  try {
    const response = await fetch('/api/tmdb/next-episodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tvIds }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Ha habido un error al obtener próximos episodios');
  }
}

export async function getFullShowDetails(tvId) {
  try {
    const res = await fetch('/api/tmdb/full-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tvId }),
    });

    if (!res.ok) {
      throw new Error(`Error al obtener detalles: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    throw new Error('No se pudo obtener la información completa de la serie.');
  }
}
