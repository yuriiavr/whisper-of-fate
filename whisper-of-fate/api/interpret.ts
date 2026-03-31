import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { type, userQuery, drawnCards, userData, coords, isTrollMode, planets } =
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
    }else if (type === "natal") {
      const { planets } = req.body; 

      prompt = `
        Ти — професійний астролог високого рівня. 
        Використовуй ці дані планет: ${JSON.stringify(planets)}
        Проаналізуй натальну карту на основі наданих точних координат планет.
        Користувач: ${userData.name}, Дата: ${userData.date}, Час: ${userData.time}, Координати: ${coords.lat}, ${coords.lon}.

        ДАНІ ПЛАНЕТ (використовуй їх для аналізу):
        ${JSON.stringify(planets)}

        ПОВЕРНИ ВІДПОВІДЬ СУВОРО У ФОРМАТІ JSON:
        {
          "planets": ${JSON.stringify(planets)}, 
          "interpretation": "Детальний аналіз особистості (Психотип, Таланти, Кар'єра, Кохання) у форматі Markdown українською мовою. Використовуй заголовки, списки та емодзі."
        }
      `;
    } else if (type === "synastry") {
      const { planetsP1, planetsP2, partnerData } = req.body;

      prompt = `
        Ти — експерт з астрологічної сумісності (синастрії).
        Проаналізуй взаємодію двох натальних карт на основі наданих точних координат:
        1. ${userData.name}: ${JSON.stringify(planetsP1)}
        2. ${partnerData.name}: ${JSON.stringify(planetsP2)}

        ПОВЕРНИ ВІДПОВІДЬ СУВОРО У ФОРМАТІ JSON:
        {
          "planets": ${JSON.stringify(planetsP1)}, 
          "interpretation": "Глибокий аналіз сумісності (Кармічні вузли, Емоційний зв'язок, Сексуальна енергія, Побутові конфлікти) у Markdown українською мовою."
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
