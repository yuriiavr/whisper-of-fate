export async function getTarotInterpretation(userQuery: string, drawnCards: any[], isTrollMode: boolean) {
  const response = await fetch('/api/interpret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'tarot', userQuery, drawnCards, isTrollMode })
  });
  const data = await response.json();
  return data.text;
}

export async function getNatalInterpretation(userData: any, coords: {lat: number, lon: number}) {
  const response = await fetch('/api/interpret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'natal', userData, coords })
  });
  return await response.json(); 
}

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