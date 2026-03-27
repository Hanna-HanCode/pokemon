const API_URL = 'https://api.pokemontcg.io/v2/sets?orderBy=-releaseDate&pageSize=10';

async function finalTry() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    for (const set of data.data) {
        console.log(`${set.id} | ${set.name} | ${set.releaseDate}`);
    }
  } catch (err) {
    console.error(err);
  }
}
finalTry();
