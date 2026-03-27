const API_URL = 'https://api.pokemontcg.io/v2/sets?q=id:me*';

async function lastHope() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    console.log(JSON.stringify(data.data.map(s => ({ id: s.id, name: s.name })), null, 2));
  } catch (err) {
    console.error(err);
  }
}
lastHope();
