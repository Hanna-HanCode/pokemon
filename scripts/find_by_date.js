const API_URL = 'https://api.pokemontcg.io/v2/cards?q=set.releaseDate:2026/03/27&pageSize=1';

async function findCardsByDate() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    console.log(JSON.stringify(data.data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
findCardsByDate();
