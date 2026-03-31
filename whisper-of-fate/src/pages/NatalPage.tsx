import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  getNatalInterpretation,
  getSynastryInterpretation,
} from "../geminiService";
import { searchCity } from "../geoService";
import { getPrecisePlanets } from "../utils/astroEngine";

type PersonData = {
  name: string;
  date: string;
  time: string;
  city: string;
  coords: { lat: number; lon: number } | null;
};

function NatalVisual({ planets }: { planets: any[] }) {
  const radius = 120;
  const centerX = 150;
  const centerY = 150;

  return (
    <div className="flex justify-center my-8">
      <svg
        width="300"
        height="300"
        viewBox="0 0 300 300"
        className="drop-shadow-2xl"
      >
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#4c1d95"
          strokeWidth="2"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={radius - 20}
          fill="none"
          stroke="#1e1b4b"
          strokeWidth="1"
          opacity="0.5"
        />

        {planets?.map((p, i) => {
          const angle = (p.longitude - 90) * (Math.PI / 180);
          const x = centerX + (radius - 10) * Math.cos(angle);
          const y = centerY + (radius - 10) * Math.sin(angle);

          return (
            <g key={i}>
              <line
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="#8b5cf6"
                strokeWidth="0.5"
                opacity="0.3"
              />
              <circle
                cx={x}
                cy={y}
                r="5"
                fill="#d946ef"
                className="animate-pulse"
              />
              <text
                x={x + 8}
                y={y + 4}
                fontSize="10"
                fill="#ddd"
                className="font-mono select-none"
              >
                {p.nameUk?.substring(0, 2) || p.name?.substring(0, 2)}
              </text>
            </g>
          );
        })}
        <circle cx={centerX} cy={centerY} r="3" fill="#fff" />
      </svg>
    </div>
  );
}

export default function AstroPage() {
  const [mode, setMode] = useState<"natal" | "synastry">("natal");
  const [p1, setP1] = useState<PersonData>({
    name: "Я",
    date: "",
    time: "12:00",
    city: "",
    coords: null,
  });
  const [p2, setP2] = useState<PersonData>({
    name: "Партнер",
    date: "",
    time: "12:00",
    city: "",
    coords: null,
  });

  const [cities, setCities] = useState<{
    list: any[];
    target: "p1" | "p2" | null;
  }>({ list: [], target: null });
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCitySearch = async (val: string, target: "p1" | "p2") => {
    const setter = target === "p1" ? setP1 : setP2;
    setter((prev) => ({ ...prev, city: val }));

    if (val.length > 2) {
      const results = await searchCity(val);
      setCities({ list: results, target });
    }
  };

  const calculateAstro = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      let data;
      if (mode === "natal") {
        if (!p1.coords) return;
        const planets = await getPrecisePlanets(p1.date, p1.time, p1.coords);
        data = await getNatalInterpretation(p1, p1.coords, planets);
      } else {
        if (!p1.coords || !p2.coords) return;
        const planetsP1 = await getPrecisePlanets(p1.date, p1.time, p1.coords);
        const planetsP2 = await getPrecisePlanets(p2.date, p2.time, p2.coords);
        data = await getSynastryInterpretation(p1, p2, planetsP1, planetsP2);
      }

      if (data.error) {
        alert("Помилка: " + data.details);
      } else {
        setResult(data);
      }
    } catch (err) {
      alert("Не вдалося виконати запит.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in duration-700">
      <div className="flex gap-4 mb-8 justify-center">
        <button
          onClick={() => {
            setMode("natal");
            setResult(null);
          }}
          className={`px-6 py-2 rounded-full transition font-medium ${mode === "natal" ? "bg-magical-accent text-white shadow-lg" : "bg-gray-800 text-gray-400"}`}
        >
          Натальна карта
        </button>
        <button
          onClick={() => {
            setMode("synastry");
            setResult(null);
          }}
          className={`px-6 py-2 rounded-full transition font-medium ${mode === "synastry" ? "bg-magical-accent text-white shadow-lg" : "bg-gray-800 text-gray-400"}`}
        >
          Синастрія
        </button>
      </div>

      <div className="bg-magical-depth/40 border border-gray-800 p-8 rounded-3xl backdrop-blur-md shadow-2xl mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h3 className="text-magical-gold font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-magical-gold animate-pulse"></span>
              {mode === "synastry" ? "Ваші дані" : "Дані народження"}
            </h3>
            <input
              type="date"
              className="w-full p-3 bg-magical-dark border border-gray-700 rounded-xl text-white outline-none"
              onChange={(e) => setP1({ ...p1, date: e.target.value })}
            />
            <input
              type="time"
              className="w-full p-3 bg-magical-dark border border-gray-800 rounded-xl text-white outline-none"
              value={p1.time}
              onChange={(e) => setP1({ ...p1, time: e.target.value })}
            />
            <div className="relative">
              <input
                placeholder="Місто..."
                className="w-full p-3 bg-magical-dark border border-gray-800 rounded-xl text-white outline-none"
                value={p1.city}
                onChange={(e) => handleCitySearch(e.target.value, "p1")}
              />
              {cities.target === "p1" && cities.list.length > 0 && (
                <div className="absolute z-50 w-full bg-gray-900 border border-gray-700 rounded-xl mt-1 overflow-hidden shadow-2xl">
                  {cities.list.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 hover:bg-magical-accent cursor-pointer text-sm text-gray-200"
                      onClick={() => {
                        setP1({
                          ...p1,
                          city: c.name,
                          coords: { lat: c.lat, lon: c.lon },
                        });
                        setCities({ list: [], target: null });
                      }}
                    >
                      {c.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {mode === "synastry" && (
            <div className="space-y-4 animate-in slide-in-from-right duration-500">
              <h3 className="text-purple-400 font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                Партнер
              </h3>
              <input
                type="date"
                className="w-full p-3 bg-magical-dark border border-gray-700 rounded-xl text-white outline-none"
                onChange={(e) => setP2({ ...p2, date: e.target.value })}
              />
              <input
                type="time"
                className="w-full p-3 bg-magical-dark border border-gray-700 rounded-xl text-white outline-none"
                value={p2.time}
                onChange={(e) => setP2({ ...p2, time: e.target.value })}
              />
              <div className="relative">
                <input
                  placeholder="Місто..."
                  className="w-full p-3 bg-magical-dark border border-gray-700 rounded-xl text-white outline-none"
                  value={p2.city}
                  onChange={(e) => handleCitySearch(e.target.value, "p2")}
                />
                {cities.target === "p2" && cities.list.length > 0 && (
                  <div className="absolute z-50 w-full bg-gray-900 border border-gray-700 rounded-xl mt-1 overflow-hidden shadow-2xl">
                    {cities.list.map((c, i) => (
                      <div
                        key={i}
                        className="p-3 hover:bg-magical-accent cursor-pointer text-sm text-gray-200"
                        onClick={() => {
                          setP2({
                            ...p2,
                            city: c.name,
                            coords: { lat: c.lat, lon: c.lon },
                          });
                          setCities({ list: [], target: null });
                        }}
                      >
                        {c.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={calculateAstro}
          disabled={
            isLoading || !p1.coords || (mode === "synastry" && !p2.coords)
          }
          className={`w-full mt-8 py-4 bg-gradient-to-r from-magical-accent to-purple-800 rounded-xl text-white font-bold transition-all transform active:scale-95 shadow-lg ${isLoading ? "opacity-70" : "hover:shadow-purple-500/40"}`}
        >
          {isLoading
            ? "Магія відбувається..."
            : mode === "natal"
              ? "Розрахувати натал"
              : "Перевірити сумісність"}
        </button>
      </div>

      {result && (
        <div className="bg-magical-depth/60 p-8 rounded-3xl border border-gray-800 animate-in zoom-in duration-500">
          <h3 className="text-2xl font-bold text-white mb-2">
            {mode === "natal" ? "Аналіз долі" : "Результат сумісності"}
          </h3>

          {result.planets && <NatalVisual planets={result.planets} />}

          <div className="prose prose-invert prose-purple max-w-none">
            <ReactMarkdown>{result.interpretation}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
