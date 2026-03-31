export const getPrecisePlanets = async (
  dateStr: string, 
  timeStr: string, 
  coords: { lat: number; lon: number }
): Promise<any[]> => {
  const [year, month, date] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'ZTFJtMrf368KiNQn50p1J8rgILM5M9eZ4C6nXFbf'
    },
    body: JSON.stringify({
      year, month, date,
      hours, minutes, seconds: 0,
      latitude: coords.lat,
      longitude: coords.lon,
      timezone: 3.0,
      observation_point: "topocentric"
    })
  };

  try {
    const response = await fetch("https://json.freeastrologyapi.com/planets", requestOptions);
    const data = await response.json();

    if (!data.output) return [];

    return data.output.map((p: any) => ({
      nameUk: p.name,
      longitude: p.full_degree,
      degree: `${Math.floor(p.full_degree % 30)}°`,
      sign: p.sign
    }));
  } catch (error) {
    console.error("Astro API Error:", error);
    return [];
  }
};