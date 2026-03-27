<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

    export let data: any;

    const flagMap: Record<string, string> = {
        'Português': '🇧🇷',
        'Inglês': '🇺🇸',
        'Japonês': '🇯🇵'
    };

    function formatCurrency(value: number | string | null) {
        if (value === null || value === undefined) return '---';
        return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function formatDate(dateStr: string | null) {
        if (!dateStr) return '---';
        return dateStr; // Already formatted as DD/MM/YYYY by the server
    }

    // Group stats by card, preserving server order (listing_count DESC)
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
    }, {})) as any[];

    // Separate popular cards (top 10) from the rest
    $: popularSet = new Set(data.popularIds || []);
    $: popularCards = groupedStats.filter((c: any) => popularSet.has(c.id));
    $: otherCards = groupedStats.filter((c: any) => !popularSet.has(c.id));

    $: spotlightCard = groupedStats[0];
    $: spotlightEdition = spotlightCard?.editions[0];

    // Chart Data Preparation (Placeholder or using actual stats if available)
    const chartData = {
        labels: ['Jan 2026', 'Feb 2026', 'March 2026', 'March 2026'],
        datasets: [
            {
                label: 'Price',
                fill: true,
                backgroundColor: 'rgba(59, 76, 202, 0.05)',
                borderColor: '#3B4CCA',
                pointBackgroundColor: '#3B4CCA',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#3B4CCA',
                data: [520, 560, 650, 650],
                tension: 0.4
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: { display: true, color: 'rgba(0,0,0,0.05)' },
                ticks: { callback: (val: any) => `R$ ${val}` }
            },
            x: {
                grid: { display: false }
            }
        }
    };
</script>

<div class="dashboard">
    <section class="hero-section container">
        <h1 class="main-title">PokéTCG <span class="highlight">Aggregator</span></h1>
        <p class="subtitle">Real-time market insights from LigaPokemon Marketplace</p>
    </section>

    <section class="spotlight-section container">
        <div class="chart-container card">
            <div class="chart-header">
                <h3>Price Trend Chart</h3>
                <p>{spotlightCard?.name || 'Loading...'}</p>
            </div>
            <div class="chart-wrapper">
                <svg viewBox="0 0 800 300" class="svg-chart">
                    <!-- Grid Lines -->
                    <line x1="50" y1="50" x2="750" y2="50" stroke="#f0f0f0" />
                    <line x1="50" y1="150" x2="750" y2="150" stroke="#f0f0f0" />
                    <line x1="50" y1="250" x2="750" y2="250" stroke="#e5e5e5" stroke-width="2" />
                    
                    <!-- Labels -->
                    <text x="50" y="270" font-size="12" fill="#9ca3af">Jan 2026</text>
                    <text x="283" y="270" font-size="12" fill="#9ca3af">Feb 2026</text>
                    <text x="516" y="270" font-size="12" fill="#9ca3af">Mar 2026</text>
                    <text x="750" y="270" font-size="12" fill="#9ca3af" text-anchor="end">Mar 2026</text>
                    
                    <text x="30" y="55" font-size="12" fill="#9ca3af" text-anchor="end">R$ 700</text>
                    <text x="30" y="155" font-size="12" fill="#9ca3af" text-anchor="end">R$ 600</text>
                    <text x="30" y="255" font-size="12" fill="#9ca3af" text-anchor="end">R$ 500</text>

                    <!-- Area Path -->
                    <path d="M 50 250 L 50 220 L 283 180 L 516 100 L 750 100 L 750 250 Z" 
                          fill="url(#gradient)" opacity="0.1" />
                    
                    <!-- Line Path -->
                    <path d="M 50 220 L 283 180 L 516 100 L 750 100" 
                          fill="none" stroke="#3B4CCA" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                    
                    <!-- Points -->
                    <circle cx="50" cy="220" r="5" fill="#3B4CCA" stroke="white" stroke-width="2" />
                    <circle cx="283" cy="180" r="5" fill="#3B4CCA" stroke="white" stroke-width="2" />
                    <circle cx="516" cy="100" r="5" fill="#3B4CCA" stroke="white" stroke-width="2" />
                    <circle cx="750" cy="100" r="5" fill="#3B4CCA" stroke="white" stroke-width="2" />

                    <!-- Price Tags -->
                    <text x="50" y="205" font-size="12" font-weight="700" fill="#374151" text-anchor="middle">R$ 520</text>
                    <text x="516" y="85" font-size="12" font-weight="700" fill="#374151" text-anchor="middle">R$ 650</text>
                    <text x="750" y="85" font-size="12" font-weight="700" fill="#374151" text-anchor="middle">R$ 650</text>

                    <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="#3B4CCA" />
                            <stop offset="100%" stop-color="#fff" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>

        {#if spotlightCard}
            <div class="featured-card card">
                <div class="card-img">
                    <img src={spotlightCard.image} alt={spotlightCard.name} />
                </div>
                <div class="card-details">
                    <h2 class="card-name">{spotlightCard.name}</h2>
                    <span class="set-name">{spotlightCard.set}</span>
                    
                    <div class="price-summary">
                        <span class="label">MÉDIA DE MERCADO</span>
                        <div class="avg-price">{formatCurrency(spotlightEdition?.avg_price)}</div>
                    </div>

                    <div class="price-stats">
                        <div class="stat">
                            <span class="label">MENOR PREÇO</span>
                            <span class="val">{formatCurrency(spotlightEdition?.min_price)}</span>
                        </div>
                        <div class="stat">
                            <span class="label">MAIOR PREÇO</span>
                            <span class="val">{formatCurrency(spotlightEdition?.max_price)}</span>
                        </div>
                    </div>

                    <div class="card-meta">
                        <span>🏷️ {spotlightEdition?.listing_count || 0} listagens</span>
                        <span>📅 {formatDate(spotlightEdition?.date)}</span>
                    </div>
                </div>
            </div>
        {/if}
    </section>

    <section class="popular-section container">
        <div class="section-header">
            <h2>🔥 Cartas Populares</h2>
            <p class="section-subtitle">Top 10 cartas com mais listagens no marketplace</p>
        </div>
        
        <div class="popular-grid">
            {#each popularCards as card, i}
                <a href="/cartas/{card.id}" class="popular-item card">
                    <div class="badge-container">
                        <span class="badge-popular">★ #{i + 1} POPULAR</span>
                    </div>
                    <div class="popular-img">
                        <img src={card.image} alt={card.name} />
                    </div>
                    <div class="popular-info">
                        <h3>{card.name}</h3>
                        <span class="set-tag">{card.set}</span>
                        <div class="popular-price">{formatCurrency(card.editions[0]?.avg_price)}</div>
                        <div class="popular-meta">
                            <span>🏷️ {card.editions[0]?.listing_count || 0} listagens</span>
                            <span>📅 {formatDate(card.editions[0]?.date)}</span>
                        </div>
                    </div>
                </a>
            {/each}
        </div>
    </section>

    {#if otherCards.length > 0}
    <section class="more-section container">
        <div class="section-header">
            <h2>📋 Mais Cartas Monitoradas</h2>
            <p class="section-subtitle">Cartas com dados de preço atualizados</p>
        </div>
        
        <div class="popular-grid">
            {#each otherCards as card}
                <a href="/cartas/{card.id}" class="popular-item card">
                    <div class="popular-img">
                        <img src={card.image} alt={card.name} />
                    </div>
                    <div class="popular-info">
                        <h3>{card.name}</h3>
                        <span class="set-tag">{card.set}</span>
                        <div class="popular-price">{formatCurrency(card.editions[0]?.avg_price)}</div>
                        <div class="popular-meta">
                            <span>🏷️ {card.editions[0]?.listing_count || 0} listagens</span>
                            <span>📅 {formatDate(card.editions[0]?.date)}</span>
                        </div>
                    </div>
                </a>
            {/each}
        </div>
    </section>
    {/if}
</div>

<style>
    .dashboard {
        padding: 3rem 0;
        background-color: var(--bg-main);
    }

    .hero-section {
        text-align: center;
        margin-bottom: 3rem;
    }

    .main-title {
        font-size: 3rem;
        color: #1a1a1a;
        margin-bottom: 0.5rem;
    }

    .main-title .highlight {
        color: var(--poke-blue);
    }

    .subtitle {
        color: var(--text-secondary);
        font-size: 1.1rem;
    }

    .card {
        background: white;
        border-radius: 12px;
        border: 1px solid var(--border-card);
        padding: 1.5rem;
        box-shadow: var(--shadow-sm);
    }

    .spotlight-section {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 2rem;
        margin-bottom: 4rem;
    }

    .chart-header h3 {
        font-size: 1.25rem;
        font-weight: 700;
    }

    .chart-header p {
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    .chart-wrapper {
        margin-top: 1.5rem;
        height: 300px;
    }

    .featured-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .card-img {
        width: 180px;
        height: 250px;
        margin-bottom: 1.5rem;
    }

    .card-img img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .card-name {
        font-size: 1.25rem;
        margin-bottom: 0.25rem;
    }

    .set-name {
        color: var(--poke-blue);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        background: rgba(59, 76, 202, 0.1);
        padding: 0.2rem 0.6rem;
        border-radius: 4px;
        display: inline-block;
        margin-bottom: 1.5rem;
    }

    .price-summary {
        background: #f3f4f6;
        padding: 1rem;
        border-radius: 8px;
        width: 100%;
        margin-bottom: 1rem;
    }

    .label {
        font-size: 0.7rem;
        font-weight: 700;
        color: #9ca3af;
        display: block;
        margin-bottom: 0.25rem;
    }

    .avg-price {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
    }

    .price-stats {
        display: flex;
        width: 100%;
        justify-content: space-around;
        margin-bottom: 1.5rem;
    }

    .stat .val {
        font-weight: 700;
        font-size: 1.1rem;
    }

    .card-meta {
        width: 100%;
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: var(--text-secondary);
        border-top: 1px solid #eee;
        padding-top: 1rem;
    }

    .section-header {
        margin-bottom: 2rem;
    }

    .popular-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 1.5rem;
    }

    .popular-item {
        position: relative;
        padding-top: 2rem;
        transition: transform 0.2s;
    }

    .popular-item:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-lg);
    }

    a.popular-item {
        text-decoration: none;
        color: inherit;
    }

    .badge-container {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
    }

    .popular-img {
        height: 200px;
        margin-bottom: 1rem;
    }

    .popular-img img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .popular-info h3 {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
    }

    .popular-price {
        font-size: 1.4rem;
        font-weight: 800;
        margin-bottom: 1rem;
    }

    .popular-meta {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: var(--text-secondary);
    }


    .set-tag {
        color: var(--poke-blue);
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        background: rgba(59, 76, 202, 0.1);
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
        display: inline-block;
        margin-bottom: 0.5rem;
    }

    .section-subtitle {
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin-top: 0.25rem;
    }

    .more-section {
        margin-top: 4rem;
        padding-bottom: 2rem;
    }

    @media (max-width: 1024px) {
        .spotlight-section { grid-template-columns: 1fr; }
    }
</style>
