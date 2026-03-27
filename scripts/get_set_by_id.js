const API_URL = 'https://api.pokemontcg.io/v2/sets/me3';

async function getSetById() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
        console.log(`Set not found (HTTP ${response.status})`);
        return;
    }
    const data = await response.json();
    console.log(JSON.stringify(data.data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
getSetById();
