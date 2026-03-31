import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import * as Astronomy from "astronomy-engine";
import { getHoroscopeData } from "../src/astrologyService";

export default async function handler(req: any, res: any) {
  console.log("--- NEW REQUEST ---");
  console.log("[DEBUG] Method:", req.method, "Type:", req.body?.type);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { type, userQuery, drawnCards, userData, coords, isTrollMode, partnerData } =
    req.body;
    
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

  // Твої моделі залишаються незмінними
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
    let calculatedPlanets = [];

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
      if (!coords || typeof coords.lat !== "number" || typeof coords.lon !== "number") {
        return res.status(400).json({ error: "Missing coordinates (lat/lon)" });
      }

      // Використовуємо твій сервіс для точних розрахунків
      const astroResult = getHoroscopeData(
        new Date(`${userData.date}T${userData.time}:00Z`),
        coords.lat,
        coords.lon
      );
      calculatedPlanets = astroResult.planets;

      prompt = `
        Ти — професійний астролог.
        Дані планет: ${JSON.stringify(calculatedPlanets, null, 2)}
        Обчисли натальну карту для ${userData.name}, дата народження ${userData.date} ${userData.time}, місто ${userData.city}.
        ПОВЕРНИ JSON СУВОРО:
        {
          "planets": ${JSON.stringify(calculatedPlanets)},
          "interpretation": "Глибокий аналіз особистості, карми та потенціалу у Markdown"
        }
      `;
    } else if (type === "synastry") {
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
        console.log(`[DEBUG] Запуск моделі: ${modelName}`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          safetySettings,
        });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        if (type === "tarot") {
          return res.status(200).json({ text: responseText });
        } else {
          const firstBrace = responseText.indexOf("{");
          const lastBrace = responseText.lastIndexOf("}");
          if (firstBrace === -1 || lastBrace === -1) throw new Error("JSON not found");

          const cleanJson = responseText.substring(firstBrace, lastBrace + 1);
          return res.status(200).json(JSON.parse(cleanJson));
        }
      } catch (err: any) {
        console.warn(`[WARN] Модель ${modelName} помилка:`, err.message);
        lastError = err;
        continue;
      }
    }
    throw lastError;

  } catch (error: any) {
    console.error("[CRITICAL HANDLER ERROR]:", error);
    return res.status(500).json({
      error: "Критична помилка сервера",
      details: error.message,
    });
  }
}