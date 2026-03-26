import cron from 'node-cron';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

console.log("Starting LigaPokemon Scheduler Worker...");
console.log("Registered task to execute Scraping and Aggregation daily at 21:00 BRT (Brasilia Time)");

// 0 * * * * translates to 00:00, 01:00, etc. every day
cron.schedule('0 * * * *', async () => {
    console.log(`[${new Date().toISOString()}] Initiating daily LigaPokemon jobs...`);
    
    try {
        console.log("-> Running Ingestion Scraper...");
        const { stdout: scraperOut, stderr: scraperErr } = await execPromise('npm run job:scrape');
        if (scraperErr) console.error(`Scraper Warnings: ${scraperErr}`);
        console.log(`Scraper Success:\n${scraperOut}`);

        console.log("-> Running Stats Aggregator...");
        const { stdout: statsOut, stderr: statsErr } = await execPromise('npm run job:stats');
        if (statsErr) console.error(`Stats Warnings: ${statsErr}`);
        console.log(`Stats Success:\n${statsOut}`);

        console.log(`[${new Date().toISOString()}] Daily routine completed successfully!`);
        
    } catch (err: any) {
        console.error(`[${new Date().toISOString()}] ERROR during daily execution:`, err.message);
    }
}, {
    timezone: "America/Sao_Paulo"
});
