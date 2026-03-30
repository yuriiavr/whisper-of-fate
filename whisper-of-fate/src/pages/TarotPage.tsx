import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { tarotDeck, type TarotCard } from "../data/tarotCards";
import { getTarotInterpretation } from "../geminiService";

const CARD_BACK_URL = "/back.jpg";
const STORY_BG_URL = "/story-bg.png";
const APP_LOGO_URL = "/logo.png";
const QR_CODE_URL = "/qr-code.png";

const MagicalCard = ({
  card,
  isReversed,
  isRevealed,
}: {
  card: TarotCard;
  isReversed: boolean;
  isRevealed: boolean;
}) => {
  return (
    <div className={`flip-card h-[400px] w-[240px] relative ${isRevealed ? "flipped" : ""}`}>
      <div className="flip-card-inner w-full h-full shadow-2xl">
        <div className="flip-card-front bg-magical-depth border-2 border-magical-accent p-1.5 flex items-center justify-center overflow-hidden rounded-2xl">
          <img
            src={CARD_BACK_URL}
            crossOrigin="anonymous"
            alt="Card Back"
            className="w-full h-full object-cover rounded-md"
          />
        </div>

        <div className="flip-card-back bg-magical-depth border border-gray-800 p-3 flex flex-col items-center overflow-hidden rounded-2xl">
          <div className="relative w-full h-full rounded-lg overflow-hidden">
            <img
              src={card.image}
              alt={card.nameEn}
              crossOrigin="anonymous"
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${isReversed ? "rotate-180" : ""}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3 text-center">
              <p className="text-xl font-bold text-white uppercase tracking-tight">{card.name}</p>
              <p className="text-[10px] text-magical-gold uppercase opacity-80 tracking-widest">{card.nameEn}</p>
              {isReversed && (
                <p className="text-[10px] text-red-400 font-bold mt-1 tracking-wider">(ПЕРЕВЕРНУТА)</p>
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
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-[110] text-white/50 hover:text-white text-4xl transition-colors"
      >
        ✕
      </button>

      <div
        className="relative w-full max-w-[420px] aspect-[9/16] bg-cover bg-center rounded-[2.5rem] overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.3)] border border-white/10"
        style={{ backgroundImage: `url(${STORY_BG_URL})` }}
      >
        <div className="absolute inset-0 flex flex-col items-center pt-14 pb-10 px-8 text-center bg-black/20">
          <img src={APP_LOGO_URL} alt="Logo" className="w-44 mb-6 drop-shadow-lg" />

          <p className="text-white/80 text-xs font-bold uppercase tracking-[0.2em] mb-12 px-4 leading-relaxed">
            {query}
          </p>

          <div className="flex gap-3 justify-center mb-10">
            {cards.map((item, i) => (
              <div
                key={i}
                className={`relative w-24 aspect-[2/3.5] rounded-xl overflow-hidden shadow-2xl border border-white/20 transition-transform ${item.isReversed ? "rotate-180" : ""}`}
              >
                <img src={item.card.image} className="w-full h-full object-cover" alt="Card" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            ))}
          </div>

          <div className="flex-1 flex items-center justify-center px-2">
            <p className="text-white text-2xl md:text-3xl font-serif italic font-bold leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              {quote}
            </p>
          </div>

          <div className="mt-auto flex flex-col items-center gap-4">
            <div className="p-2 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
              <img src={QR_CODE_URL} alt="QR" className="w-16 h-16 opacity-90" />
            </div>
            <p className="text-magical-gold text-[10px] font-bold tracking-widest uppercase opacity-70">
              whisper-of-fate.vercel.app
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 text-white/40 text-sm font-medium tracking-wide animate-pulse">
        Зроби скріншот, щоб поділитись ✨
      </div>
    </div>
  );
};

export default function TarotPage() {
  const [query, setQuery] = useState<string>("Що чекає мене завтра?");
  const [cardCount, setCardCount] = useState<number>(3);
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCard; isReversed: boolean }[]>([]);
  const [interpretation, setInterpretation] = useState<string>("");
  const [keyQuote, setKeyQuote] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [areCardsRevealed, setAreCardsRevealed] = useState<boolean>(false);
  const [isPreloading, setIsPreloading] = useState<boolean>(true);
  const [showShareOverlay, setShowShareOverlay] = useState<boolean>(false);

  useEffect(() => {
    const placeholders = Array(cardCount).fill(null).map(() => ({
      card: tarotDeck[0], 
      isReversed: false,
    }));
    setDrawnCards(placeholders);
    setAreCardsRevealed(false);
    setInterpretation("");
  }, [cardCount]);

  useEffect(() => {
    const preloadImages = async () => {
      try {
        const urlsToPreload = [CARD_BACK_URL, STORY_BG_URL, APP_LOGO_URL, QR_CODE_URL, ...tarotDeck.map((card) => card.image)];
        const loadImage = (url: string) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
          });
        };
        await Promise.all(urlsToPreload.map(loadImage));
      } catch (error) {
        console.error("Error preloading images:", error);
      } finally {
        setIsPreloading(false);
      }
    };
    preloadImages();
  }, []);

  const handleDivine = async () => {
    if (!query.trim()) return;
    
    setAreCardsRevealed(false);
    setInterpretation("");
    
    await new Promise(r => setTimeout(r, 300));
    
    setIsLoading(true);

    const shuffled = [...tarotDeck].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, cardCount).map((card) => ({
      card,
      isReversed: Math.random() < 0.25,
    }));

    setDrawnCards(selected);

    try {
      const fullResponse = await getTarotInterpretation(query, selected);
      const quoteMatch = fullResponse.match(/\[QUOTE\](.*?)\[\/QUOTE\]/s);
      let finalQuote = "";
      let finalText = fullResponse;

      if (quoteMatch && quoteMatch[1].trim()) {
        finalQuote = quoteMatch[1].trim();
        finalText = fullResponse.replace(/\[QUOTE\].*?\[\/QUOTE\]/s, "").trim();
      } else {
        const sentences = fullResponse.replace(/\[QUOTE\]|\[\/QUOTE\]/g, "").split(/[.!?]/);
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
    <div className="animate-in fade-in duration-700 p-4 md:p-0">
      <section className="mb-12 mt-8">
        <div className="flex justify-center gap-4 md:gap-10 flex-wrap mb-10 min-h-[400px]">
          {drawnCards.map((drawn, index) => (
            <MagicalCard
              key={index}
              card={drawn.card}
              isReversed={drawn.isReversed}
              isRevealed={areCardsRevealed}
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-6">
          <button
            onClick={handleDivine}
            disabled={isLoading}
            className={`w-full max-w-sm py-5 rounded-3xl text-xl font-bold text-white transition-all transform active:scale-95 shadow-xl ${
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
              className="w-full max-w-xs py-4 rounded-3xl text-lg font-semibold text-black bg-white hover:bg-magical-gold transition-all flex items-center justify-center gap-2 animate-in fade-in zoom-in active:scale-95 shadow-lg"
            >
              📸 Поділитись
            </button>
          )}
        </div>
      </section>

      <section className="bg-magical-depth/60 border border-gray-800 p-6 md:p-10 rounded-[2.5rem] shadow-2xl mb-16 backdrop-blur-sm max-w-4xl mx-auto">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <h2 className="text-xl font-bold text-white/80 uppercase tracking-widest text-center md:text-left">
              Налаштування
            </h2>
            <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
              <button
                onClick={() => setCardCount(1)}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${cardCount === 1 ? "bg-magical-accent text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
              >
                🃏 1 карта
              </button>
              <button
                onClick={() => setCardCount(3)}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${cardCount === 3 ? "bg-magical-accent text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
              >
                🎴 3 карти
              </button>
            </div>
          </div>

          <div className="w-full border-t border-white/10 pt-6">
            <label className="block text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase mb-3 ml-2">
              Ваше питання до Всесвіту
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-5 bg-black/30 text-white rounded-2xl border border-white/10 focus:border-magical-accent outline-none transition-all placeholder:text-gray-700 text-lg"
              placeholder="Що чекає мене завтра?"
            />
          </div>
        </div>
      </section>

      {interpretation && !isLoading && (
        <section className="max-w-4xl mx-auto bg-magical-depth border border-white/5 p-6 md:p-12 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-8 duration-1000 mb-20">
          <div className="flex items-center justify-center gap-4 mb-8">
             <div className="h-px flex-1 bg-gradient-to-r from-transparent to-magical-gold/30"></div>
             <span className="text-magical-gold text-2xl">✦</span>
             <div className="h-px flex-1 bg-gradient-to-l from-transparent to-magical-gold/30"></div>
          </div>
          <div className="prose prose-invert prose-purple md:prose-lg max-w-none text-gray-300 leading-relaxed font-serif text-center md:text-left">
            <ReactMarkdown>{interpretation}</ReactMarkdown>
          </div>
        </section>
      )}

      {isPreloading && (
        <div className="fixed inset-0 bg-magical-dark z-[200] flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
          <div className="w-10 h-10 border-2 border-magical-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-magical-gold text-xs font-bold uppercase tracking-[0.3em] animate-pulse">
            Зв'язок з астралом...
          </p>
        </div>
      )}

      {showShareOverlay && (
        <ShareOverlay cards={drawnCards} query={query} quote={keyQuote} onClose={() => setShowShareOverlay(false)} />
      )}
    </div>
  );
}