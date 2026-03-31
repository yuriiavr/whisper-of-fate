import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import * as Astronomy from "astronomy-engine";
import { getHoroscopeData } from "../src/astrologyService";

// Функція розрахунку з детальними логами
function getAstroData(dateStr: string, timeStr: string) {
  console.log("[DEBUG] Початок розрахунку астро-даних для:", {
    dateStr,
    timeStr,
  });
  try {
    const date = new Date(`${dateStr}T${timeStr}:00Z`);
    if (isNaN(date.getTime())) {
      console.error("[ERROR] Невірна дата!");
      return [];
    }

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
      "Овен",
      "Телець",
      "Близнюки",
      "Рак",
      "Лев",
      "Діва",
      "Терези",
      "Скорпіон",
      "Стрілець",
      "Козеріг",
      "Водолій",
      "Риби",
    ];

    const results = bodies.map((b) => {
      const bodyId = (Astronomy.Body as any)[b.id];
      if (bodyId === undefined) {
        console.error(`[ERROR] Не знайдено Body ID для ${b.id}`);
      }

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

    console.log("[DEBUG] Розрахунок завершено успішно.");
    return results;
  } catch (e) {
    console.error("[CRITICAL ERROR] Помилка в getAstroData:", e);
    return [];
  }
}

export default async function handler(req, res) {
  console.log("--- NEW REQUEST ---");
  console.log("[DEBUG] Method:", req.method, "Type:", req.body?.type);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { type, userQuery, drawnCards, userData, coords, isTrollMode } =
    req.body;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Твої моделі, сука, на місці
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
        .map((d: any, index: number) => {
          const positionName = positions[index] || `Позиція ${index + 1}`;
          return `${index + 1}. Позиція: ${positionName}\n   Карта: ${d.card.nameEn} (${d.card.name})${d.isReversed ? " - ПЕРЕВЕРНУТА" : ""}`;
        })
        .join("\n\n");

      const styleInstruction = isTrollMode
        ? `Ти — зухвалий, саркастичний та надзвичайно прямолінійний таролог-цинік з чорним гумором. Будь гострим на язик, використовуй сленг, сарказм та грубі метафори.`
        : `Ти — досвідчений таролог та психолог. Твій тон мудрий, глибокий та етичний.`;

      prompt = `${styleInstruction}\nЗапит: "${userQuery}".\nКарти:\n${cardsDescription}\nВідповідай українською в Markdown. Почни з цитати [QUOTE] до 10 слів [/QUOTE].`;
    } else if (type === "natal") {
      if (
        !coords ||
        typeof coords.lat !== "number" ||
        typeof coords.lon !== "number"
      ) {
        return res.status(400).json({ error: "Missing coordinates (lat/lon)" });
      }
      const data = getHoroscopeData(
        new Date(`${userData.date}T${userData.time}:00Z`),
        coords.lat,
        coords.lon,
      );
      console.log("[DEBUG] Розраховуємо натал для:", userData?.name);
      const planets = getAstroData(userData.date, userData.time);

      prompt = `
        Ти — професійний астролог.
        Дані планет: ${JSON.stringify(planets, null, 2)}
        Обчисли натал для ${userData.name}.
        ПОВЕРНИ JSON СУВОРО:
        {
          "planets": ${JSON.stringify(planets)},
          "interpretation": "Аналіз у Markdown"
        }
      `;
    } else if (type === "synastry") {
      const { partnerData } = req.body;
      prompt = `Аналіз сумісності: ${userData.name} та ${partnerData.name}. Поверни JSON з "planets": [] та "interpretation".`;
    }

    let lastError;
    for (const modelName of modelsToTry) {
      try {
        console.log(`[DEBUG] Запуск моделі: ${modelName}`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          safetySettings,
        });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        console.log(`[DEBUG] Відповідь від ${modelName} отримана.`);

        if (type === "tarot") {
          return res.status(200).json({ text: responseText });
        } else {
          // Витягуємо JSON максимально надійно
          const firstBrace = responseText.indexOf("{");
          const lastBrace = responseText.lastIndexOf("}");
          if (firstBrace === -1 || lastBrace === -1)
            throw new Error("JSON не знайдено");

          const cleanJson = responseText.substring(firstBrace, lastBrace + 1);
          return res.status(200).json(JSON.parse(cleanJson));
        }
      } catch (err: any) {
        console.warn(`[WARN] Модель ${modelName} видала помилку:`, err.message);
        lastError = err;
        continue;
      }
    }
    throw lastError;
  } catch (error: any) {
    console.error("[CRITICAL HANDLER ERROR]:", error);
    // Повертаємо JSON, щоб фронтенд не бачив HTML-помилку "A server error..."
    return res.status(500).json({
      error: "Критична помилка сервера",
      details: error.message,
    });
  }
}
