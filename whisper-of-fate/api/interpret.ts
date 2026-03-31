import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import * as Astronomy from "astronomy-engine";

// Функція розрахунку, яка точно не "покладе" сервер
function getAstroData(dateStr: string, timeStr: string) {
  try {
    if (!dateStr || !timeStr) return [];
    
    // Створюємо дату в UTC для точності розрахунків
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
      // Безпечне звернення до перерахування Body через Astronomy об'єкт
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

  // Твої моделі (залишено без змін)
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

    if (type === "tarot") {
      const positions = drawnCards.length === 1
          ? ["Карта дня / Основна енергія"]
          : ["Минуле (що призвело до ситуації)", "Теперішнє (стан справ зараз)", "Майбутнє (ймовірний розвиток)"];

      const cardsDescription = drawnCards
        .map((d, index) => {
          const positionName = positions[index] || `Позиція ${index + 1}`;
          return `${index + 1}. Позиція: ${positionName}\n   Карта: ${d.card.nameEn} (${d.card.name})${d.isReversed ? " - ПЕРЕВЕРНУТА" : ""}`;
        })
        .join("\n\n");

      const styleInstruction = isTrollMode
        ? `Ти — зухвалий, саркастичний та надзвичайно прямолінійний таролог-цинік з чорним гумором. Будь гострим на язик, використовуй сленг та сарказм.`
        : `Ти — досвідчений таролог та психолог. Твій тон мудрий, глибокий та етичний.`;

      prompt = `${styleInstruction}\nЗапит: "${userQuery}".\nКарти:\n${cardsDescription}\nВідповідай українською в Markdown. Почни з цитати в [QUOTE] до 10 слів [/QUOTE].`;

    } else if (type === "natal") {
      const calculatedPlanets = getAstroData(userData.date, userData.time);

      prompt = `
        Ти — професійний астролог високого рівня.
        Дані планет (точні координати):
        ${JSON.stringify(calculatedPlanets, null, 2)}

        ПОВЕРНИ JSON СУВОРО:
        {
          "planets": ${JSON.stringify(calculatedPlanets)},
          "interpretation": "Детальний натальний аналіз особистості українською в Markdown"
        }
      `;
    } else if (type === "synastry") {
      const { partnerData } = req.body;
      prompt = `Проаналізуй синастрію для ${userData.name} та ${partnerData.name}. Поверни JSON з "planets": [] та "interpretation" (аналіз сумісности).`;
    }

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName, safetySettings });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        if (type === "tarot") {
          return res.status(200).json({ text: responseText });
        } else {
          // Надійне вилучення JSON з відповіді моделі
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error("JSON not found in response");
          return res.status(200).json(JSON.parse(jsonMatch[0]));
        }
      } catch (err) {
        console.warn(`Модель ${modelName} впала, йдемо далі...`);
        continue;
      }
    }
    throw new Error("Всі моделі недоступні.");

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Магія зламалася. Спробуйте пізніше." });
  }
}