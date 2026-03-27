async function checkUrl(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`${url}: ${response.status}`);
    } catch (err) {
        console.log(`${url}: FAILED`);
    }
}

checkUrl('https://images.pokemontcg.io/me3/logo.png');
checkUrl('https://images.pokemontcg.io/me3/symbol.png');
checkUrl('https://images.pokemontcg.io/me3/1_hires.png');
