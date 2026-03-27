const API_URL = 'https://api.pokemontcg.io/v2/cards?q=set.series:"Mega Evolution"&pageSize=250';

async function finalAudit() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    const setIds = [...new Set(data.data.map(c => c.set.id))];
    console.log(`Set IDs in Mega Evolution series: ${setIds.join(', ')}`);
    
    const perfectOrder = data.data.filter(c => c.set.name.includes('Perfect Order'));
    console.log(`Perfect Order cards found: ${perfectOrder.length}`);
    if (perfectOrder.length > 0) {
        console.log(`Common set ID for them: ${perfectOrder[0].set.id}`);
    }
  } catch (err) {
    console.error(err);
  }
}
finalAudit();
