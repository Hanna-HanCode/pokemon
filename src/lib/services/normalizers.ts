export async function normalizeRawListing(item: any): Promise<{ card_id: string | null, price: number | null, condition: string | null }> {
  let card_id = item.card_id || null;
  
  let price = null;
  if (item.price_text) {
      // Clean BRL formatting: R$ 1.500,00 -> 1500.00
      const clean = item.price_text.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
      price = parseFloat(clean);
  }
  
  let condition = item.condition_text || 'Unknown';
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower === 'm' || conditionLower.includes('mint')) condition = 'M';
  else if (conditionLower === 'nm' || conditionLower.includes('near')) condition = 'NM';
  else if (conditionLower === 'sp' || conditionLower.includes('slightly')) condition = 'SP';
  else if (conditionLower === 'mp' || conditionLower.includes('moderately')) condition = 'MP';
  else if (conditionLower === 'hp' || conditionLower.includes('heavily')) condition = 'HP';
  else if (conditionLower === 'd' || conditionLower.includes('damaged')) condition = 'DMG';

  return { card_id, price, condition };
}
