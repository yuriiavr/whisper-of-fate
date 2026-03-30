import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { tarotDeck, type TarotCard } from "../data/tarotCards";
import { getTarotInterpretation } from "../geminiService";
import { ShareTemplate } from "../components/ShareTemplate";

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
    <div
      className={`flip-card h-[400px] w-[240px] relative ${isRevealed ? "flipped" : ""}`}
    >
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
              <p className="text-xl font-bold text-white uppercase tracking-tight">
                {card.name}
              </p>
              <p className="text-[10px] text-magical-gold uppercase opacity-80 tracking-widest">
                {card.nameEn}
              </p>
              {isReversed && (
                <p className="text-[10px] text-red-400 font-bold mt-1 tracking-wider">
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

export default function TarotPage() {
  const [query, setQuery] = useState<string>("Що чекає мене завтра?");
  const [drawnCards, setDrawnCards] = useState<
    { card: TarotCard; isReversed: boolean }[]
  >([]);
  const [interpretation, setInterpretation] = useState<string>("");
  const [keyQuote, setKeyQuote] = useState<string>("");
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [areCardsRevealed, setAreCardsRevealed] = useState<boolean>(false);
  const [isPreloading, setIsPreloading] = useState<boolean>(true);

  useEffect(() => {
    const preloadImages = async () => {
      try {
        const urlsToPreload = [
          CARD_BACK_URL,
          ...tarotDeck.map((card) => card.image),
        ];

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

  const drawCards = (count: number) => {
    setAreCardsRevealed(false);
    setInterpretation("");
    setKeyQuote("");

    const shuffled = [...tarotDeck].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count).map((card) => ({
      card,
      isReversed: Math.random() < 0.25,
    }));
    setDrawnCards(selected);
  };

  const handleDivine = async () => {
    if (!query.trim() || drawnCards.length === 0) return;

    setAreCardsRevealed(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsLoading(true);
    setInterpretation("");

    try {
      const fullResponse = await getTarotInterpretation(query, drawnCards);
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
    } catch (error) {
      console.error("Divine error:", error);
      setInterpretation(
        "🚨 Помилка зв'язку з духами. Спробуйте ще раз пізніше.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getBase64FromUrl = async (url: string): Promise<string> => {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result as string);
    });
  };

  const generateManualCanvas = async (
    cards: { card: TarotCard; isReversed: boolean }[],
    quote: string,
  ): Promise<string> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context failed");

    canvas.width = 1080;
    canvas.height = 1920;

    const loadImg = (url: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      });

    try {
      const [bgImg, logoImg, qrImg] = await Promise.all([
        loadImg(STORY_BG_URL),
        loadImg(APP_LOGO_URL),
        loadImg(QR_CODE_URL),
      ]);

      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      const logoW = 700;
      const logoH = logoImg.height * (logoW / logoImg.width);
      ctx.drawImage(logoImg, (canvas.width - logoW) / 2, 100, logoW, logoH);

      const cardWidth = 360;
      const cardHeight = 640;
      const cardY = 450;
      const totalWidth = cards.length * cardWidth + (cards.length - 1) * 40;
      let currentX = (canvas.width - totalWidth) / 2;

      for (const item of cards) {
        const cardImg = new Image();
        cardImg.src = await getBase64FromUrl(item.card.image);
        await new Promise((resolve) => (cardImg.onload = resolve));

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(currentX, cardY, cardWidth, cardHeight, 30);
        ctx.clip();

        if (item.isReversed) {
          ctx.translate(currentX + cardWidth / 2, cardY + cardHeight / 2);
          ctx.rotate(Math.PI);
          ctx.drawImage(
            cardImg,
            -cardWidth / 2,
            -cardHeight / 2,
            cardWidth,
            cardHeight,
          );
        } else {
          ctx.drawImage(cardImg, currentX, cardY, cardWidth, cardHeight);
        }
        ctx.restore();
        currentX += cardWidth + 40;
      }

      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.font = "italic bold 46px 'Georgia', serif";

      const wrapText = (
        c: CanvasRenderingContext2D,
        t: string,
        x: number,
        y: number,
        mw: number,
        lh: number,
      ) => {
        const words = t.split(" ");
        let line = "";
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + " ";
          if (c.measureText(testLine).width > mw && n > 0) {
            c.fillText(line, x, y);
            line = words[n] + " ";
            y += lh;
          } else {
            line = testLine;
          }
        }
        c.fillText(line, x, y);
      };

      wrapText(ctx, quote, canvas.width / 2, 1320, 850, 70);

      const qrSize = 180;
      ctx.drawImage(qrImg, (canvas.width - qrSize) / 2, 1620, qrSize, qrSize);

      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText("whisper-of-fate.vercel.app", canvas.width / 2, 1850);

      return canvas.toDataURL("image/png");
    } catch (err) {
      console.error("Canvas render error:", err);
      throw err;
    }
  };

  const handleShareToInstagram = async () => {
    if (drawnCards.length === 0 || !keyQuote) return;
    setIsSharing(true);

    try {
      const dataUrl = await generateManualCanvas(drawnCards, keyQuote);

      if (!dataUrl || dataUrl === "data:,") throw new Error("Empty image");

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "tarot-whisper.png", { type: "image/png" });

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: "Whisper of Fate",
          text: `Оракул каже: "${keyQuote}"`,
        });
      } else {
        const link = document.createElement("a");
        link.download = `tarot-whisper-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error("Manual render error:", error);
      alert("Сталася помилка при створенні зображення.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-700 p-4 md:p-0">
      {drawnCards.length > 0 && keyQuote && (
        <div style={{ position: "absolute", left: "0", top: 0, zIndex: -100 }}>
          <ShareTemplate drawnCards={drawnCards} quote={keyQuote} />
        </div>
      )}

      {drawnCards.length > 0 && (
        <section className="mb-16 mt-8">
          <div className="flex justify-center gap-6 md:gap-10 flex-wrap mb-12">
            {drawnCards.map((drawn, index) => (
              <MagicalCard
                key={`${drawn.card.id}-${index}`}
                card={drawn.card}
                isReversed={drawn.isReversed}
                isRevealed={areCardsRevealed}
              />
            ))}
          </div>

          <div className="flex flex-col items-center gap-6">
            <button
              onClick={handleDivine}
              disabled={isLoading || drawnCards.length === 0}
              className={`px-12 py-5 rounded-full text-xl font-bold text-white transition-all transform hover:scale-105 shadow-xl ${
                isLoading
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-700 to-magical-accent shadow-magical-accent/30 hover:shadow-magical-accent/50 active:scale-95"
              }`}
            >
              {isLoading ? "Духи міркують..." : "✨ Зробити розклад"}
            </button>

            {interpretation && !isLoading && (
              <button
                onClick={handleShareToInstagram}
                disabled={isSharing}
                className="px-8 py-4 rounded-full text-lg font-semibold text-black bg-white hover:bg-magical-gold transition-all flex items-center gap-2 animate-in fade-in zoom-in duration-500 active:scale-95 shadow-lg"
              >
                {isSharing ? "📸 Малюємо..." : "📸 Поділитись"}
              </button>
            )}
          </div>
        </section>
      )}

      <section className="bg-magical-depth/60 border border-gray-800 p-8 rounded-3xl shadow-2xl mb-16 backdrop-blur-sm max-w-5xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Налаштування розкладу
            </h2>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => drawCards(1)}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all border flex items-center gap-2 active:scale-95 ${
                  drawnCards.length === 1
                    ? "bg-magical-accent text-white border-magical-accent"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
                }`}
              >
                🃏 1 карта (Так/Ні)
              </button>
              <button
                onClick={() => drawCards(3)}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all border flex items-center gap-2 active:scale-95 ${
                  drawnCards.length === 3
                    ? "bg-magical-accent text-white border-magical-accent"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
                }`}
              >
                🎴 3 карти (Час)
              </button>
            </div>
          </div>

          <div className="w-full border-t border-gray-800 pt-6">
            <label className="block text-xs font-semibold text-gray-500 tracking-widest uppercase mb-2">
              Ваше питання до Всесвіту
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-4 bg-magical-dark/50 text-white rounded-xl border border-gray-700 focus:ring-2 focus:ring-magical-accent outline-none transition-all placeholder:text-gray-600"
              placeholder="Введіть своє питання..."
            />
          </div>
        </div>
      </section>

      {isPreloading && (
        <div className="fixed inset-0 bg-magical-dark z-50 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-magical-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-magical-gold text-lg font-medium tracking-wide">
            Налаштовуємо зв'язок з астралом...
          </p>
        </div>
      )}

      {interpretation && !isLoading && (
        <section className="max-w-5xl mx-auto bg-magical-depth border border-gray-800 p-10 md:p-16 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-4 duration-1000 mb-20">
          <h3 className="text-4xl font-extrabold mb-10 text-white flex items-center gap-4 tracking-tighter">
            <span className="text-magical-gold text-5xl">✦</span> Відповідь
            Оракула
          </h3>
          <div className="prose prose-invert prose-purple prose-lg max-w-none text-gray-300 leading-relaxed font-serif">
            <ReactMarkdown>{interpretation}</ReactMarkdown>
          </div>
        </section>
      )}
    </div>
  );
}