import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { tarotDeck, type TarotCard } from "./data/tarotCards";
import { getTarotInterpretation } from "./geminiService";

const CARD_BACK_URL = "/back.jpg";

const MagicalCard = ({
  card,
  isReversed,
  index,
}: {
  card: TarotCard;
  isReversed: boolean;
  index: number;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setIsFlipped(true);
      },
      800 + index * 1000,
    );
    return () => clearTimeout(timer);
  }, [index, card]);

  return (
    <div
      className={`flip-card h-[400px] w-[240px] relative magical-card-container ${isFlipped ? "flipped" : ""}`}
    >
      <div className="flip-card-inner w-full h-full shadow-2xl">
        <div className="flip-card-front bg-magical-depth border-2 border-magical-accent p-1.5 flex items-center justify-center overflow-hidden">
          <img
            src={CARD_BACK_URL}
            alt="Card Back"
            className="w-full h-full object-cover rounded-md"
          />
        </div>

        <div className="flip-card-back bg-magical-depth border border-gray-800 p-3 flex flex-col items-center overflow-hidden">
          <div className="relative w-full h-full rounded-lg overflow-hidden">
            <img
              src={card.image}
              alt={card.nameEn}
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${
                isReversed ? "rotate-180" : ""
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3 text-center">
              <p className="text-xl font-bold text-white uppercase">
                {card.name}
              </p>
              <p className="text-[10px] text-magical-gold uppercase opacity-80">
                {card.nameEn}
              </p>
              {isReversed && (
                <p className="text-[10px] text-red-400 font-bold mt-1">
                  (ПЕРЕВЕРНУТА)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [query, setQuery] = useState<string>("Що чекає мене завтра?");
  const [drawnCards, setDrawnCards] = useState<
    { card: TarotCard; isReversed: boolean }[]
  >([]);
  const [interpretation, setInterpretation] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [cardCount, setCardCount] = useState<number>(3);

  const drawCards = (count: number) => {
    setIsShuffling(true);
    setDrawnCards([]);
    setInterpretation("");

    setTimeout(() => {
      const shuffled = [...tarotDeck].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count).map((card) => ({
        card,
        isReversed: Math.random() < 0.5,
      }));
      setDrawnCards(selected);
      setIsShuffling(false);
    }, 1500);
  };

  const handleDivine = async () => {
    if (!query.trim() || drawnCards.length === 0) return;
    setIsLoading(true);
    setInterpretation("");
    try {
      const result = await getTarotInterpretation(query, drawnCards);
      setInterpretation(result);
    } catch (error) {
      console.error("Помилка Gemini:", error);
      setInterpretation(
        "Вибачте, духи не змогли дати відповідь. Спробуйте пізніше.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl min-h-screen">
      <header className="text-center mb-16 relative">
        <div className="absolute inset-x-0 -top-10 flex justify-center opacity-10 blur-xl">
          <div className="w-64 h-64 bg-magical-accent rounded-full"></div>
        </div>
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-magical-accent via-white to-magical-gold mb-3 tracking-tight relative">
          Whisper of Fate
        </h1>
        <p className="text-lg text-gray-400 font-light tracking-wide">
          Ваш персональний цифровий оракул
        </p>
      </header>

      <section className="bg-magical-depth/60 border border-gray-800 p-8 rounded-3xl shadow-2xl mb-16 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex gap-2 p-1 bg-magical-dark rounded-xl border border-gray-700 shrink-0">
            <button 
              onClick={() => setCardCount(1)}
              className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${cardCount === 1 ? 'bg-magical-accent text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              1 карта
            </button>
            <button 
              onClick={() => setCardCount(3)}
              className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${cardCount === 3 ? 'bg-magical-accent text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              3 карти
            </button>
          </div>

          <div className="flex-grow w-full">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ваше питання до карт..."
              className="w-full p-4 bg-magical-dark/50 text-white rounded-xl border border-gray-700 focus:ring-2 focus:ring-magical-accent focus:border-transparent text-lg outline-none transition-all"
            />
          </div>
          
          <div className="flex gap-4 shrink-0">
            <button
              onClick={() => drawCards(cardCount)}
              disabled={isShuffling}
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-full text-white font-semibold transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <span>{isShuffling ? "🔮" : "🎴"}</span>
              {isShuffling ? "Тасую..." : drawnCards.length > 0 ? "Новий розклад" : "Розкласти карти"}
            </button>
          </div>
        </div>
      </section>

      {isShuffling && (
        <div className="flex justify-center items-center h-96">
          <div className="relative w-32 h-48">
            <div className="absolute inset-0 bg-magical-accent rounded-xl animate-ping opacity-20"></div>
            <img 
              src={CARD_BACK_URL} 
              className="w-full h-full rounded-xl border-2 border-magical-gold animate-bounce object-cover shadow-2xl" 
              alt="Shuffling" 
            />
          </div>
        </div>
      )}

      {!isShuffling && drawnCards.length > 0 && (
        <section className="mb-16">
          <div className="flex justify-center gap-6 md:gap-10 flex-wrap mb-12">
            {drawnCards.map((drawn, index) => (
              <MagicalCard
                key={`${drawn.card.id}-${index}`}
                card={drawn.card}
                isReversed={drawn.isReversed}
                index={index}
              />
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleDivine}
              disabled={isLoading}
              className={`px-12 py-5 rounded-full text-xl font-bold text-white transition-all transform hover:scale-105 active:scale-95
                ${
                  isLoading
                    ? "bg-gray-700 cursor-not-allowed opacity-70"
                    : "bg-gradient-to-r from-purple-700 via-magical-accent to-purple-700 shadow-xl shadow-magical-accent/30 hover:shadow-magical-accent/50"
                }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  Духи міркують...
                </span>
              ) : (
                "✨ Отримати пояснення"
              )}
            </button>
          </div>
        </section>
      )}

      {!isShuffling && interpretation && (
        <section className="max-w-5xl mx-auto bg-magical-depth border border-gray-800 p-10 md:p-16 rounded-[2rem] shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-magical-gold/5 rounded-full blur-3xl"></div>

          <h3 className="text-4xl font-extrabold mb-10 text-white flex items-center gap-4 relative">
            <span className="text-magical-gold text-5xl">✦</span> Відповідь Оракула
          </h3>

          <div
            className="prose prose-invert prose-purple prose-lg max-w-none text-gray-300 leading-relaxed relative
                        prose-headings:text-white prose-headings:font-bold 
                        prose-a:text-magical-accent prose-strong:text-magical-gold
                        prose-ol:list-decimal prose-ul:list-disc"
          >
            <ReactMarkdown>{interpretation}</ReactMarkdown>
          </div>
        </section>
      )}
    </div>
  );
}

export default App; 