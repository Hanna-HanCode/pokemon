const API_URL = 'https://api.pokemontcg.io/v2/sets?q=name:"Perfect Order"';

async function findSet() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    console.log(JSON.stringify(data.data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
findSet();
