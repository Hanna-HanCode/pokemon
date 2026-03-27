async function checkAltUrl(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`${url}: ${response.status}`);
    } catch (err) {
        console.log(`${url}: FAILED`);
    }
}

checkAltUrl('https://images.pokemontcg.io/me03/logo.png');
checkAltUrl('https://images.pokemontcg.io/me03/symbol.png');
checkAltUrl('https://images.pokemontcg.io/me3/logo.png');
checkAltUrl('https://images.pokemontcg.io/me3/symbol.png');
