import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { tarotDeck, type TarotCard } from "../data/tarotCards";
import { getTarotInterpretation } from "../geminiService";
import { toPng } from "html-to-image";
import { ShareTemplate } from "../components/ShareTemplate";

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
    const timer = setTimeout(() => setIsFlipped(true), 800 + index * 1000);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={`flip-card h-[400px] w-[240px] relative ${isFlipped ? "flipped" : ""}`}
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
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${isReversed ? "rotate-180" : ""}`}
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

export default function TarotPage() {
  const [query, setQuery] = useState<string>("Що чекає мене завтра?");
  const [drawnCards, setDrawnCards] = useState<
    { card: TarotCard; isReversed: boolean }[]
  >([]);
  const [interpretation, setInterpretation] = useState<string>("");
  const [keyQuote, setKeyQuote] = useState<string>("");
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const drawCards = (count: number) => {
    const shuffled = [...tarotDeck].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count).map((card) => ({
      card,
      isReversed: Math.random() < 0.25,
    }));
    setDrawnCards(selected);
    setInterpretation("");
    setKeyQuote("");
  };

  const handleDivine = async () => {
    if (!query.trim() || drawnCards.length === 0) return;
    setIsLoading(true);
    try {
      const fullResponse = await getTarotInterpretation(query, drawnCards);
      console.log("Full AI Response:", fullResponse);

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
      setInterpretation("Помилка зв'язку з духами.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareToInstagram = async () => {
    const node = document.getElementById("share-story-template");

    if (!node || drawnCards.length === 0 || !keyQuote) return;

    setIsSharing(true);

    try {
      // 1. Форсуємо перемальовку перед скріншотом
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );

      const images = Array.from(node.querySelectorAll("img"));
      await Promise.all(
        images.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((r) => {
                img.onload = r;
                img.onerror = r;
              }),
        ),
      );

      // 2. Збільшуємо паузу для шрифтів та стабілізації стилів
      await new Promise((resolve) => setTimeout(resolve, 500));

      const dataUrl = await toPng(node, {
        quality: 0.95,
        backgroundColor: "#111",
        cacheBust: true,
        pixelRatio: 2,
        style: {
          visibility: "visible",
          display: "flex",
          transform: "scale(1)", // Гарантуємо відсутність трансформацій
        },
      });

      console.log("🔗 Клікни сюди, щоб побачити результат:", dataUrl);

      if (!dataUrl || dataUrl === "data:,") {
        throw new Error("Згенеровано пусте зображення");
      }

      console.log("✅ PNG згенеровано, довжина рядка:", dataUrl.length);

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "tarot-prediction.png", {
        type: "image/png",
      });

      console.log(
        "📂 Файл підготовлено, розмір:",
        (blob.size / 1024).toFixed(2),
        "KB",
      );

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        console.log("📱 Спроба відкрити системне меню Share...");
        await navigator.share({
          files: [file],
          title: "Мій розклад Таро",
          text: `Порада Оракула: "${keyQuote}"`,
        });
        console.log("🏁 Share API викликано успішно");
      } else {
        console.log("💻 Share API не підтримується, запускаємо скачування...");
        const link = document.createElement("a");
        link.download = `whisper-of-fate-${new Date().getTime()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log("🏁 Файл завантажено");
      }
    } catch (error) {
      console.error("🚨 Помилка всередині блоку try-catch:", error);
      alert(
        "Не вдалося створити картинку. Спробуйте ще раз або перевірте підключення.",
      );
    } finally {
      setIsSharing(false);
      console.log("🔚 Процес завершено.");
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      {drawnCards.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: "0",
            top: "0",
            opacity: "0",
          }}
        >
          <ShareTemplate drawnCards={drawnCards} quote={keyQuote} />
        </div>
      )}

      <section className="bg-magical-depth/60 border border-gray-800 p-8 rounded-3xl shadow-2xl mb-16 backdrop-blur-sm">
        <div className="flex flex-col gap-6">
          <div className="w-full">
            <label className="block text-xs font-semibold text-gray-500 tracking-widest uppercase mb-2">
              Ваш запит
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-4 bg-magical-dark/50 text-white rounded-xl border border-gray-700 focus:ring-2 focus:ring-magical-accent outline-none transition-all"
              placeholder="Введіть своє питання до Всесвіту..."
            />
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => drawCards(1)}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-semibold transition-all active:scale-95 border border-gray-700 flex items-center gap-2"
            >
              🃏{" "}
              {drawnCards.length === 1 ? "Оновити карту" : "1 карта (Так/Ні)"}
            </button>
            <button
              onClick={() => drawCards(3)}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-semibold transition-all active:scale-95 border border-gray-700 flex items-center gap-2"
            >
              🎴{" "}
              {drawnCards.length === 3
                ? "Новий розклад"
                : "3 карти (Минуле/Теперішнє/Майбутнє)"}
            </button>
          </div>
        </div>
      </section>
      {drawnCards.length > 0 && (
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
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={handleDivine}
              disabled={isLoading}
              className={`px-12 py-5 rounded-full text-xl font-bold text-white transition-all transform hover:scale-105 shadow-xl ${
                isLoading
                  ? "bg-gray-700"
                  : "bg-gradient-to-r from-purple-700 to-magical-accent"
              }`}
            >
              {isLoading ? "Духи міркують..." : "✨ Отримати пораду"}
            </button>

            {interpretation && (
              <button
                onClick={handleShareToInstagram}
                disabled={isSharing}
                className="px-8 py-5 rounded-full text-lg font-semibold text-black bg-white hover:bg-magical-gold transition-all flex items-center gap-2 animate-in fade-in zoom-in duration-500"
              >
                {isSharing ? "📸 Малюємо..." : "📸 В Instagram / Threads"}
              </button>
            )}
          </div>
        </section>
      )}
      {interpretation && (
        <section className="max-w-5xl mx-auto bg-magical-depth border border-gray-800 p-10 md:p-16 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-4 duration-1000 mb-20">
          <h3 className="text-4xl font-extrabold mb-10 text-white flex items-center gap-4">
            <span className="text-magical-gold text-5xl">✦</span> Відповідь
            Оракула
          </h3>
          <div className="prose prose-invert prose-purple prose-lg max-w-none text-gray-300">
            <ReactMarkdown>{interpretation}</ReactMarkdown>
          </div>
        </section>
      )}
    </div>
  );
}
