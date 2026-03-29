import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { type, userQuery, drawnCards, userData, coords } = req.body;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview",
    safetySettings: [
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
    ],
  });

  try {
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

      const prompt = `
    Ти — досвідчений таролог та психолог. Користувач звернувся до тебе із запитом: "${userQuery}".
    Використовуй колоду Райдера-Уейта.
    
    Ось витягнуті карти та їхні позиції у розкладі:
    ${cardsDescription}

    Твоє завдання:
    1. Проаналізуй кожну карту відповідно до її ПOZИЦІЇ у розкладі.
    2. Поєднай їх у цілісну історію, пояснюючи причинно-наслідкові зв'язки.
    3. Дай конкретну пораду: що користувачеві варто усвідомити або зробити.
    4. Можна не бути толерантним, якщо все погано - так і кажи.

    Відповідай українською мовою у форматі Markdown.

    ВАЖЛИВО: Ваша відповідь ОБОВ'ЯЗКОВО має починатися з короткої (до 10 слів) поради-цитати на день.
    Цю фразу ви повинні загорнути в теги [QUOTE] ось так [/QUOTE].
    Далі пишіть основне тлумачення.
  `;

      const result = await model.generateContent(prompt);
      return res.status(200).json({ text: result.response.text() });
    } else if (type === "natal") {
      const prompt = `
    Ти — професійний астролог. Розрахуй положення планет для:
    Ім'я: ${userData.name}, Дата: ${userData.date}, Час: ${userData.time}, Координати: ${coords.lat}, ${coords.lon}.

    ПОВЕРНИ ВІДПОВІДЬ СУВОРО У ФОРМАТІ JSON (без зайвих слів і markdown-блоків):
    {
      "planets": [
        {"name": "Сонце", "sign": "Знак"},
        {"name": "Місяць", "sign": "Знак"},
        {"name": "Меркурій", "sign": "Знак"},
        {"name": "Венера", "sign": "Знак"},
        {"name": "Марс", "sign": "Знак"},
        {"name": "Юпітер", "sign": "Знак"},
        {"name": "Сатурн", "sign": "Знак"}
      ],
      "interpretation": "Тут твій детальний аналіз українською мовою у форматі Markdown"
    }
  `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanJson = responseText.replace(/```json|```/g, "").trim();
      return res.status(200).json(JSON.parse(cleanJson));
    }
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Помилка сервера" });
  }
}
