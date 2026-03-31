import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { getHoroscopeData } from "../src/astrologyService"; // Імпорт твого робочого сервісу

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { type, userQuery, drawnCards, userData, coords, isTrollMode, partnerData } = req.body;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

  // Твої моделі без змін
  const modelsToTry = [
    "gemini-3.1-flash-lite-preview",
    "gemini-2.5-flash-lite",
  ];

  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ];

  try {
    let prompt = "";
    let calculatedPlanets = [];

    if (type === "tarot") {
      const positions = drawnCards.length === 1 
        ? ["Карта дня / Основна енергія"] 
        : ["Минуле", "Теперішнє", "Майбутнє"];

      const cardsDescription = drawnCards
        .map((d: any, index: number) => {
          const positionName = positions[index] || `Позиція ${index + 1}`;
          return `${index + 1}. Позиція: ${positionName}\n   Карта: ${d.card.nameEn} (${d.card.name})${d.isReversed ? " - ПЕРЕВЕРНУТА" : ""}`;
        })
        .join("\n\n");

      const styleInstruction = isTrollMode
        ? `Ти — зухвалий, саркастичний таролог-цинік з чорним гумором. Будь гострим на язик.`
        : `Ти — досвідчений таролог та психолог. Твій тон мудрий та етичний.`;

      prompt = `${styleInstruction}\nЗапит: "${userQuery}".\nКарти:\n${cardsDescription}\nВідповідай українською в Markdown. Почни з цитати [QUOTE] до 10 слів [/QUOTE].`;

    } else if (type === "natal") {
      // Виклик математики з astrologyService
      const birthDate = new Date(`${userData.date}T${userData.time}:00Z`);
      const astroResult = getHoroscopeData(birthDate, coords.lat, coords.lon);
      calculatedPlanets = astroResult.planets;

      prompt = `
        Ти — професійний астролог.
        Дані планет: ${JSON.stringify(calculatedPlanets)}
        Обчисли натальну карту для ${userData.name}.
        ПОВЕРНИ JSON СУВОРО:
        {
          "planets": ${JSON.stringify(calculatedPlanets)},
          "interpretation": "Аналіз у Markdown українською"
        }
      `;
    } else if (type === "synastry") {
      prompt = `Проаналізуй сумісність ${userData.name} та ${partnerData.name}. Поверни JSON з "planets": [] та "interpretation".`;
    }

    let lastError;
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName, safetySettings });
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
        lastError = err;
        continue;
      }
    }
    throw lastError;

  } catch (error: any) {
    console.error("API ERROR:", error);
    return res.status(500).json({ error: "Server Error", details: error.message });
  }
}