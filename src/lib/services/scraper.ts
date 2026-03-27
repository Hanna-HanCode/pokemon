import { chromium } from 'playwright';
import { db } from '../db/index.js';
import Tesseract from 'tesseract.js';

export interface RawListingResult {
    card_id: string;
    card_name: string;
    price_text: string;
    condition_text: string;
    seller_name: string;
    language: string;
}

// Maps PokéTCG API set names → LigaPokemon edition codes
const SET_CODE_MAP: Record<string, string> = {
    'Base Set': 'BS',
    'Base Set 2': 'B2',
    'Jungle': 'JU',
    'Fossil': 'FO',
    'Team Rocket': 'R',
    'Gym Heroes': 'G1',
    'Gym Challenge': 'G2',
    'Neo Genesis': 'N1',
    'Neo Discovery': 'N2',
    'Neo Revelation': 'N3',
    'Neo Destiny': 'N4',
    'Legendary Collection': 'LC',
    'Expedition Base Set': 'EX',
    'Aquapolis': 'AQ',
    'Skyridge': 'SK',
    'Crystal Guardians': 'CG',
    'Power Keepers': 'PK',
    'Diamond & Pearl': 'DP',
    'Secret Wonders': 'SW',
    'Supreme Victors': 'SV',
    'Boundaries Crossed': 'BC',
    'Roaring Skies': 'RS',
    'Evolutions': 'EVO',
    'Burning Shadows': 'BUS',
    'Cosmic Eclipse': 'CEC',
    'Unbroken Bonds': 'UNB',
    'Team Up': 'TEU',
    'Hidden Fates': 'HIF',
    'Dragon Majesty': 'DRM',
    'Flashfire': 'FLF',
    'Generations': 'GEN',
    'Darkness Ablaze': 'DAA',
    'Vivid Voltage': 'VIV',
    'Arceus': 'AR',
    'Detective Pikachu': 'DET',
    "McDonald's Collection 2016": "MD6",
    "McDonald's Collection 2019": "MD9",
    'POP Series 2': 'POP2',
    'POP Series 4': 'POP4',
    'POP Series 5': 'POP5',
    'POP Series 6': 'POP6',
    'POP Series 9': 'POP9',
    'Pokémon Rumble': 'RUM',
    'Legendary Treasures': 'LT',
    'DP Black Star Promos': 'DPBSP',
    'HGSS Black Star Promos': 'HGBSP',
    'SM Black Star Promos': 'SMBSP',
    'Nintendo Black Star Promos': 'NBSP',
    'Wizards Black Star Promos': 'WBSP',
    'XY Black Star Promos': 'XYBSP',
    // Mega Evolution Series
    'Mega Evolution': 'MEG',
    'Phantasmal Flames': 'PFL',
    'Ascended Heroes': 'ASC',
    'Perfect Order': 'POR',
    // Scarlet & Violet Series
    'Scarlet & Violet': 'SV1',
    'Paldea Evolved': 'SV2',
    'Obsidian Flames': 'SV3',
    '151': 'MEW',
    'Paradox Rift': 'SV4',
    'Paldean Fates': 'PAF',
    'Temporal Forces': 'TEF',
    'Twilight Masquerade': 'TWM',
    'Shrouded Fable': 'SFA',
    'Stellar Crown': 'SCR',
    'Surging Sparks': 'SSP',
    'Prismatic Evolutions': 'PRE',
};

export async function runScraper(): Promise<RawListingResult[]> {
    // Fetch all cards from database to scrape
    const { rows: cards } = await db.query('SELECT id, name, "set", collector_number FROM cards');
    console.log(`Found ${cards.length} cards to scrape.`);
    
    if (cards.length === 0) {
        console.warn('No cards found in database to scrape.');
        return [];
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    
    const listings: RawListingResult[] = [];
    const worker = await Tesseract.createWorker('eng');
    
    try {
        // Scrape all available cards
        const cardsToScrape = cards;
        
        for (const card of cardsToScrape) {
            const ligaSetCode = SET_CODE_MAP[card.set];
            
            if (!ligaSetCode) {
                console.log(`[SKIPPED] No LigaPokemon code for "${card.set}" — skipping ${card.name}`);
                continue;
            }

            // Standardize card number (extract first part of 20/189)
            const cardNum = card.collector_number?.split('/')[0] || card.collector_number;
            let cardUrl = `https://www.ligapokemon.com.br/?view=cards/card&card=${encodeURIComponent(card.name)}&ed=${ligaSetCode}&num=${cardNum || ''}&show=1`;
            
            console.log(`[PROCESS] ${card.name} (${card.set}) [#${cardNum}] → ${cardUrl}`);
            
            try {
                await page.waitForTimeout(5000);
                
                // --- VERIFICATION STEP ---
                // Wait for the selectors to be present
                await page.waitForSelector('.card-name', { timeout: 10000 }).catch(() => {});
                
                let pageCardName = await page.locator('.card-name').first().textContent().catch(() => '');
                let pageEdition = await page.locator('.select-card-edition .entry, .select-card-edition [id*="select2-"], .select2-selection__rendered').first().textContent().catch(() => '');
                let pageNumber = await page.locator('.select-card-edition b').first().textContent().catch(() => '');
                
                const cleanPageName = pageCardName?.replace(/\(.*?\)/, '').trim() || '';
                const cleanPageNumber = pageNumber?.replace('#', '').trim() || '';
                const cleanDBName = card.name.trim();
                
                // Strict check: Name must match (case-insensitive) AND (Edition code must be in header OR set name must match)
                const isCorrectPage = cleanPageName.toLowerCase() === cleanDBName.toLowerCase() && 
                                    (pageEdition?.toUpperCase().includes(ligaSetCode.toUpperCase()) || 
                                     pageEdition?.toLowerCase().includes(card.set.toLowerCase()));
                                     
                // Optional: also check number if available
                const numberMatches = !cardNum || cleanPageNumber === cardNum;
                
                const finalMatch = isCorrectPage && numberMatches;

                if (!finalMatch) {
                    console.log(`[RETRY] Page mismatch: "${cleanPageName}" / "${pageEdition}". Searching specifically...`);
                    // Search fallback
                    await page.goto(`https://www.ligapokemon.com.br/?view=cards/card&card=${encodeURIComponent(card.name)}`, { waitUntil: 'domcontentloaded' });
                    await page.waitForTimeout(3000);
                    
                    // Look for the correct link in "Outras Edições" or results
                    const links = await page.locator(`a[href*="ed=${ligaSetCode}"][href*="num=${cardNum}"]`).all();
                    if (links.length > 0) {
                        await links[0].click();
                        await page.waitForTimeout(3000);
                    } else {
                        // Try just by set code
                        const setLinks = await page.locator(`a[href*="ed=${ligaSetCode}"]`).all();
                        if (setLinks.length > 0) {
                            // Find the one with the correct number in text
                            let found = false;
                            for (const link of setLinks) {
                                const text = await link.evaluate(el => el.parentElement?.textContent || '');
                                if (text.includes(cardNum)) {
                                    await link.click();
                                    await page.waitForTimeout(3000);
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                console.log(`[FAILED] Could not find exact match for ${card.name} in set ${card.set} (#${cardNum})`);
                                continue;
                            }
                        } else {
                             console.log(`[FAILED] No links for set ${ligaSetCode} found for ${card.name}`);
                             continue;
                        }
                    }
                }
                // --- END VERIFICATION ---
                
                // Deep scroll to trigger all dynamic content
                for (let i = 0; i < 5; i++) {
                    await page.evaluate(() => window.scrollBy(0, 1000));
                    await page.waitForTimeout(1000);
                }
                
                const rowLocators = await page.locator('.store[id^="mpline_"]').all();
                console.log(`[DATA] Found ${rowLocators.length} marketplace rows for ${card.name}.`);
                
                // Limit to top 15 rows (usually the cheapest) to prevent infinite OCR loops
                const rowsToProcess = rowLocators.slice(0, 15);
                
                for (let i = 0; i < rowsToProcess.length; i++) {
                    const row = rowsToProcess[i];
                    try {
                        const conditionEl = row.locator('.quality').first();
                        const conditionText = (await conditionEl.count()) > 0 ? await conditionEl.getAttribute('title') : 'Praticamente Nova (NM)';
                        const conditionMatch = conditionText?.match(/\((.*?)\)/)?.[1] || 'NM';
                        
                        const langImgEl = row.locator('img[src*="country-flags-icons"]').first();
                        const language = (await langImgEl.count()) > 0 ? await langImgEl.getAttribute('title') : 'Português';
                        
                        // Seller Name: try title or alt on the store logo
                        const sellerLogo = row.locator('.store-name img').first();
                        let sellerName = 'LigaShop';
                        if (await sellerLogo.count() > 0) {
                            sellerName = await sellerLogo.getAttribute('alt') || await sellerLogo.getAttribute('title') || 'LigaShop';
                            // If still empty, try to get from the link
                            if (sellerName === 'LigaShop') {
                                const storeLink = row.locator('a.link-store').first();
                                sellerName = await storeLink.getAttribute('title') || 'LigaShop';
                            }
                        }

                        let priceText = '0,00';
                        const priceDiv = row.locator('.price, .new-price').first();
                        
                        if (await priceDiv.isVisible()) {
                            // OCR OCR OCR
                            const buffer = await priceDiv.screenshot({ type: 'png' });
                            const { data: { text } } = await worker.recognize(buffer);
                            
                            const cleanText = text.replace(/[^0-9,.]/g, '').trim();
                            if (cleanText) priceText = cleanText;
                        }

                        // Fallback if OCR fails
                        if (!priceText || priceText === '0,00' || priceText === '') {
                            const fallbackPrice = await priceDiv.textContent().catch(() => '0,00');
                            const match = fallbackPrice?.match(/[\d,.]+/);
                            if (match) priceText = match[0];
                        }
                        
                        // Ultra-robust BRL cleaning
                        // Examples: 200,26 -> 200.26 | 1.500,00 -> 1500.00 | 1,500.00 -> 1500.00
                        let finalPriceText = priceText.trim();
                        
                        // Detect if there are multiple dots/commas that indicate OCR concat
                        if (finalPriceText.split(/[.,]/).length > 3) {
                             // Likely doubled price (e.g. 20.0020.00)
                             finalPriceText = finalPriceText.slice(0, Math.floor(finalPriceText.length / 2));
                        }

                        // Remove R$ and spaces
                        finalPriceText = finalPriceText.replace(/[R$\s]/g, '');

                        // Handle BRL dots (thousands) and commas (decimals)
                        if (finalPriceText.includes(',') && finalPriceText.includes('.')) {
                            // Format: 1.500,00 -> 1500.00
                            finalPriceText = finalPriceText.replace(/\./g, '').replace(',', '.');
                        } else if (finalPriceText.includes(',')) {
                            // Format: 200,26 -> 200.26
                            finalPriceText = finalPriceText.replace(',', '.');
                        } else if (finalPriceText.includes('.')) {
                             // Format: 200.26 or 1.500 (ambiguous)
                             // If more than 3 digits after dot, assume it was thousands: 1.500 -> 1500
                             const parts = finalPriceText.split('.');
                             if (parts[parts.length - 1].length === 3) {
                                 finalPriceText = finalPriceText.replace(/\./g, '');
                             }
                        }

                        listings.push({
                            card_id: card.id,
                            card_name: card.name,
                            price_text: `R$ ${finalPriceText}`,
                            condition_text: conditionMatch,
                            seller_name: sellerName,
                            language: language || 'Português'
                        });
                        
                    } catch (rowErr) {
                        console.error(`[ERROR] Row ${i} on ${card.name}:`, rowErr);
                    }
                }
                
                console.log(`[SUCCESS] Captured ${Math.min(rowLocators.length, 15)} listings for ${card.name}`);
            } catch (err: any) {
                console.error(`[ERROR] ${card.name}: ${err.message}`);
            }
        }
    } finally {
        await worker.terminate();
        await browser.close();
    }
    
    console.log(`[DONE] Scraper finished. Total listings in memory: ${listings.length}`);
    return listings;
}
