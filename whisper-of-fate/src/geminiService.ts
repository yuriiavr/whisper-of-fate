export async function getTarotInterpretation(userQuery: string, drawnCards: any[]) {
  const response = await fetch('/api/interpret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'tarot', userQuery, drawnCards })
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