import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { getNatalInterpretation, getSynastryInterpretation } from "../geminiService";
import { searchCity } from "../geoService";

type PersonData = {
  name: string;
  date: string;
  time: string;
  city: string;
  coords: { lat: number; lon: number } | null;
};

export default function AstroPage() {
  const [mode, setMode] = useState<"natal" | "synastry">("natal");
  const [p1, setP1] = useState<PersonData>({ name: "", date: "", time: "12:00", city: "", coords: null });
  const [p2, setP2] = useState<PersonData>({ name: "", date: "", time: "12:00", city: "", coords: null });
  
  const [cities, setCities] = useState<{ list: any[], target: "p1" | "p2" | null }>({ list: [], target: null });
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCitySearch = async (val: string, target: "p1" | "p2") => {
    const setter = target === "p1" ? setP1 : setP2;
    setter(prev => ({ ...prev, city: val }));
    
    if (val.length > 2) {
      const results = await searchCity(val);
      setCities({ list: results, target });
    }
  };

  const calculateAstro = async () => {
    setIsLoading(true);
    try {
      let data;
      if (mode === "natal") {
        if (!p1.coords) return;
        data = await getNatalInterpretation(p1, p1.coords);
      } else {
        if (!p1.coords || !p2.coords) return;
        data = await getSynastryInterpretation(p1, p2);
      }
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in duration-700">
      {/* Перемикач режимів */}
      <div className="flex gap-4 mb-8 justify-center">
        <button 
          onClick={() => { setMode("natal"); setResult(null); }}
          className={`px-6 py-2 rounded-full transition ${mode === 'natal' ? 'bg-magical-accent text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          Натальна карта
        </button>
        <button 
          onClick={() => { setMode("synastry"); setResult(null); }}
          className={`px-6 py-2 rounded-full transition ${mode === 'synastry' ? 'bg-magical-accent text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          Синастрія (Сумісність)
        </button>
      </div>

      <div className="bg-magical-depth/40 border border-gray-800 p-8 rounded-3xl backdrop-blur-md shadow-2xl mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Перша людина */}
          <div className="space-y-4">
            <h3 className="text-magical-gold font-bold">{mode === "synastry" ? "Партнер 1" : "Дані народження"}</h3>
            <input 
              type="date" 
              className="w-full p-3 bg-magical-dark border border-gray-700 rounded-xl text-white"
              onChange={(e) => setP1({...p1, date: e.target.value})} 
            />
            <input 
              type="time" 
              className="w-full p-3 bg-magical-dark border border-gray-800 rounded-xl text-white"
              value={p1.time}
              onChange={(e) => setP1({...p1, time: e.target.value})} 
            />
            <div className="relative">
              <input 
                placeholder="Місто..." 
                className="w-full p-3 bg-magical-dark border border-gray-800 rounded-xl text-white"
                value={p1.city}
                onChange={(e) => handleCitySearch(e.target.value, "p1")}
              />
              {cities.target === "p1" && cities.list.length > 0 && (
                <div className="absolute z-50 w-full bg-gray-900 border border-gray-700 rounded-xl mt-1">
                  {cities.list.map((c, i) => (
                    <div key={i} className="p-2 hover:bg-magical-accent cursor-pointer" onClick={() => {
                      setP1({...p1, city: c.name, coords: {lat: c.lat, lon: c.lon}});
                      setCities({list: [], target: null});
                    }}>{c.name}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Друга людина (показуємо тільки в режимі синастрії) */}
          {mode === "synastry" && (
            <div className="space-y-4">
              <h3 className="text-purple-400 font-bold">Партнер 2</h3>
              <input 
                type="date" 
                className="w-full p-3 bg-magical-dark border border-gray-700 rounded-xl text-white"
                onChange={(e) => setP2({...p2, date: e.target.value})} 
              />
              <input 
                type="time" 
                className="w-full p-3 bg-magical-dark border border-gray-700 rounded-xl text-white"
                value={p2.time}
                onChange={(e) => setP2({...p2, time: e.target.value})} 
              />
              <div className="relative">
                <input 
                  placeholder="Місто..." 
                  className="w-full p-3 bg-magical-dark border border-gray-700 rounded-xl text-white"
                  value={p2.city}
                  onChange={(e) => handleCitySearch(e.target.value, "p2")}
                />
                {cities.target === "p2" && cities.list.length > 0 && (
                  <div className="absolute z-50 w-full bg-gray-900 border border-gray-700 rounded-xl mt-1">
                    {cities.list.map((c, i) => (
                      <div key={i} className="p-2 hover:bg-magical-accent cursor-pointer" onClick={() => {
                        setP2({...p2, city: c.name, coords: {lat: c.lat, lon: c.lon}});
                        setCities({list: [], target: null});
                      }}>{c.name}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={calculateAstro}
          disabled={isLoading || !p1.coords || (mode === "synastry" && !p2.coords)}
          className="w-full mt-8 py-4 bg-gradient-to-r from-magical-accent to-purple-800 rounded-xl text-white font-bold"
        >
          {isLoading ? "Магія відбувається..." : mode === "natal" ? "Розрахувати натал" : "Перевірити сумісність"}
        </button>
      </div>

      {result && (
        <div className="bg-magical-depth/60 p-8 rounded-3xl border border-gray-800">
          <h3 className="text-2xl font-bold text-white mb-6">
            {mode === "natal" ? "Аналіз долі" : "Результат сумісності"}
          </h3>
          <div className="prose prose-invert prose-purple max-w-none">
            <ReactMarkdown>{result.interpretation}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}