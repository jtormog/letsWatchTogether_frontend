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
