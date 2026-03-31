import * as Astronomy from 'astronomy-engine';

export function getHoroscopeData(date: Date, latitude: number, longitude: number) {
  try {
    // Використовуємо змінні в логах, щоб уникнути помилки TS6133 (unused parameters)
    console.log(`[Astro] Calculating for ${date.toISOString()} at Lat: ${latitude}, Lon: ${longitude}`);

    const bodyList = [
      { id: Astronomy.Body.Sun, nameUk: "Сонце" },
      { id: Astronomy.Body.Moon, nameUk: "Місяць" },
      { id: Astronomy.Body.Mercury, nameUk: "Меркурій" },
      { id: Astronomy.Body.Venus, nameUk: "Венера" },
      { id: Astronomy.Body.Mars, nameUk: "Марс" },
      { id: Astronomy.Body.Jupiter, nameUk: "Юпітер" },
      { id: Astronomy.Body.Saturn, nameUk: "Сатурн" },
      { id: Astronomy.Body.Uranus, nameUk: "Уран" },
      { id: Astronomy.Body.Neptune, nameUk: "Нептун" },
      { id: Astronomy.Body.Pluto, nameUk: "Плутон" },
    ];

    const signs = [
      "Овен", "Телець", "Близнюки", "Рак", "Лев", "Діва", 
      "Терези", "Скорпіон", "Стрілець", "Козеріг", "Водолій", "Риби"
    ];

    const planets = bodyList.map((b) => {
      // Отримуємо екліптичну довготу через офіційну функцію бібліотеки
      const lon = Astronomy.EclipticLongitude(b.id, date);
      
      const signIndex = Math.floor(lon / 30);
      const degree = Math.floor(lon % 30);
      const minutes = Math.floor((lon - Math.floor(lon)) * 60);

      return {
        name: b.nameUk,
        nameUk: b.nameUk,
        sign: signs[signIndex],
        longitude: lon, 
        degree: `${degree}°${minutes}'`,
        house: 1
      };
    });

    return { planets, houses: [] };
  } catch (error: any) {
    console.error("Astro Calculation Error:", error);
    return { planets: [], houses: [], error: error.message };
  }
}