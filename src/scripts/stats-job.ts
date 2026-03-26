import { generateDailyStats } from '../lib/services/statsAggregator.js';

async function main() {
  const today = new Date().toISOString().split('T')[0];
  console.log(`Aggregating stats for ${today}...`);
  await generateDailyStats(today);
  console.log('Stats aggregated successfully.');
  process.exit(0);
}

main();
