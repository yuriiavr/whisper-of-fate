import * as Astronomy from 'astronomy-engine';

export function getHoroscopeData(date: Date, latitude: number, longitude: number) {
  try {
    // Astronomy Engine використовує стандартні об'єкти Date
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
      // Отримуємо екліптичну довготу
      const lon = Astronomy.EclipticLongitude(b.id, date);
      
      const signIndex = Math.floor(lon / 30);
      const degree = Math.floor(lon % 30);
      const minutes = Math.floor((lon - Math.floor(lon)) * 60);

      return {
        nameUk: b.nameUk,
        name: b.id.toString(), // Для сумісності
        sign: signs[signIndex],
        longitude: lon, // Це важливо для твого SVG у NatalPage.tsx
        degree: `${degree}°${minutes}'`,
      };
    });

    // Будинки в astronomy-engine розраховуються окремо, 
    // але для базового візуалу планет цього вже достатньо
    return { planets, houses: [] };
  } catch (error) {
    console.error("Помилка в astrologyService:", error);
    return { planets: [], houses: [] };
  }
}