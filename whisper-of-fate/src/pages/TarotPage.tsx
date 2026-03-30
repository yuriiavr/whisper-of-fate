import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { tarotDeck, type TarotCard } from "../data/tarotCards";
import { getTarotInterpretation } from "../geminiService";
import { toPng } from "html-to-image";
import { ShareTemplate } from "../components/ShareTemplate";

const CARD_BACK_URL = "/back.jpg";

// Компонент однієї карти з анімацією перевороту
const MagicalCard = ({
  card,
  isReversed,
  isRevealed, // Новий пропс: чи перевернута карта обличчям догори
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
        {/* Передня сторона (сорочка) */}
        <div className="flip-card-front bg-magical-depth border-2 border-magical-accent p-1.5 flex items-center justify-center overflow-hidden rounded-2xl">
          <img
            src={CARD_BACK_URL}
            crossOrigin="anonymous"
            alt="Card Back"
            className="w-full h-full object-cover rounded-md"
          />
        </div>

        {/* Задня сторона (обличчя карти) */}
        <div className="flip-card-back bg-magical-depth border border-gray-800 p-3 flex flex-col items-center overflow-hidden rounded-2xl">
          <div className="relative w-full h-full rounded-lg overflow-hidden">
            <img
              src={card.image}
              alt={card.nameEn}
              crossOrigin="anonymous" // Критично для роботи html-to-image на мобілках
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

  // Новий стейт: чи перевернуті карти обличчям догори
  const [areCardsRevealed, setAreCardsRevealed] = useState<boolean>(false);
  const [isPreloading, setIsPreloading] = useState<boolean>(true);

  // --- ЛОГІКА ПРЕЛОАДУ КАРТИНОК ---
  useEffect(() => {
    const preloadImages = async () => {
      console.log("⏳ Починаємо прелоад ассетів...");
      try {
        // Список усіх URL для завантаження: сорочка + всі карти з колоди
        const urlsToPreload = [
          CARD_BACK_URL,
          ...tarotDeck.map((card) => card.image),
        ];

        // Функція-проміс для завантаження однієї картинки
        const loadImage = (url: string) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous"; // Важливо!
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
          });
        };

        // Запускаємо завантаження всіх картинок паралельно
        await Promise.all(urlsToPreload.map(loadImage));
        console.log("✅ Всі ассети успішно завантажено в кеш.");
      } catch (error) {
        console.error("🚨 Помилка під час прелоаду картинки:", error);
        // Ми не зупиняємо додаток, якщо одна картинка не завантажилася,
        // але в консолі буде видно проблему.
      } finally {
        setIsPreloading(false);
      }
    };

    preloadImages();
  }, []); // Виконується один раз при монтуванні компонента

  // --- ЛОГІКА ВИБОРУ КАРТ ---
  const drawCards = (count: number) => {
    // Скидаємо старі результати
    setAreCardsRevealed(false); // Карти знову сорочкою догори
    setInterpretation("");
    setKeyQuote("");

    const shuffled = [...tarotDeck].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count).map((card) => ({
      card,
      isReversed: Math.random() < 0.25, // 25% шанс перевернутої карти
    }));
    setDrawnCards(selected);
  };

  // --- ЛОГІКА ВЗАЄМОДІЇ З GEMINI ---
  const handleDivine = async () => {
    if (!query.trim() || drawnCards.length === 0) return;

    // UX Крок 1: Спочатку перевертаємо карти
    setAreCardsRevealed(true);

    // UX Крок 2: Чекаємо, поки анімація перевороту (0.5с) завершиться,
    // і тільки тоді показуємо лоадер Gemini.
    await new Promise((resolve) => setTimeout(resolve, 600));

    setIsLoading(true);
    setInterpretation(""); // Очищаємо старий текст перед новим запитом

    try {
      const fullResponse = await getTarotInterpretation(query, drawnCards);
      console.log("Full AI Response:", fullResponse);

      // Парсимо цитату [QUOTE]...[/QUOTE]
      const quoteMatch = fullResponse.match(/\[QUOTE\](.*?)\[\/QUOTE\]/s);
      let finalQuote = "";
      let finalText = fullResponse;

      if (quoteMatch && quoteMatch[1].trim()) {
        finalQuote = quoteMatch[1].trim();
        finalText = fullResponse.replace(/\[QUOTE\].*?\[\/QUOTE\]/s, "").trim();
      } else {
        // Фолбек: беремо перше речення як цитату, якщо тегів немає
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

  const getBase64Image = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // --- ЛОГІКА ШЕРІНГУ В INSTAGRAM ---
  const handleShareToInstagram = async () => {
  const node = document.getElementById("share-story-template");

  if (!node || drawnCards.length === 0 || !keyQuote) return;

  setIsSharing(true);

  try {
    console.log("📸 Починаємо підготовку скріншота...");

    // КРОК 1: Конвертуємо всі картинки в Base64 всередині шаблону
    // Це прибирає проблеми з "білими квадратами" на мобільних
    const images = Array.from(node.querySelectorAll("img"));
    await Promise.all(
      images.map(async (img) => {
        try {
          // Якщо картинка вже в base64 або вже завантажена як blob - пропускаємо
          if (img.src.startsWith('data:')) return;
          
          const base64 = await getBase64FromUrl(img.src);
          img.src = base64;
          
          // Чекаємо поки картинка оновиться з новим src
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        } catch (err) {
          console.warn("Не вдалося конвертувати картинку в Base64:", img.src, err);
        }
      })
    );

    // КРОК 2: Даємо браузеру час на перемальовку DOM після заміни src
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );
    await new Promise((resolve) => setTimeout(resolve, 300));

    // КРОК 3: Генерація PNG
    const dataUrl = await toPng(node, {
      quality: 1,
      backgroundColor: "#111",
      cacheBust: false, // Тепер не потрібно, бо ми вручну подали base64
      pixelRatio: 2,
      style: {
        visibility: "visible",
        display: "flex",
        transform: "scale(1)",
        margin: "0",
        left: "0",
        top: "0"
      },
      // Вимикаємо обробку шрифтів бібліотекою, якщо вони глючать (опціонально)
      // skipFonts: true, 
    });

    if (!dataUrl || dataUrl === "data:,") {
      throw new Error("Згенеровано пусте зображення");
    }

    console.log("✅ PNG успішно згенеровано");

    // КРОК 4: Підготовка файлу для Share API
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], "tarot-prediction.png", {
      type: "image/png",
    });

    // КРОК 5: Спроба використати системне меню Share (мобільні)
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        files: [file],
        title: "Whisper of Fate",
        text: `Порада Оракула: "${keyQuote}"`,
      });
    } else {
      // КРОК 6: Фолбек для десктопів (скачування)
      const link = document.createElement("a");
      link.download = `tarot-whisper-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error("🚨 Помилка шерінгу:", error);
    alert("Мобільний браузер заблокував рендер. Спробуйте ще раз або зробіть скріншот екрана.");
  } finally {
    setIsSharing(false);
  }
};

  // Головний рендер сторінки
  return (
    <div className="animate-in fade-in duration-700 p-4 md:p-0">
      {/* Прихований шаблон для генерації сторіз (за межами екрана) */}
      {drawnCards.length > 0 && keyQuote && (
        <div style={{ position: "absolute", left: "0", top: 0, zIndex: -100 }}>
          <ShareTemplate drawnCards={drawnCards} quote={keyQuote} />
        </div>
      )}

      {/* --- UX ЗМІНА: КАРТИ ТЕПЕР ВИЩЕ INPUT --- */}
      {drawnCards.length > 0 && (
        <section className="mb-16 mt-8">
          <div className="flex justify-center gap-6 md:gap-10 flex-wrap mb-12">
            {drawnCards.map((drawn, index) => (
              <MagicalCard
                key={`${drawn.card.id}-${index}`}
                card={drawn.card}
                isReversed={drawn.isReversed}
                isRevealed={areCardsRevealed} // Керується кнопкою Divine
              />
            ))}
          </div>

          <div className="flex flex-col items-center gap-6">
            {/* --- UX ЗМІНА: КНОПКА ЗМІНИЛА НАЗВУ ТА ЛОГІКУ --- */}
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

            {/* Кнопка шерінгу з'являється тільки після відповіді Gemini */}
            {interpretation && !isLoading && (
              <button
                onClick={handleShareToInstagram}
                disabled={isSharing}
                className="px-8 py-4 rounded-full text-lg font-semibold text-black bg-white hover:bg-magical-gold transition-all flex items-center gap-2 animate-in fade-in zoom-in duration-500 active:scale-95 shadow-lg"
              >
                {isSharing
                  ? "📸 Малюємо..."
                  : "📸 Поділитись (Instagram / Threads)"}
              </button>
            )}
          </div>
        </section>
      )}

      {/* Блок налаштувань розкладу та вводу питання (тепер нижче карт) */}
      <section className="bg-magical-depth/60 border border-gray-800 p-8 rounded-3xl shadow-2xl mb-16 backdrop-blur-sm max-w-5xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Налаштування розкладу
            </h2>

            {/* Кнопки вибору кількості карт */}
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

      {/* Оверлей завантаження, поки ассети не готові */}
      {isPreloading && (
        <div className="fixed inset-0 bg-magical-dark z-50 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-magical-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-magical-gold text-lg font-medium tracking-wide">
            Налаштовуємо зв'язок з астралом...
          </p>
        </div>
      )}

      {/* Секція з інтерпретацією Gemini (з'являється в самому низу) */}
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
