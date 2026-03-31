import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { Body, EclipticLongitude } from "astronomy-engine";

function getAstroData(dateStr: string, timeStr: string) {
  try {
    const date = new Date(`${dateStr}T${timeStr}:00Z`);
    if (isNaN(date.getTime())) return [];

    const bodies = [
      { id: Body.Sun, nameUk: "Сонце" },
      { id: Body.Moon, nameUk: "Місяць" },
      { id: Body.Mercury, nameUk: "Меркурій" },
      { id: Body.Venus, nameUk: "Венера" },
      { id: Body.Mars, nameUk: "Марс" },
      { id: Body.Jupiter, nameUk: "Юпітер" },
      { id: Body.Saturn, nameUk: "Сатурн" },
      { id: Body.Uranus, nameUk: "Уран" },
      { id: Body.Neptune, nameUk: "Нептун" },
      { id: Body.Pluto, nameUk: "Плутон" },
    ];

    const signs = [
      "Овен", "Телець", "Близнюки", "Рак", "Лев", "Діва", 
      "Терези", "Скорпіон", "Стрілець", "Козеріг", "Водолій", "Риби"
    ];

    return bodies.map((b) => {
      const lon = EclipticLongitude(b.id, date); 
      
      const signIndex = Math.floor(lon / 30);
      const degree = Math.floor(lon % 30);
      const minutes = Math.floor((lon - Math.floor(lon)) * 60);

      return {
        nameUk: b.nameUk,
        sign: signs[signIndex],
        longitude: lon,
        degree: `${degree}°${minutes}'`,
      };
    });
  } catch (e) {
    console.error("Astro calculation error:", e);
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { type, userQuery, drawnCards, userData, coords, isTrollMode } =
    req.body;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const modelsToTry = [
    "gemini-3.1-flash-lite-preview",
    "gemini-2.5-flash-lite",
  ];

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];

  try {
    let prompt = "";

    if (type === "tarot") {
      const positions =
        drawnCards.length === 1
          ? ["Карта дня / Основна енергія"]
          : [
              "Минуле (що призвело до ситуації)",
              "Теперішнє (стан справ зараз)",
              "Майбутнє (ймовірний розвиток)",
            ];

      const cardsDescription = drawnCards
        .map((d, index) => {
          const positionName = positions[index] || `Позиція ${index + 1}`;
          return `${index + 1}. Позиція: ${positionName}\n   Карта: ${d.card.nameEn} (${d.card.name})${d.isReversed ? " - ПЕРЕВЕРНУТА" : ""}`;
        })
        .join("\n\n");

      const styleInstruction = isTrollMode
        ? `Ти — зухвалий, саркастичний та надзвичайно прямолінійний таролог-цинік з чорним гумором. 
           Якщо запит абсурдний, вульгарний або тупий — відповідай у тому ж дусі. 
           Будь гострим на язик, використовуй сленг, сарказм та грубі метафори.`
        : `Ти — досвідчений таролог та психолог. Твій тон мудрий, глибокий та етичний.`;

      prompt = `
        ${styleInstruction}
        Користувач звернувся до тебе із запитом: "${userQuery}".
        Використовуй колоду Райдера-Уейта.
        
        Карти:
        ${cardsDescription}

        Завдання:
        1. Проаналізуй кожну карту.
        2. Поєднай у цілісну історію.
        3. Дай пораду.
        4. Відповідай українською в Markdown.
        ВАЖЛИВО: Почни з цитати в тегах [QUOTE] до 10 слів [/QUOTE].
      `;
    } else if (type === "natal") {
      const calculatedPlanets = getAstroData(userData.date, userData.time);

      prompt = `
        Ти — професійний астролог високого рівня.
        Ось точні координати планет, розраховані астрономічним рушієм для:
        Ім'я: ${userData.name}, Дата: ${userData.date}, Час: ${userData.time}, Координати: ${coords.lat}, ${coords.lon}.

        Дані планет:
        ${JSON.stringify(calculatedPlanets, null, 2)}

        ПОВЕРНИ ВІДПОВІДЬ СУВОРО У ФОРМАТІ JSON:
        {
          "planets": ${JSON.stringify(calculatedPlanets)},
          "interpretation": "Детальний аналіз особистості на основі наданих координат у Markdown українською"
        }
        
        ВАЖЛИВО: Використовуй надані координати (longitude) для візуалізації. Не вигадуй нові положення планет.
      `;
    } else if (type === "synastry") {
      const { userData, partnerData } = req.body;
      prompt = `
        Ти — експерт з астрологічної сумісності (синастрії).
        Проаналізуй взаємодію двох натальних карт:
        1. ${userData.name}: ${userData.date} ${userData.time}, ${userData.city}.
        2. ${partnerData.name}: ${partnerData.date} ${partnerData.time}, ${partnerData.city}.

        ПОВЕРНИ ВІДПОВІДЬ СУВОРО У ФОРМАТІ JSON:
        {
          "planets": [], 
          "interpretation": "Аналіз сумісності (Карма, Побут, Кохання, Конфлікти) у Markdown українською"
        }
      `;
    }

    let lastError;
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          safetySettings,
        });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        if (type === "tarot") {
          return res.status(200).json({ text: responseText });
        } else {
          const cleanJson = responseText.replace(/```json|```/g, "").trim();
          return res.status(200).json(JSON.parse(cleanJson));
        }
      } catch (err) {
        console.warn(
          `Модель ${modelName} видала помилку, пробуємо наступну...`,
        );
        lastError = err;
        continue;
      }
    }
    throw lastError;
  } catch (error) {
    console.error("API Error:", error);
    res
      .status(500)
      .json({ error: "Усі моделі наразі недоступні. Спробуйте пізніше." });
  }
}