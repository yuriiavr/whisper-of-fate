import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { getNatalInterpretation } from "../geminiService";
import { searchCity } from "../geoService";

export default function NatalPage() {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "12:00",
    city: "",
  });
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const [cities, setCities] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCitySearch = async (val: string) => {
    setFormData({ ...formData, city: val });
    if (val.length > 2) {
      const results = await searchCity(val);
      setCities(results);
    }
  };

  const calculateNatal = async () => {
    if (!coords || !formData.date) return;
    setIsLoading(true);
    setInterpretation("");

    try {
      const data = await getNatalInterpretation(formData, coords);

      setResult({ planets: data.planets });
      setInterpretation(data.interpretation);
    } catch (err) {
      console.error(err);
      setInterpretation("Помилка при розрахунку зірок. Спробуйте ще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
      <div className="bg-magical-depth/40 border border-gray-800 p-8 rounded-3xl backdrop-blur-md shadow-2xl mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-magical-gold">✨</span> Параметри народження
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-2">
              Дата народження
            </label>
            <input
              type="date"
              className="w-full p-3 bg-magical-dark border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-magical-accent"
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-2">
              Точний час
            </label>
            <input
              type="time"
              className="w-full p-3 bg-magical-dark border border-gray-700 rounded-xl text-white outline-none"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
            />
          </div>
          <div className="relative md:col-span-2">
            <label className="block text-xs text-gray-500 uppercase mb-2">
              Місце народження
            </label>
            <input
              type="text"
              placeholder="Почніть вводити місто..."
              className="w-full p-3 bg-magical-dark border border-gray-700 rounded-xl text-white outline-none"
              value={formData.city}
              onChange={(e) => handleCitySearch(e.target.value)}
            />
            {cities.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-magical-dark border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                {cities.map((c, i) => (
                  <div
                    key={i}
                    className="p-3 hover:bg-magical-accent/20 cursor-pointer text-sm text-gray-300 border-b border-gray-800 last:border-0"
                    onClick={() => {
                      setCoords({ lat: c.lat, lon: c.lon });
                      setFormData({ ...formData, city: c.name });
                      setCities([]);
                    }}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={calculateNatal}
          disabled={isLoading || !coords}
          className="w-full mt-8 py-4 bg-gradient-to-r from-magical-accent to-purple-800 rounded-xl text-white font-bold text-lg hover:shadow-lg hover:shadow-magical-accent/20 transition-all disabled:opacity-50"
        >
          {isLoading ? "Розрахунок зірок..." : "Згенерувати натальну карту"}
        </button>
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-1 bg-black/30 p-6 rounded-2xl border border-gray-800">
            <h3 className="text-magical-gold font-bold mb-4 uppercase text-xs tracking-widest">
              Позиції планет
            </h3>
            <div className="space-y-3">
              {result.planets.map((p: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between text-sm border-b border-gray-900 pb-1"
                >
                  <span className="text-gray-400">{p.name}</span>
                  <span className="text-white font-medium">{p.sign}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-magical-depth/60 p-8 rounded-3xl border border-gray-800">
            <h3 className="text-2xl font-bold text-white mb-6">Аналіз долі</h3>
            <div className="prose prose-invert prose-purple max-w-none">
              <ReactMarkdown>{interpretation}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
