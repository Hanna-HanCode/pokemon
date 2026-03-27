const API_URL = 'https://api.pokemontcg.io/v2/cards?q=set.id:me3';

async function finalCheck() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    console.log(`Cards found: ${data.totalCount}`);
    if (data.data && data.data.length > 0) {
        console.log(`First card: ${data.data[0].name} (${data.data[0].id})`);
    }
  } catch (err) {
    console.error(err);
  }
}
finalCheck();
