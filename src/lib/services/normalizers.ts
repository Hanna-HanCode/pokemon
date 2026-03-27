export async function normalizeRawListing(item: any): Promise<{ card_id: string | null, price: number | null, condition: string | null, language: string, seller_name: string | null }> {
  let card_id = item.card_id || null;
  
  let price = null;
  if (item.price_text) {
      // Clean BRL formatting: R$ 1.500,00 -> 1500.00
      // But also handle already cleaned formats like R$ 1500.00
      let clean = item.price_text.replace(/[R$\s]/g, '');
      
      if (clean.includes(',') && clean.includes('.')) {
          // Standard BRL: 1.500,00
          clean = clean.replace(/\./g, '').replace(',', '.');
      } else if (clean.includes(',')) {
          // Only comma: 200,26 -> 200.26
          clean = clean.replace(',', '.');
      }
      // If only dot: 200.26 -> keep as is. 
      // If 1.500 -> scraper logic already handled or it's dangerous, but we trust scraper.
      
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

  let language = item.language || 'Desconhecido';
  let seller_name = item.seller_name || null;

  return { card_id, price, condition, language, seller_name };
}
