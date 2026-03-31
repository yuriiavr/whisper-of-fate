export async function getTarotInterpretation(userQuery: string, drawnCards: any[], isTrollMode: boolean) {
  const response = await fetch('/api/interpret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'tarot', userQuery, drawnCards, isTrollMode })
  });
  const data = await response.json();
  return data.text;
}

export const getNatalInterpretation = async (userData: any, coords: any) => {
  // Тут ти створюєш змінну. Перевір, як вона називається: response чи res
  const response = await fetch("/api/interpret", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "natal", userData, coords }),
  });

  // Якщо ти назвав її response, то і перевірка має бути через response
  if (!response.ok) {
    const errorText = await response.text(); 
    console.error("ОСЬ ЩО НАСПРАВДІ ВІДПОВІВ СЕРВЕР:", errorText);
    throw new Error(`Помилка сервера: ${response.status}`);
  }

  return response.json();
};

export async function getSynastryInterpretation(user1: any, user2: any) {
  const response = await fetch('/api/interpret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      type: 'synastry', 
      userData: user1,
      partnerData: user2
    })
  });
  return await response.json(); 
}