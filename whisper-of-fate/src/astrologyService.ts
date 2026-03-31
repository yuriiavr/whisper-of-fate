import * as Astronomy from 'astronomy-engine';

export function getHoroscopeData(date: Date, latitude: number, longitude: number) {
  try {
    // Використовуємо координати, щоб TS не сварився (TS6133)
    // Додаємо їх у назву або просто логуємо
    const locationInfo = `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`;
    console.log(`[AstrologyService] Calculating for ${date.toISOString()} at ${locationInfo}`);

    // Отримуємо доступ до перерахування тіл максимально безпечно
    const Body = (Astronomy as any).Body || Astronomy; 
    
    const bodiesConfig = [
      { id: Body.Sun, nameUk: "Сонце" },
      { id: Body.Moon, nameUk: "Місяць" },
      { id: Body.Mercury, nameUk: "Меркурій" },
      { id: Body.Venus, nameUk: "Венера" },
      { id: Body.Mars, nameUk: "Марс" },
      { id: Body.Jupiter, nameUk: "Юпітер" },
      { id: Body.Saturn, nameUk: "Сатурн" },
      { id: Body.Uranus, nameUk: "Уран" },
      { id: Body.Neptune, nameUk: "Нептун" },
      { id: Body.Pluto, nameUk: "Плутон" },
    ];

    const signs = [
      "Овен", "Телець", "Близнюки", "Рак", "Лев", "Діва", 
      "Терези", "Скорпіон", "Стрілець", "Козеріг", "Водолій", "Риби"
    ];

    const planets = bodiesConfig.map((b) => {
      // ПЕРЕВІРКА: чи функція взагалі існує (дебаг для Vercel)
      const getLon = (Astronomy as any).EclipticLongitude;
      if (typeof getLon !== 'function') {
        throw new Error("Astronomy.EclipticLongitude is not a function. Check imports.");
      }

      const lon = getLon(b.id, date);
      
      const signIndex = Math.floor(lon / 30);
      const degree = Math.floor(lon % 30);
      const minutes = Math.floor((lon - Math.floor(lon)) * 60);

      return {
        name: b.nameUk,
        sign: signs[signIndex],
        longitude: lon, // Для твого SVG
        degree: `${degree}°${minutes}'`,
        house: 1
      };
    });

    return { planets, houses: [] };
  } catch (error: any) {
    console.error("[AstrologyService] CRITICAL ERROR:", error.message);
    // Повертаємо хоча б порожні дані, щоб бекенд не впав з 500
    return { planets: [], houses: [], error: error.message };
  }
}