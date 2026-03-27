const API_URL = 'https://api.pokemontcg.io/v2/sets?orderBy=-releaseDate&pageSize=10';

async function listAllSets() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    console.log(JSON.stringify(data.data.map(s => ({ id: s.id, name: s.name, releaseDate: s.releaseDate })), null, 2));
  } catch (err) {
    console.error(err);
  }
}
listAllSets();
