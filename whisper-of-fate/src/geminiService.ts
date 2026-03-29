import { GoogleGenerativeAI } from "@google/generative-ai";
import { type TarotCard } from "./data/tarotCards";

const API_KEY = import.meta.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("API Key for Gemini is missing! Check your .env file.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function getTarotInterpretation(
  userQuery: string, 
  drawnCards: { card: TarotCard; isReversed: boolean }[]
) {
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

  const positions = drawnCards.length === 1 
    ? ["Карта дня / Основна енергія"] 
    : ["Минуле (що призвело до ситуації)", "Теперішнє (стан справ зараз)", "Майбутнє (ймовірний розвиток)"];

  const cardsDescription = drawnCards
    .map((d, index) => {
      const positionName = positions[index] || `Позиція ${index + 1}`;
      return `${index + 1}. Позиція: ${positionName}\n   Карта: ${d.card.nameEn} (${d.card.name})${d.isReversed ? ' - ПЕРЕВЕРНУТА' : ''}`;
    })
    .join('\n\n');

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
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Вибачте, духи сьогодні мовчать... (Сталася помилка при зверненні до ШІ).";
  }
}

export async function getNatalInterpretation(userData: any, coords: {lat: number, lon: number}) {
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

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

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    // Очищаємо текст від можливих маркерів ```json ... ```
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini Natal Error:", error);
    throw error;
  }
}