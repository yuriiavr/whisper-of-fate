export interface TarotCard {
  id: string;
  name: string;
  nameEn: string;
  value: number;
  image: string;
}

const BASE_URL = "/public/cards/";

export const tarotDeck: TarotCard[] = [
  // Major Arcana (Старші Аркани)
  { id: 'ar00', name: 'Дурень', nameEn: 'The Fool', value: 0, image: `${BASE_URL}/ar00.jpg` },
  { id: 'ar01', name: 'Маг', nameEn: 'The Magician', value: 1, image: `${BASE_URL}/ar01.jpg` },
  { id: 'ar02', name: 'Верховна Жриця', nameEn: 'The High Priestess', value: 2, image: `${BASE_URL}/ar02.jpg` },
  { id: 'ar03', name: 'Імператриця', nameEn: 'The Empress', value: 3, image: `${BASE_URL}/ar03.jpg` },
  { id: 'ar04', name: 'Імператор', nameEn: 'The Emperor', value: 4, image: `${BASE_URL}/ar04.jpg` },
  { id: 'ar05', name: 'Ієрофант', nameEn: 'The Hierophant', value: 5, image: `${BASE_URL}/ar05.jpg` },
  { id: 'ar06', name: 'Закохані', nameEn: 'The Lovers', value: 6, image: `${BASE_URL}/ar06.jpg` },
  { id: 'ar07', name: 'Колісниця', nameEn: 'The Chariot', value: 7, image: `${BASE_URL}/ar07.jpg` },
  { id: 'ar08', name: 'Сила', nameEn: 'Strength', value: 8, image: `${BASE_URL}/ar08.jpg` },
  { id: 'ar09', name: 'Відшельник', nameEn: 'The Hermit', value: 9, image: `${BASE_URL}/ar09.jpg` },
  { id: 'ar10', name: 'Колесо Фортуни', nameEn: 'The Wheel of Fortune', value: 10, image: `${BASE_URL}/ar10.jpg` },
  { id: 'ar11', name: 'Справедливість', nameEn: 'Justice', value: 11, image: `${BASE_URL}/ar11.jpg` },
  { id: 'ar12', name: 'Повішений', nameEn: 'The Hanged Man', value: 12, image: `${BASE_URL}/ar12.jpg` },
  { id: 'ar13', name: 'Смерть', nameEn: 'Death', value: 13, image: `${BASE_URL}/ar13.jpg` },
  { id: 'ar14', name: 'Помірність', nameEn: 'Temperance', value: 14, image: `${BASE_URL}/ar14.jpg` },
  { id: 'ar15', name: 'Диявол', nameEn: 'The Devil', value: 15, image: `${BASE_URL}/ar15.jpg` },
  { id: 'ar16', name: 'Вежа', nameEn: 'The Tower', value: 16, image: `${BASE_URL}/ar16.jpg` },
  { id: 'ar17', name: 'Зірка', nameEn: 'The Star', value: 17, image: `${BASE_URL}/ar17.jpg` },
  { id: 'ar18', name: 'Місяць', nameEn: 'The Moon', value: 18, image: `${BASE_URL}/ar18.jpg` },
  { id: 'ar19', name: 'Сонце', nameEn: 'The Sun', value: 19, image: `${BASE_URL}/ar19.jpg` },
  { id: 'ar20', name: 'Суд', nameEn: 'Judgement', value: 20, image: `${BASE_URL}/ar20.jpg` },
  { id: 'ar21', name: 'Світ', nameEn: 'The World', value: 21, image: `${BASE_URL}/ar21.jpg` },

  // Wands (Жезли)
  { id: 'wa01', name: 'Туз Жезлів', nameEn: 'Ace of Wands', value: 1, image: `${BASE_URL}/waac.jpg` },
  { id: 'wa02', name: 'Двійка Жезлів', nameEn: 'Two of Wands', value: 2, image: `${BASE_URL}/wa02.jpg` },
  { id: 'wa03', name: 'Трійка Жезлів', nameEn: 'Three of Wands', value: 3, image: `${BASE_URL}/wa03.jpg` },
  { id: 'wa04', name: 'Четвірка Жезлів', nameEn: 'Four of Wands', value: 4, image: `${BASE_URL}/wa04.jpg` },
  { id: 'wa05', name: 'П’ятірка Жезлів', nameEn: 'Five of Wands', value: 5, image: `${BASE_URL}/wa05.jpg` },
  { id: 'wa06', name: 'Шістка Жезлів', nameEn: 'Six of Wands', value: 6, image: `${BASE_URL}/wa06.jpg` },
  { id: 'wa07', name: 'Сімка Жезлів', nameEn: 'Seven of Wands', value: 7, image: `${BASE_URL}/wa07.jpg` },
  { id: 'wa08', name: 'Вісімка Жезлів', nameEn: 'Eight of Wands', value: 8, image: `${BASE_URL}/wa08.jpg` },
  { id: 'wa09', name: 'Дев’ятка Жезлів', nameEn: 'Nine of Wands', value: 9, image: `${BASE_URL}/wa09.jpg` },
  { id: 'wa10', name: 'Десятка Жезлів', nameEn: 'Ten of Wands', value: 10, image: `${BASE_URL}/wa10.jpg` },
  { id: 'wa11', name: 'Паж Жезлів', nameEn: 'Page of Wands', value: 11, image: `${BASE_URL}/wapa.jpg` },
  { id: 'wa12', name: 'Лицар Жезлів', nameEn: 'Knight of Wands', value: 12, image: `${BASE_URL}/wakn.jpg` },
  { id: 'wa13', name: 'Королева Жезлів', nameEn: 'Queen of Wands', value: 13, image: `${BASE_URL}/waqu.jpg` },
  { id: 'wa14', name: 'Король Жезлів', nameEn: 'King of Wands', value: 14, image: `${BASE_URL}/waki.jpg` },

  // Cups (Кубки)
  { id: 'cu01', name: 'Туз Кубків', nameEn: 'Ace of Cups', value: 1, image: `${BASE_URL}/cuac.jpg` },
  { id: 'cu02', name: 'Двійка Кубків', nameEn: 'Two of Cups', value: 2, image: `${BASE_URL}/cu02.jpg` },
  { id: 'cu03', name: 'Трійка Кубків', nameEn: 'Three of Cups', value: 3, image: `${BASE_URL}/cu03.jpg` },
  { id: 'cu04', name: 'Четвірка Кубків', nameEn: 'Four of Cups', value: 4, image: `${BASE_URL}/cu04.jpg` },
  { id: 'cu05', name: 'П’ятірка Кубків', nameEn: 'Five of Cups', value: 5, image: `${BASE_URL}/cu05.jpg` },
  { id: 'cu06', name: 'Шістка Кубків', nameEn: 'Six of Cups', value: 6, image: `${BASE_URL}/cu06.jpg` },
  { id: 'cu07', name: 'Сімка Кубків', nameEn: 'Seven of Cups', value: 7, image: `${BASE_URL}/cu07.jpg` },
  { id: 'cu08', name: 'Вісімка Кубків', nameEn: 'Eight of Cups', value: 8, image: `${BASE_URL}/cu08.jpg` },
  { id: 'cu09', name: 'Дев’ятка Кубків', nameEn: 'Nine of Cups', value: 9, image: `${BASE_URL}/cu09.jpg` },
  { id: 'cu10', name: 'Десятка Кубків', nameEn: 'Ten of Cups', value: 10, image: `${BASE_URL}/cu10.jpg` },
  { id: 'cu11', name: 'Паж Кубків', nameEn: 'Page of Cups', value: 11, image: `${BASE_URL}/cupa.jpg` },
  { id: 'cu12', name: 'Лицар Кубків', nameEn: 'Knight of Cups', value: 12, image: `${BASE_URL}/cukn.jpg` },
  { id: 'cu13', name: 'Королева Кубків', nameEn: 'Queen of Cups', value: 13, image: `${BASE_URL}/cuqu.jpg` },
  { id: 'cu14', name: 'Король Кубків', nameEn: 'King of Cups', value: 14, image: `${BASE_URL}/cuki.jpg` },

  // Swords (Мечі)
  { id: 'sw01', name: 'Туз Мечів', nameEn: 'Ace of Swords', value: 1, image: `${BASE_URL}/swac.jpg` },
  { id: 'sw02', name: 'Двійка Мечів', nameEn: 'Two of Swords', value: 2, image: `${BASE_URL}/sw02.jpg` },
  { id: 'sw03', name: 'Трійка Мечів', nameEn: 'Three of Swords', value: 3, image: `${BASE_URL}/sw03.jpg` },
  { id: 'sw04', name: 'Четвірка Мечів', nameEn: 'Four of Swords', value: 4, image: `${BASE_URL}/sw04.jpg` },
  { id: 'sw05', name: 'П’ятірка Мечів', nameEn: 'Five of Swords', value: 5, image: `${BASE_URL}/sw05.jpg` },
  { id: 'sw06', name: 'Шістка Мечів', nameEn: 'Six of Swords', value: 6, image: `${BASE_URL}/sw06.jpg` },
  { id: 'sw07', name: 'Сімка Мечів', nameEn: 'Seven of Swords', value: 7, image: `${BASE_URL}/sw07.jpg` },
  { id: 'sw08', name: 'Вісімка Мечів', nameEn: 'Eight of Swords', value: 8, image: `${BASE_URL}/sw08.jpg` },
  { id: 'sw09', name: 'Дев’ятка Мечів', nameEn: 'Nine of Swords', value: 9, image: `${BASE_URL}/sw09.jpg` },
  { id: 'sw10', name: 'Десятка Мечів', nameEn: 'Ten of Swords', value: 10, image: `${BASE_URL}/sw10.jpg` },
  { id: 'sw11', name: 'Паж Мечів', nameEn: 'Page of Swords', value: 11, image: `${BASE_URL}/swpa.jpg` },
  { id: 'sw12', name: 'Лицар Мечів', nameEn: 'Knight of Swords', value: 12, image: `${BASE_URL}/swkn.jpg` },
  { id: 'sw13', name: 'Королева Мечів', nameEn: 'Queen of Swords', value: 13, image: `${BASE_URL}/swqu.jpg` },
  { id: 'sw14', name: 'Король Мечів', nameEn: 'King of Swords', value: 14, image: `${BASE_URL}/swki.jpg` },

  // Pentacles (Пентаклі)
  { id: 'pe01', name: 'Туз Пентаклів', nameEn: 'Ace of Pentacles', value: 1, image: `${BASE_URL}/peac.jpg` },
  { id: 'pe02', name: 'Двійка Пентаклів', nameEn: 'Two of Pentacles', value: 2, image: `${BASE_URL}/pe02.jpg` },
  { id: 'pe03', name: 'Трійка Пентаклів', nameEn: 'Three of Pentacles', value: 3, image: `${BASE_URL}/pe03.jpg` },
  { id: 'pe04', name: 'Четвірка Пентаклів', nameEn: 'Four of Pentacles', value: 4, image: `${BASE_URL}/pe04.jpg` },
  { id: 'pe05', name: 'П’ятірка Пентаклів', nameEn: 'Five of Pentacles', value: 5, image: `${BASE_URL}/pe05.jpg` },
  { id: 'pe06', name: 'Шістка Пентаклів', nameEn: 'Six of Pentacles', value: 6, image: `${BASE_URL}/pe06.jpg` },
  { id: 'pe07', name: 'Сімка Пентаклів', nameEn: 'Seven of Pentacles', value: 7, image: `${BASE_URL}/pe07.jpg` },
  { id: 'pe08', name: 'Вісімка Пентаклів', nameEn: 'Eight of Pentacles', value: 8, image: `${BASE_URL}/pe08.jpg` },
  { id: 'pe09', name: 'Дев’ятка Пентаклів', nameEn: 'Nine of Pentacles', value: 9, image: `${BASE_URL}/pe09.jpg` },
  { id: 'pe10', name: 'Десятка Пентаклів', nameEn: 'Ten of Pentacles', value: 10, image: `${BASE_URL}/pe10.jpg` },
  { id: 'pe11', name: 'Паж Пентаклів', nameEn: 'Page of Pentacles', value: 11, image: `${BASE_URL}/pepa.jpg` },
  { id: 'pe12', name: 'Лицар Пентаклів', nameEn: 'Knight of Pentacles', value: 12, image: `${BASE_URL}/pekn.jpg` },
  { id: 'pe13', name: 'Королева Пентаклів', nameEn: 'Queen of Pentacles', value: 13, image: `${BASE_URL}/pequ.jpg` },
  { id: 'pe14', name: 'Король Пентаклів', nameEn: 'King of Pentacles', value: 14, image: `${BASE_URL}/peki.jpg` }
];