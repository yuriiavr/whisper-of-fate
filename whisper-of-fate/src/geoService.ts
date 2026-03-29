export async function searchCity(query: string) {
  if (query.length < 3) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=uk`;
  
  const response = await fetch(url, {
    headers: {
      'Accept-Language': 'uk-UA,uk;q=0.9'
    }
  });

  const data = await response.json();
  return data.map((item: any) => ({
    name: item.display_name,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
  }));
}