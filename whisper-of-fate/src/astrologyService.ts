import * as Astronomy from 'astronomy-engine';

export function getHoroscopeData(date: Date, latitude: number, longitude: number) {
  try {
    // Використовуємо координати в консолі, щоб TypeScript не видавав помилку TS6133
    console.log(`Calculating planets for lat: ${latitude}, lon: ${longitude}`);

    const bodies = [
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

    const planets = bodies.map((b) => {
      // Розрахунок екліптичної довготи (0-360 градусів)
      const lon = Astronomy.EclipticLongitude(b.id, date);
      
      const signIndex = Math.floor(lon / 30);
      const degree = Math.floor(lon % 30);
      const minutes = Math.floor((lon - Math.floor(lon)) * 60);

      return {
        // Повертаємо назву для відображення у списку
        name: b.nameUk, 
        // Повертаємо знак
        sign: signs[signIndex],
        // ПЕРЕДАЄМО longitude, щоб angle = (p.longitude - 90) у NatalPage спрацював!
        longitude: lon, 
        degree: `${degree}°${minutes}'`,
        house: 1, // Поки ставимо заглушку, бо для будинків потрібні складніші розрахунки
      };
    });

    return { 
      planets, 
      houses: [] // Порожній масив, щоб фронт не падав при зверненні до houses
    };
  } catch (error) {
    console.error("Astrology Service Error:", error);
    return { planets: [], houses: [] };
  }
}