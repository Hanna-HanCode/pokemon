<script lang="ts">
    export let data: any;

    const flagMap: Record<string, string> = {
        'Português': '🇧🇷',
        'Inglês': '🇺🇸',
        'Japonês': '🇯🇵',
        'Espanhol': '🇪🇸',
        'Francês': '🇫🇷',
        'Alemão': '🇩🇪',
        'Italiano': '🇮🇹',
        'Coreano': '🇰🇷',
        'Chinês': '🇨🇳',
        'Russo': '🇷🇺'
    };

    function getFlag(lang: string | null) {
        if (!lang) return '❓';
        return flagMap[lang] || '🌐';
    }

    function formatCurrency(value: number | string | null) {
        if (value === null || value === undefined) return '---';
        return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function formatDate(dateStr: string | null) {
        if (!dateStr) return 'No data';
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR');
    }

    // Group stats by card ID
    $: groupedStats = Object.values(data.stats.reduce((acc: any, curr: any) => {
        if (!acc[curr.id]) {
            acc[curr.id] = { 
                id: curr.id,
                name: curr.name,
                set: curr.set,
                image: curr.image,
                editions: [] 
            };
        }
        if (curr.language) {
            acc[curr.id].editions.push(curr);
        }
        return acc;
    }, {}));
</script>

<header class="hero">
    <div class="hero-content">
        <h1>PokéTCG <span class="accent">Aggregator</span></h1>
        <p>Market insights across all languages from LigaPokemon</p>
    </div>
</header>

<main class="container">
    <div class="stats-grid">
        {#each groupedStats as card}
            <div class="card-glass">
                <div class="image-wrapper">
                    <img src={card.image} alt={card.name} loading="lazy" />
                    <div class="image-overlay"></div>
                </div>
                
                <div class="card-content">
                    <div class="card-header">
                        <h2>{card.name}</h2>
                        <span class="set-tag">{card.set}</span>
                    </div>

                    <div class="editions-list">
                        {#each card.editions as edition}
                            <div class="edition-row">
                                <div class="edition-info">
                                    <span class="flag" title={edition.language}>{getFlag(edition.language)}</span>
                                    <span class="lang-name">{edition.language}</span>
                                </div>
                                <div class="edition-prices">
                                    <div class="price-main">
                                        <span class="value">{formatCurrency(edition.avg_price)}</span>
                                        <span class="count">({edition.listing_count} listings)</span>
                                    </div>
                                    <div class="price-range">
                                        <span class="min success">{formatCurrency(edition.min_price)}</span>
                                        <span class="separator">/</span>
                                        <span class="max danger">{formatCurrency(edition.max_price)}</span>
                                    </div>
                                </div>
                            </div>
                        {/each}
                        
                        {#if card.editions.length === 0}
                            <p class="no-data">No price data harvested yet.</p>
                        {/if}
                    </div>

                    <div class="card-footer">
                        <div class="footer-item">
                            <span class="icon">🕒</span>
                            <span>Updated: {card.editions[0] ? formatDate(card.editions[0].date) : '---'}</span>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>

    {#if groupedStats.length === 0}
        <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>No cards tracked yet</h3>
            <p>Import cards using the Pokémon TCG API to start tracking.</p>
        </div>
    {/if}
</main>

<style>
    .container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 2rem 4rem 2rem;
    }

    .hero {
        padding: 5rem 2rem;
        text-align: center;
        background: radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
    }

    .hero h1 {
        font-size: 3.5rem;
        margin-bottom: 1rem;
        letter-spacing: -0.02em;
    }

    .accent {
        color: var(--accent-blue);
    }

    .hero p {
        color: var(--text-secondary);
        font-size: 1.25rem;
        max-width: 600px;
        margin: 0 auto;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 2.5rem;
    }

    .card-glass {
        background: var(--bg-card);
        backdrop-filter: var(--glass-blur);
        border: 1px solid var(--border-card);
        border-radius: 24px;
        overflow: hidden;
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
        display: flex;
        flex-direction: column;
    }

    .card-glass:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        border-color: rgba(255, 255, 255, 0.15);
    }

    .image-wrapper {
        position: relative;
        height: 280px;
        padding: 2rem;
        background: rgba(255, 255, 255, 0.02);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .image-wrapper img {
        max-height: 100%;
        max-width: 100%;
        object-fit: contain;
        z-index: 2;
        filter: drop-shadow(0 15px 25px rgba(0, 0, 0, 0.5));
        transition: transform 0.5s ease;
    }

    .card-glass:hover .image-wrapper img {
        transform: scale(1.05) rotate(2deg);
    }

    .image-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 50%;
        background: linear-gradient(to top, var(--bg-card), transparent);
        z-index: 1;
    }

    .card-content {
        padding: 1.5rem 2rem 2rem 2rem;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    .card-header h2 {
        font-size: 1.4rem;
        margin-bottom: 0.5rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .set-tag {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--accent-blue);
        background: rgba(59, 130, 246, 0.1);
        padding: 0.25rem 0.75rem;
        border-radius: 100px;
        margin-bottom: 2rem;
    }

    .editions-list {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        margin-bottom: 2rem;
    }

    .edition-row {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .edition-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .flag {
        font-size: 1.5rem;
        line-height: 1;
    }

    .lang-name {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .edition-prices {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .price-main {
        display: flex;
        align-items: baseline;
        gap: 0.75rem;
    }

    .price-main .value {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
    }

    .price-main .count {
        font-size: 0.75rem;
        color: var(--text-secondary);
    }

    .price-range {
        display: flex;
        gap: 0.5rem;
        font-size: 0.85rem;
        font-weight: 600;
    }

    .separator {
        opacity: 0.3;
    }

    .no-data {
        text-align: center;
        color: var(--text-secondary);
        font-size: 0.9rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 12px;
    }

    @media (max-width: 768px) {
        .hero h1 { font-size: 2.5rem; }
        .stats-grid { grid-template-columns: 1fr; }
    }
</style>
