import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { tarotDeck, type TarotCard } from "../data/tarotCards";
import { getTarotInterpretation } from "../geminiService";

const CARD_BACK_URL = "/back.jpg";
const QR_CODE_URL = "/qr-code.png";

const MagicalCard = ({
  card,
  isReversed,
  isRevealed,
  delay,
  isLarge,
}: {
  card: TarotCard;
  isReversed: boolean;
  isRevealed: boolean;
  delay: number;
  isLarge?: boolean;
}) => {
  const [shouldFlip, setShouldFlip] = useState(false);

  useEffect(() => {
    if (isRevealed) {
      const timer = setTimeout(() => setShouldFlip(true), delay);
      return () => clearTimeout(timer);
    } else {
      setShouldFlip(false);
    }
  }, [isRevealed, delay]);

  const sizeClasses = isLarge
    ? "h-[280px] w-[180px] md:h-[550px] md:w-[330px]"
    : "h-[160px] w-[100px] md:h-[400px] md:w-[240px]";

  return (
    <div
      className={`flip-card ${sizeClasses} relative ${shouldFlip ? "flipped" : ""}`}
    >
      <div className="flip-card-inner w-full h-full shadow-[0_0_30px_rgba(168,85,247,0.4)] rounded-2xl border border-magical-accent/50">
        <div className="flip-card-front bg-magical-depth p-1 flex items-center justify-center overflow-hidden rounded-2xl">
          <img
            src={CARD_BACK_URL}
            crossOrigin="anonymous"
            alt="Card Back"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>

        <div className="flip-card-back bg-magical-depth p-1 flex flex-col items-center overflow-hidden rounded-2xl">
          <div className="relative w-full h-full rounded-xl overflow-hidden ring-2 ring-magical-gold/50 ring-inset">
            <img
              src={card.image}
              alt={card.nameEn}
              crossOrigin="anonymous"
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${isReversed ? "rotate-180" : ""}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
            <div className="absolute bottom-2 md:bottom-4 left-1 right-1 text-center">
              <p
                className={`${isLarge ? "text-sm md:text-2xl" : "text-[10px] md:text-xl"} font-bold text-white uppercase tracking-tight leading-none`}
              >
                {card.name}
              </p>
              {isReversed && (
                <p
                  className={`${isLarge ? "text-[9px] md:text-xs" : "text-[7px] md:text-[10px]"} text-red-400 font-bold mt-1 tracking-wider uppercase`}
                >
                  Перевернута
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShareOverlay = ({
  cards,
  query,
  quote,
  onClose,
}: {
  cards: { card: TarotCard; isReversed: boolean }[];
  query: string;
  quote: string;
  onClose: () => void;
}) => {
  const isSingle = cards.length === 1;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute top-4 right-6 z-[110] text-white/30 hover:text-white text-4xl p-2"
      >
        ✕
      </button>

      <div className="relative w-full max-w-[380px] aspect-[9/16] bg-gradient-to-b from-[#1a1a2e] to-[#0f0c29] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col p-8 mt-12 mb-4">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/30 via-transparent to-transparent"></div>

        <div className="relative z-10 flex flex-col h-full items-center">
          <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/10 mb-6">
            <p className="text-white text-sm font-medium leading-relaxed text-center italic">
              {query}
            </p>
          </div>

          <div className="flex gap-3 justify-center mb-6">
            {cards.map((item, i) => (
              <div
                key={i}
                className={`relative rounded-xl overflow-hidden shadow-2xl border border-magical-gold/30 ${
                  isSingle ? "w-44 aspect-[2/3.2]" : "w-20 aspect-[2/3.5]"
                } ${item.isReversed ? "rotate-180" : ""}`}
              >
                <div className="absolute inset-0 bg-magical-depth p-1 rounded-2xl border border-magical-accent/50 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                  <div className="relative w-full h-full rounded-xl overflow-hidden ring-2 ring-magical-gold/50 ring-inset">
                    <img
                      src={item.card.image}
                      className="w-full h-full object-cover"
                      alt="Card"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 flex items-center justify-center w-full px-2">
            <div className="relative p-6 rounded-3xl bg-black/20 border border-white/5 backdrop-blur-sm w-full">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-magical-gold text-2xl"></span>
              <p className="text-white text-lg md:text-xl font-serif italic font-bold leading-snug text-center break-words">
                {quote}
              </p>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-magical-gold text-2xl rotate-180"></span>
            </div>
          </div>

          <div className="mt-auto pt-6 flex flex-col items-center gap-4">
            <div className="p-1.5 bg-white rounded-xl">
              <img src={QR_CODE_URL} alt="QR" className="w-10 h-10" />
            </div>
            <p className="text-magical-gold text-[9px] font-bold tracking-[0.3em] uppercase opacity-50">
              Зроби свій розклад
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TarotPage() {
  const [query, setQuery] = useState<string>("Що чекає мене завтра?");
  const [cardCount, setCardCount] = useState<number>(3);
  const [isTrollMode, setIsTrollMode] = useState<boolean>(false);
  const [drawnCards, setDrawnCards] = useState<
    { card: TarotCard; isReversed: boolean }[]
  >([]);
  const [interpretation, setInterpretation] = useState<string>("");
  const [keyQuote, setKeyQuote] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [areCardsRevealed, setAreCardsRevealed] = useState<boolean>(false);
  const [showShareOverlay, setShowShareOverlay] = useState<boolean>(false);

  useEffect(() => {
    const placeholders = Array(cardCount)
      .fill(null)
      .map(() => ({
        card: tarotDeck[0],
        isReversed: false,
      }));
    setDrawnCards(placeholders);
    setAreCardsRevealed(false);
    setInterpretation("");
  }, [cardCount]);

  const handleDivine = async () => {
    if (!query.trim()) return;

    setAreCardsRevealed(false);
    setInterpretation("");

    await new Promise((r) => setTimeout(r, 300));
    setIsLoading(true);

    const shuffled = [...tarotDeck].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, cardCount).map((card) => ({
      card,
      isReversed: Math.random() < 0.25,
    }));

    setDrawnCards(selected);

    try {
      const fullResponse = await getTarotInterpretation(
        query,
        selected,
        isTrollMode,
      );
      const quoteMatch = fullResponse.match(/\[QUOTE\](.*?)\[\/QUOTE\]/s);
      let finalQuote = "";
      let finalText = fullResponse;

      if (quoteMatch && quoteMatch[1].trim()) {
        finalQuote = quoteMatch[1].trim();
        finalText = fullResponse.replace(/\[QUOTE\].*?\[\/QUOTE\]/s, "").trim();
      } else {
        const sentences = fullResponse
          .replace(/\[QUOTE\]|\[\/QUOTE\]/g, "")
          .split(/[.!?]/);
        finalQuote = sentences[0].trim() || "Ваше передбачення готове";
        finalText = fullResponse.replace(/\[QUOTE\]|\[\/QUOTE\]/g, "").trim();
      }

      setKeyQuote(finalQuote);
      setInterpretation(finalText);
      setAreCardsRevealed(true);
    } catch (error) {
      setInterpretation("🚨 Помилка зв'язку з духами.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-700 md:p-0 overflow-x-hidden">
      <section className="mb-12 mt-4 md:mt-8">
        <div className="flex justify-center items-center gap-2 md:gap-10 mb-10 min-h-[280px] md:min-h-[550px]">
          {drawnCards.map((drawn, index) => (
            <MagicalCard
              key={index}
              card={drawn.card}
              isReversed={drawn.isReversed}
              isRevealed={areCardsRevealed}
              delay={index * 600}
              isLarge={cardCount === 1}
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleDivine}
            disabled={isLoading}
            className={`w-full max-w-sm py-4 md:py-5 rounded-3xl text-lg md:text-xl font-bold text-white transition-all transform active:scale-95 shadow-xl ${
              isLoading
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-700 to-magical-accent shadow-magical-accent/30 hover:shadow-magical-accent/50"
            }`}
          >
            {isLoading ? "Духи міркують..." : "✨ Зробити розклад"}
          </button>

          {interpretation && !isLoading && (
            <button
              onClick={() => setShowShareOverlay(true)}
              className="w-full max-w-xs py-3.5 rounded-3xl text-md font-semibold text-black bg-white hover:bg-magical-gold transition-all flex items-center justify-center gap-2 animate-in fade-in zoom-in active:scale-95 shadow-lg"
            >
              📸 Поділитись
            </button>
          )}
        </div>
      </section>

      <section className="bg-magical-depth/60 border border-gray-800 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl mb-16 backdrop-blur-sm max-w-4xl mx-auto">
        <div className="flex flex-col gap-6 md:gap-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <h2 className="text-sm md:text-xl font-bold text-white/80 uppercase tracking-widest text-center md:text-left">
              Налаштування
            </h2>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 w-full md:w-auto">
                <button
                  onClick={() => setIsTrollMode(false)}
                  className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-xl font-bold transition-all text-xs md:text-sm ${!isTrollMode ? "bg-magical-accent text-white" : "text-gray-400"}`}
                >
                  Серйозний
                </button>
                <button
                  onClick={() => setIsTrollMode(true)}
                  className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-xl font-bold transition-all text-xs md:text-sm ${isTrollMode ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]" : "text-gray-400"}`}
                >
                  Стібний 🔥
                </button>
              </div>

              <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 w-full md:w-auto">
                <button
                  onClick={() => setCardCount(1)}
                  className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-xl font-bold transition-all text-xs md:text-sm ${cardCount === 1 ? "bg-magical-accent text-white" : "text-gray-400"}`}
                >
                  1 карта
                </button>
                <button
                  onClick={() => setCardCount(3)}
                  className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-xl font-bold transition-all text-xs md:text-sm ${cardCount === 3 ? "bg-magical-accent text-white" : "text-gray-400"}`}
                >
                  3 карти
                </button>
              </div>
            </div>
          </div>

          <div className="w-full border-t border-white/10 pt-4 md:pt-6">
            <label className="block text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase mb-2 ml-2">
              Ваше питання
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-4 md:p-5 bg-black/30 text-white rounded-2xl border border-white/10 focus:border-magical-accent outline-none transition-all text-md md:text-lg"
              placeholder="Що чекає мене завтра?"
            />
          </div>
        </div>
      </section>

      {interpretation && !isLoading && (
        <section className="max-w-4xl mx-auto bg-magical-depth border border-white/5 p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-8 duration-1000 mb-20">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-magical-gold/30"></div>
            <span className="text-magical-gold text-2xl">✦</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-magical-gold/30"></div>
          </div>
          <div className="prose prose-invert prose-purple md:prose-lg max-w-none text-gray-300 leading-relaxed font-serif md:text-left prose-ul:list-none prose-ul:pl-0">
            <ReactMarkdown>{interpretation}</ReactMarkdown>
          </div>
        </section>
      )}

      <div className="fixed inset-0 bg-magical-dark z-[200] flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
        <div className="w-10 h-10 border-2 border-magical-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-magical-gold text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">
          Зв'язок з астралом...
        </p>
      </div>

      {showShareOverlay && (
        <ShareOverlay
          cards={drawnCards}
          query={query}
          quote={keyQuote}
          onClose={() => setShowShareOverlay(false)}
        />
      )}
    </div>
  );
}
