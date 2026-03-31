const API_KEYS = [
  "ZTFJtMrf368KiNQn50p1J8rgILM5M9eZ4C6nXFbf",
  "Rx6f6COK8z8ztQeXXd4sc2n6VldXXgNb4m2Enpsi",
  "6dgqhdta8o10Rh6qs9YpgFrUOQmgRhe9yEHNNrj5"
];

let currentKeyIndex = 0;

export const getPrecisePlanets = async (
  dateStr: string,
  timeStr: string,
  coords: { lat: number; lon: number },
  retryCount = 0
): Promise<any[]> => {
  const [year, month, date] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEYS[currentKeyIndex],
    },
    body: JSON.stringify({
      year, month, date, hours, minutes,
      seconds: 0,
      latitude: coords.lat,
      longitude: coords.lon,
      timezone: 3.0,
      observation_point: "topocentric",
    }),
  };

  try {
    const response = await fetch("https://json.freeastrologyapi.com/planets", requestOptions);

    if (response.status === 429 && retryCount < API_KEYS.length - 1) {
      console.warn(`Key ${currentKeyIndex} exhausted. Rotating...`);
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
      return getPrecisePlanets(dateStr, timeStr, coords, retryCount + 1);
    }

    const data = await response.json();
    if (!data.output || !data.output[1]) return [];

    const planetsData = data.output[1];
    return Object.keys(planetsData).map((key) => {
      const p = planetsData[key];
      return {
        nameUk: key,
        longitude: p.fullDegree,
        degree: `${Math.floor(p.normDegree || 0)}°`,
        sign: p.current_sign,
      };
    });
  } catch (error) {
    console.error("Astro API Error:", error);
    return [];
  }
};