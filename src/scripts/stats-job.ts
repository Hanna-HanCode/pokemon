import { generateDailyStats } from '../lib/services/statsAggregator.js';

async function main() {
  // Use Brasília local date (UTC-3) to avoid day boundary mismatch
  const now = new Date();
  const brDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const today = brDate.toISOString().split('T')[0];
  console.log(`Aggregating stats for ${today} (BRT)...`);
  await generateDailyStats(today);
  console.log('Stats aggregated successfully.');
  process.exit(0);
}

main();
