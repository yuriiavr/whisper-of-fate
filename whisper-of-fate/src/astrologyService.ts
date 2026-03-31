import * as AstrologyModule from 'astrology-js';

const Astrology = (AstrologyModule as any).default || AstrologyModule;

export function getHoroscopeData(date: Date, latitude: number, longitude: number) {
  if (!Astrology || !Astrology.Origin) {
    console.error("Astrology library is not properly loaded");
    return { planets: [], houses: [] };
  }

  const origin = new Astrology.Origin({
    year: date.getFullYear(),
    month: date.getMonth(), 
    date: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    latitude,
    longitude,
  });

  const horoscope = new Astrology.Horoscope(origin);
  
  const planets = horoscope.CelestialBodies.all.map((p: any) => ({
    name: p.Name,
    sign: p.Sign.Name,
    house: p.House.Number,
    isRetrograde: p.IsRetrograde
  }));

  return { planets, houses: horoscope.Houses };
}