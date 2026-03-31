import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import * as Astronomy from "astronomy-engine"; // Імпортуємо все як об'єкт для надійності

function getAstroData(dateStr: string, timeStr: string) {
  try {
    // ВАЖЛИВО: Перевірка наявності даних
    if (!dateStr || !timeStr) return [];
    
    const date = new Date(`${dateStr}T${timeStr}:00Z`);
    if (isNaN(date.getTime())) return [];

    const bodies = [
      { id: "Sun", nameUk: "Сонце" },
      { id: "Moon", nameUk: "Місяць" },
      { id: "Mercury", nameUk: "Меркурій" },
      { id: "Venus", nameUk: "Венера" },
      { id: "Mars", nameUk: "Марс" },
      { id: "Jupiter", nameUk: "Юпітер" },
      { id: "Saturn", nameUk: "Сатурн" },
      { id: "Uranus", nameUk: "Уран" },
      { id: "Neptune", nameUk: "Нептун" },
      { id: "Pluto", nameUk: "Плутон" },
    ];

    const signs = [
      "Овен", "Телець", "Близнюки", "Рак", "Лев", "Діва", 
      "Терези", "Скорпіон", "Стрілець", "Козеріг", "Водолій", "Риби"
    ];

    return bodies.map((b) => {
      // Використовуємо рядковий ключ для доступу до перерахування Body
      const bodyId = (Astronomy.Body as any)[b.id];
      const lon = Astronomy.EclipticLongitude(bodyId, date); 
      
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

  const { type, userQuery, drawnCards, userData, coords, isTrollMode } = req.body;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // ТВОЇ МОДЕЛІ (БЕЗ ЗМІН)
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
        ? `Ти — зухвалий, саркастичний та надзвичайно прямолінійний таролог-цинік з чорним гумором.`
        : `Ти — досвідчений таролог та психолог. Твій тон мудрий, глибокий та етичний.`;

      prompt = `
        ${styleInstruction}
        Користувач: "${userQuery}".
        Карти:
        ${cardsDescription}
        Поверни відповідь українською в Markdown. Почни з [QUOTE]...[/QUOTE].
      `;
    } else if (type === "natal") {
      const calculatedPlanets = getAstroData(userData.date, userData.time);

      prompt = `
        Ти — професійний астролог.
        Дані планет (точні):
        ${JSON.stringify(calculatedPlanets, null, 2)}

        ПОВЕРНИ JSON СУВОРО:
        {
          "planets": ${JSON.stringify(calculatedPlanets)},
          "interpretation": "Markdown текст аналізу"
        }
      `;
    } else if (type === "synastry") {
      const { partnerData } = req.body;
      prompt = `Синастрія для ${userData.name} та ${partnerData.name}. Поверни JSON з "planets": [] та "interpretation".`;
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
          // Чистимо JSON від можливих артефактів моделі
          const cleanJson = responseText.substring(
            responseText.indexOf("{"),
            responseText.lastIndexOf("}") + 1
          );
          return res.status(200).json(JSON.parse(cleanJson));
        }
      } catch (err) {
        lastError = err;
        continue;
      }
    }
    throw lastError;
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Помилка сервера. Перевірте консоль." });
  }
}