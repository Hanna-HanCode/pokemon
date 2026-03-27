const API_URL = 'https://api.pokemontcg.io/v2/sets';

async function checkTotal() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    console.log(`Total sets: ${data.totalCount}`);
  } catch (err) {
    console.error(err);
  }
}
checkTotal();
