<script lang="ts">
    export let data: any;

    const { card, history, listings, languages } = data;

    let activeLanguage = languages[0] || 'Português';

    // Language emoji
    const langEmoji: Record<string,string> = {
        'Português': '🇧🇷','Inglês': '🇺🇸','Japonês': '🇯🇵'
    };

    // Condition display names
    const conditionLabels: Record<string,string> = {
        'NM': 'Near Mint', 'SP': 'Slightly Played', 'MP': 'Moderately Played',
        'HP': 'Heavily Played', 'D': 'Danificado', 'NM-MT': 'Near Mint'
    };
    
    const supertypeLabels: Record<string,string> = {
        'Pokémon': 'Pokémon', 'Trainer': 'Treinador', 'Energy': 'Energia'
    };

    const typeLabels: Record<string,string> = {
        'Colorless': 'Incolor', 'Darkness': 'Escuridão', 'Dragon': 'Dragão',
        'Fairy': 'Fada', 'Fighting': 'Lutador', 'Fire': 'Fogo',
        'Grass': 'Grama', 'Lightning': 'Elétrico', 'Metal': 'Metal',
        'Psychic': 'Psíquico', 'Water': 'Água'
    };

    const rarityLabels: Record<string,string> = {
        'Common': 'Comum', 'Uncommon': 'Incomum', 'Rare': 'Rara',
        'Rare Holo': 'Rara Holo', 'Rare Ultra': 'Rara Ultra',
        'Rare Secret': 'Rara Secreta', 'Rare Rainbow': 'Rara Arco-íris',
        'Rare Shiny': 'Rara Brilhante', 'Amazing Rare': 'Rara Incrível',
        'Promo': 'Promo', 'Legery': 'Lendária'
    };

    function formatCurrency(v: number | string | null) {
        if (!v) return '---';
        return `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Filter history for active language
    $: filteredHistory = history.filter((h: any) => h.language === activeLanguage || (!h.language && activeLanguage === languages[0]));
    $: filteredListings = listings.filter((l: any) => l.language === activeLanguage);

    // --- SVG Chart Computation ---
    const CHART_W = 800;
    const CHART_H = 260;
    const PAD = { top: 20, right: 30, bottom: 50, left: 70 };

    $: chartData = filteredHistory.length > 0 ? filteredHistory : [];
    
    $: prices = chartData.map((d: any) => parseFloat(d.avg_price));
    $: minPrice = prices.length ? Math.min(...prices) : 0;
    $: maxPrice = prices.length ? Math.max(...prices) : 100;
    $: priceRange = maxPrice - minPrice || 1;

    function xPos(i: number, total: number) {
        const w = CHART_W - PAD.left - PAD.right;
        return PAD.left + (total <= 1 ? w/2 : i * (w / (total - 1)));
    }

    function yPos(price: number) {
        const h = CHART_H - PAD.top - PAD.bottom;
        return PAD.top + h - ((price - minPrice) / priceRange) * h;
    }

    $: pathD = chartData.length < 2 ? '' : chartData.map((d: any, i: number) => {
        const x = xPos(i, chartData.length);
        const y = yPos(parseFloat(d.avg_price));
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');

    $: areaD = chartData.length < 2 ? '' : (() => {
        const first = `M ${xPos(0, chartData.length).toFixed(1)} ${(CHART_H - PAD.bottom).toFixed(1)}`;
        const line = chartData.map((d: any, i: number) => `L ${xPos(i, chartData.length).toFixed(1)} ${yPos(parseFloat(d.avg_price)).toFixed(1)}`).join(' ');
        const last = `L ${xPos(chartData.length-1, chartData.length).toFixed(1)} ${(CHART_H - PAD.bottom).toFixed(1)} Z`;
        return `${first} ${line} ${last}`;
    })();

    // Y axis labels (3 lines)
    $: yLabels = [
        { y: yPos(minPrice), value: formatCurrency(minPrice) },
        { y: yPos(minPrice + priceRange/2), value: formatCurrency(minPrice + priceRange/2) },
        { y: yPos(maxPrice), value: formatCurrency(maxPrice) },
    ];

    // X axis labels (show every Nth)
    $: step = Math.max(1, Math.floor(chartData.length / 8));
    $: xLabels = chartData
        .map((d: any, i: number) => ({ i, label: d.label }))
        .filter((_: any, i: number) => i % step === 0 || i === chartData.length - 1);
</script>

<svelte:head>
    <title>{card.name} — PokéTCG Aggregator</title>
</svelte:head>

<div class="card-page">
    <div class="container">
        <!-- Breadcrumb -->
        <nav class="breadcrumb">
            <a href="/">Início</a>
            <span>›</span>
            {#if card.set_id}
                <a href="/colecoes/{card.set_id}">{card.set}</a>
                <span>›</span>
            {/if}
            <span class="current">{card.name}</span>
        </nav>

        <!-- Hero Section -->
        <div class="hero-card card">
            <!-- Card Image -->
            <div class="card-img-col">
                {#if card.image}
                    <img src={card.image} alt={card.name} class="card-img" />
                {:else}
                    <div class="card-img-placeholder">Sem Imagem</div>
                {/if}
            </div>

            <!-- Card Info -->
            <div class="card-info-col">
                <!-- Set logo -->
                {#if card.set_logo}
                    <img src={card.set_logo} alt={card.set} class="set-logo-small" />
                {/if}

                <h1 class="card-title">{card.name}</h1>

                <!-- Tags -->
                <div class="card-tags">
                    {#if card.supertype}
                        <span class="tag tag-blue">{supertypeLabels[card.supertype] || card.supertype}</span>
                    {/if}
                    {#if card.rarity}
                        <span class="tag tag-gold">{rarityLabels[card.rarity] || card.rarity}</span>
                    {/if}
                    {#if card.types}
                        {#each card.types.split(',') as t}
                            <span class="tag tag-type">{typeLabels[t.trim()] || t.trim()}</span>
                        {/each}
                    {/if}
                    {#if card.collector_number}
                        <span class="tag tag-gray">#{card.collector_number}</span>
                    {/if}
                </div>

                <!-- Language Tabs -->
                {#if languages.length > 0}
                <div class="lang-tabs">
                    {#each languages as lang}
                        <button
                            class="lang-tab"
                            class:active={activeLanguage === lang}
                            on:click={() => activeLanguage = lang}
                        >
                            {langEmoji[lang] || ''} {lang}
                        </button>
                    {/each}
                </div>
                {/if}

                <!-- Current Price Summary -->
                {#if filteredListings.length > 0}
                    {#each filteredListings as listing}
                    <div class="price-row">
                        <div class="condition-label">
                            <span class="dot"></span>
                            {conditionLabels[listing.condition] || listing.condition}
                        </div>
                        <div class="price-values">
                            <span class="avg-val">{formatCurrency(listing.avg_price)}</span>
                            <span class="min-val">{formatCurrency(listing.min_price)}</span>
                        </div>
                    </div>
                    {/each}
                {:else}
                    <p class="no-data">Sem listagens disponíveis para {activeLanguage}.</p>
                {/if}
            </div>
        </div>

        <!-- Price Chart Section -->
        <div class="chart-section card">
            <div class="chart-header">
                <h2>📈 Histórico de Preços</h2>
                <div class="chart-meta">
                    {#if chartData.length > 0}
                        <span>{chartData[0]?.label} → {chartData[chartData.length-1]?.label}</span>
                    {/if}
                </div>
            </div>

            {#if chartData.length < 2}
                <div class="no-chart">
                    <p>Dados insuficientes para gerar o gráfico. Aguarde mais coletas do cron.</p>
                </div>
            {:else}
                <div class="svg-wrapper">
                    <svg viewBox="0 0 {CHART_W} {CHART_H}" class="price-chart">
                        <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="var(--poke-blue)" stop-opacity="0.2"/>
                                <stop offset="100%" stop-color="var(--poke-blue)" stop-opacity="0"/>
                            </linearGradient>
                        </defs>

                        <!-- Grid lines -->
                        {#each yLabels as yl}
                            <line x1={PAD.left} y1={yl.y} x2={CHART_W - PAD.right} y2={yl.y}
                                  stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4,4"/>
                            <text x={PAD.left - 8} y={yl.y + 4} text-anchor="end"
                                  font-size="11" fill="#9ca3af">{yl.value}</text>
                        {/each}

                        <!-- X axis line -->
                        <line x1={PAD.left} y1={CHART_H - PAD.bottom} x2={CHART_W - PAD.right} y2={CHART_H - PAD.bottom}
                              stroke="#e5e7eb" stroke-width="1"/>

                        <!-- X labels -->
                        {#each xLabels as xl}
                            <text x={xPos(xl.i, chartData.length)} y={CHART_H - PAD.bottom + 20}
                                  text-anchor="middle" font-size="11" fill="#9ca3af">{xl.label}</text>
                        {/each}

                        <!-- Area fill -->
                        <path d={areaD} fill="url(#chartGrad)" />

                        <!-- Line -->
                        <path d={pathD} fill="none" stroke="var(--poke-blue)" stroke-width="2.5"
                              stroke-linecap="round" stroke-linejoin="round"/>

                        <!-- Points + Tooltips -->
                        {#each chartData as d, i}
                            <circle cx={xPos(i, chartData.length)} cy={yPos(parseFloat(d.avg_price))}
                                    r="4" fill="var(--poke-blue)" stroke="white" stroke-width="2">
                                <title>{d.label}: {formatCurrency(d.avg_price)} (mín {formatCurrency(d.min_price)} / máx {formatCurrency(d.max_price)})</title>
                            </circle>
                        {/each}
                    </svg>
                </div>

                <!-- Condition Cards Bottom -->
                {#if filteredListings.length > 0}
                <div class="condition-grid">
                    {#each filteredListings as l}
                    <div class="condition-card">
                        <div class="cond-name">{conditionLabels[l.condition] || l.condition}</div>
                        <div class="cond-avg">{formatCurrency(l.avg_price)}</div>
                        <div class="cond-min">mín {formatCurrency(l.min_price)}</div>
                        <div class="cond-count">{l.count} listagem{l.count !== 1 ? 's' : ''}</div>
                    </div>
                    {/each}
                </div>
                {/if}
            {/if}
        </div>
    </div>
</div>

<style>
    .card-page {
        padding: 2rem 0 4rem;
        background-color: var(--bg-main);
    }

    .breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.82rem;
        color: var(--text-secondary);
        margin-bottom: 1.5rem;
    }
    .breadcrumb a { color: var(--poke-blue); font-weight: 500; }
    .breadcrumb .current { font-weight: 600; color: var(--text-primary); }

    .card {
        background: white;
        border-radius: 12px;
        border: 1px solid var(--border-card);
        box-shadow: var(--shadow-sm);
        padding: 2rem;
    }

    /* Hero */
    .hero-card {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 2.5rem;
        margin-bottom: 1.5rem;
    }

    .card-img-col {
        display: flex;
        justify-content: center;
    }

    .card-img {
        max-width: 280px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .card-img-placeholder {
        width: 280px;
        height: 390px;
        background: #f3f4f6;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
    }

    .set-logo-small {
        max-height: 40px;
        object-fit: contain;
        margin-bottom: 0.75rem;
    }

    .card-title {
        font-size: 2rem;
        color: var(--text-primary);
        margin-bottom: 0.75rem;
    }

    .card-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-bottom: 1.5rem;
    }

    .tag {
        padding: 0.2rem 0.6rem;
        border-radius: 20px;
        font-size: 0.72rem;
        font-weight: 600;
    }
    .tag-blue { background: rgba(59,76,202,0.1); color: var(--poke-blue); }
    .tag-gold { background: rgba(179,161,37,0.1); color: var(--poke-gold); }
    .tag-type { background: rgba(0,0,0,0.06); color: var(--text-primary); }
    .tag-gray { background: #f3f4f6; color: var(--text-secondary); }

    /* Language tabs */
    .lang-tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
    }

    .lang-tab {
        padding: 0.4rem 1rem;
        border: 1.5px solid var(--border-card);
        border-radius: 20px;
        background: white;
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s;
        color: var(--text-primary);
    }
    .lang-tab.active {
        background: var(--poke-blue);
        color: white;
        border-color: var(--poke-blue);
    }
    .lang-tab:hover:not(.active) { border-color: var(--poke-blue); }

    /* Price rows */
    .price-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.6rem 0;
        border-bottom: 1px solid #f3f4f6;
    }

    .condition-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        font-weight: 500;
    }

    .dot {
        width: 8px; height: 8px;
        border-radius: 50%;
        background: var(--poke-blue);
    }

    .price-values { display: flex; gap: 1rem; align-items: baseline; }
    .avg-val { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); }
    .min-val { font-size: 0.8rem; color: var(--poke-blue); }

    .no-data { color: var(--text-secondary); font-size: 0.85rem; margin-top: 1rem; }

    /* Chart Section */
    .chart-section {
        margin-bottom: 1.5rem;
    }

    .chart-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
    }
    .chart-header h2 { font-size: 1.2rem; }
    .chart-meta { font-size: 0.8rem; color: var(--text-secondary); }

    .svg-wrapper { overflow-x: auto; }
    .price-chart { width: 100%; min-width: 400px; }

    .no-chart {
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary);
        background: #f9fafb;
        border-radius: 8px;
    }

    /* Condition Grid */
    .condition-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-card);
    }

    .condition-card {
        flex: 1;
        min-width: 120px;
        background: #f9fafb;
        border-radius: 8px;
        padding: 0.75rem 1rem;
    }

    .cond-name { font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 0.25rem; }
    .cond-avg { font-size: 1.2rem; font-weight: 800; color: var(--text-primary); }
    .cond-min { font-size: 0.75rem; color: var(--poke-blue); margin-bottom: 0.25rem; }
    .cond-count { font-size: 0.7rem; color: var(--text-secondary); }

    @media (max-width: 768px) {
        .hero-card { grid-template-columns: 1fr; }
        .card-img { max-width: 220px; }
    }
</style>
