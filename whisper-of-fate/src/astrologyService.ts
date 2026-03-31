import * as Astronomy from 'astronomy-engine';

export function getHoroscopeData(date: Date, latitude: number, longitude: number) {
  try {
    // Список тіл через Enum бібліотеки
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

    const signs = ["Овен", "Телець", "Близнюки", "Рак", "Лев", "Діва", "Терези", "Скорпіон", "Стрілець", "Козеріг", "Водолій", "Риби"];

    const planets = bodyList.map((b) => {
      // ПРАВИЛЬНА функція для довготи
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
    return { planets: [], houses: [], error: error.message };
  }
}