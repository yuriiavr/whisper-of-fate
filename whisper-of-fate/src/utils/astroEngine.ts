export const getPrecisePlanets = async (
  dateStr: string,
  timeStr: string,
  coords: { lat: number; lon: number },
): Promise<any[]> => {
  const [year, month, date] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "ZTFJtMrf368KiNQn50p1J8rgILM5M9eZ4C6nXFbf",
    },
    body: JSON.stringify({
      year,
      month,
      date,
      hours,
      minutes,
      seconds: 0,
      latitude: coords.lat,
      longitude: coords.lon,
      timezone: 3.0,
      observation_point: "topocentric",
    }),
  };

  try {
    const response = await fetch(
      "https://json.freeastrologyapi.com/planets",
      requestOptions,
    );
    const data = await response.json();
    console.log("--- ASTRO API RAW DATA ---", data);

    if (!data.output || !data.output[1]) return [];

    // Перетворюємо об'єкт з назвами планет у масив
    const planetsData = data.output[1];
    const planetsArray = Object.keys(planetsData).map((key) => {
      const p = planetsData[key];
      return {
        nameUk: key, // Назва планети (Sun, Moon...)
        longitude: p.fullDegree, // Зверни увагу: в API назва fullDegree (з великою D)
        degree: `${Math.floor(p.normDegree || 0)}°`,
        sign: p.current_sign,
      };
    });

    console.log("--- MAPPED PLANETS ---", planetsArray);
    return planetsArray;
  } catch (error) {
    console.error("Astro API Error:", error);
    return [];
  }
};
