const API_URL = 'https://api.pokemontcg.io/v2/sets?pageSize=250';

async function dumpSets() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    const sets = data.data.map(s => `${s.id} | ${s.name} | ${s.releaseDate}`);
    console.log(sets.join('\n'));
  } catch (err) {
    console.error(err);
  }
}
dumpSets();
