import { chromium } from 'playwright';
import { db } from '../db/index.js';

export interface RawListingResult {
    card_id: string;
    card_name: string;
    price_text: string;
    condition_text: string;
    seller_name: string;
}

export async function runScraper(): Promise<RawListingResult[]> {
    // Fetch all cards from database to scrape
    let { rows: cards } = await db.query('SELECT id, name, set FROM cards');
    cards = cards.slice(0, 15); // INCREASE TO 15 CARDS FOR BROAD SAMPLE
    
    if (cards.length === 0) {
        console.warn('No cards found in database to scrape.');
        return [];
    }

    const browser = await chromium.launch({ headless: true });
    // Use a real browser user agent to avoid some blocks
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    
    const listings: RawListingResult[] = [];
    
    try {
        for (const card of cards) {
            console.log(`Scraping LigaPokemon for: ${card.name} (${card.set})...`);
            
            const encodedQuery = encodeURIComponent(card.name);
            await page.goto(`https://www.ligapokemon.com.br/?view=cards/search&card=${encodedQuery}`, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(4000);

            const cardLink = await page.evaluate((targetSet) => {
                const links = Array.from(document.querySelectorAll('a.main-link-card[href*="view=cards/card"]'));
                for (const link of links) {
                    const parent = link.closest('.card-item') || link.parentElement;
                    if (parent && parent.textContent?.toLowerCase().includes(targetSet.toLowerCase())) {
                        return (link as HTMLAnchorElement).href;
                    }
                }
                return links.length > 0 ? (links[0] as HTMLAnchorElement).href : null;
            }, card.set);

            if (!cardLink) {
                console.warn(`Could not find card link for ${card.name} (${card.set})`);
                continue;
            }

            await page.goto(cardLink, { waitUntil: 'domcontentloaded' });
            await page.waitForLoadState('networkidle');
            
            // Handle cookie banner if present
            try {
                const cookieBtn = await page.$('button:contains("TODOS"), .btn-permitir-cookies');
                if (cookieBtn) await cookieBtn.click();
            } catch (e) {}

            console.log(`Waiting for marketplace on ${card.name}...`);
            // Deep scroll to trigger all AJAX behaviors
            for (let i = 0; i < 4; i++) {
                await page.evaluate(() => window.scrollBy(0, 1000));
                await page.waitForTimeout(1500);
            }
            
            await page.waitForTimeout(5000); // Wait extra for last rows

            const shopListings = await page.evaluate(({ cardName, cardId }) => {
                const results: any[] = [];
                
                // Strategy 1: Find all elements containing "R$" and "R$ ...,.."
                const priceElements = Array.from(document.querySelectorAll('*')).filter(el => {
                    return el.children.length === 0 && el.textContent?.includes('R$') && /R\$\s*[\d,.]+/.test(el.textContent);
                });

                priceElements.forEach(el => {
                    const priceText = el.textContent?.trim() || '';
                    const parentRow = el.closest('a, div.item, .mp-card-item') || el.parentElement;
                    const condition = parentRow?.textContent?.match(/(NM|SP|MP|HP|D|Danificada)/i)?.[0] || 'NM';
                    
                    results.push({
                        card_id: cardId,
                        card_name: cardName,
                        price_text: priceText,
                        condition_text: condition.toUpperCase(),
                        seller_name: 'LigaShop'
                    });
                });

                // Strategy 2: Specific LigaPokemon selectors as fallback
                if (results.length === 0) {
                    const links = document.querySelectorAll('a.link-store');
                    links.forEach(link => {
                        const priceMatch = link.textContent?.match(/R\$\s*([\d,.]+)/);
                        if (priceMatch) {
                            results.push({
                                card_id: cardId,
                                card_name: cardName,
                                price_text: priceMatch[0],
                                condition_text: 'NM',
                                seller_name: link.querySelector('.name')?.textContent?.trim() || 'LigaShop'
                            });
                        }
                    });
                }
                
                return results;
            }, { cardName: card.name, cardId: card.id });

            if (shopListings.length > 0) {
                listings.push(...shopListings);
                console.log(`Found ${shopListings.length} listings for ${card.name}`);
            } else {
                console.log(`Still no listings for ${card.name}`);
            }
        }
    } catch (error) {
        console.error(`Error during scraping LigaPokemon:`, error);
    } finally {
        await browser.close();
    }
    
    console.log(`Scraping complete. Total listings found: ${listings.length}`);
    return listings;
}
