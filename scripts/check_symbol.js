async function checkSymbol() {
    const url = 'https://images.scrydex.com/pokemon/me3-logo/symbol'; // Speculative
    try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`${url}: ${response.status}`);
    } catch (err) {
        console.log(`${url}: FAILED`);
    }
}
checkSymbol();
