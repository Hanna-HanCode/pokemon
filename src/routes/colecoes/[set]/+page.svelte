<script lang="ts">
    export let data: any;

    let cards = data.cards;
    let hasMore = data.hasMore;
    let currentPage = data.page;
    let loading = false;

    // Filter state
    let searchQuery = data.filters.search || '';
    let activeRarity = data.filters.rarity || '';
    let activeType = data.filters.type || '';

    // Type → Emoji mapping
    const typeEmoji: Record<string, string> = {
        'Colorless': '⬜',
        'Darkness': '🌑',
        'Dragon': '🐉',
        'Fairy': '🧚',
        'Fighting': '👊',
        'Fire': '🔥',
        'Grass': '🌿',
        'Lightning': '⚡',
        'Metal': '⚙️',
        'Psychic': '🔮',
        'Water': '💧'
    };

    function applyFilters() {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (activeRarity) params.set('rarity', activeRarity);
        if (activeType) params.set('type', activeType);
        const qs = params.toString();
        window.location.href = `/colecoes/${data.setInfo.id}${qs ? '?' + qs : ''}`;
    }

    function toggleRarity(r: string) {
        activeRarity = activeRarity === r ? '' : r;
        currentPage = 1;
        applyFilters();
    }

    function toggleType(t: string) {
        activeType = activeType === t ? '' : t;
        currentPage = 1;
        applyFilters();
    }

    function clearFilters() {
        searchQuery = '';
        activeRarity = '';
        activeType = '';
        applyFilters();
    }

    let searchTimeout: any;
    function onSearchInput() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            applyFilters();
        }, 400);
    }

    async function loadMore() {
        if (loading || !hasMore) return;
        loading = true;
        currentPage++;

        const params = new URLSearchParams();
        params.set('set', data.setInfo.id);
        params.set('page', String(currentPage));
        if (searchQuery) params.set('search', searchQuery);
        if (activeRarity) params.set('rarity', activeRarity);
        if (activeType) params.set('type', activeType);

        try {
            const res = await fetch(`/api/cards?${params.toString()}`);
            const json = await res.json();
            cards = [...cards, ...json.cards];
            hasMore = json.hasMore;
        } catch (err) {
            console.error('Load more error:', err);
        }
        loading = false;
    }
</script>

<div class="collection-page">
    <section class="collection-header container">
        <a href="/colecoes" class="back-link">← Voltar para Coleções</a>
        <div class="header-content">
            {#if data.setInfo.logo}
                <img src={data.setInfo.logo} alt={data.setInfo.name} class="header-logo" />
            {/if}
            <div class="header-info">
                <span class="header-series">{data.setInfo.series}</span>
                <h1>{data.setInfo.name}</h1>
                <span class="header-meta">{data.setInfo.release_date || '---'} · {data.setInfo.total || 0} cartas na coleção</span>
            </div>
        </div>
    </section>

    <div class="content-layout container">
        <!-- Sidebar Filters -->
        <aside class="filters-sidebar">
            <div class="filter-panel">
                <h3>🔽 Filtros</h3>

                <div class="filter-group">
                    <div class="search-filter">
                        <span class="search-icon-f">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Procurar Card" 
                            bind:value={searchQuery}
                            on:input={onSearchInput}
                        />
                    </div>
                </div>

                {#if data.rarities.length > 0}
                <div class="filter-group">
                    <h4>☆ Raridade</h4>
                    <div class="filter-chips">
                        {#each data.rarities as r}
                            <button 
                                class="chip" 
                                class:active={activeRarity === r.rarity}
                                on:click={() => toggleRarity(r.rarity)}
                            >
                                {r.rarity}
                                <span class="chip-count">{r.cnt}</span>
                            </button>
                        {/each}
                    </div>
                </div>
                {/if}

                {#if data.types.length > 0}
                <div class="filter-group">
                    <h4>⚡ Energia</h4>
                    <div class="filter-chips">
                        {#each data.types as t}
                            <button 
                                class="chip" 
                                class:active={activeType === t}
                                on:click={() => toggleType(t)}
                            >
                                {typeEmoji[t] || '🃏'} {t}
                            </button>
                        {/each}
                    </div>
                </div>
                {/if}

                {#if activeRarity || activeType || searchQuery}
                <button class="btn-clear" on:click={clearFilters}>Limpar Filtros</button>
                {/if}
            </div>
        </aside>

        <!-- Cards Grid -->
        <main class="cards-main">
            {#if cards.length === 0}
                <div class="empty-state">
                    <p>Nenhuma carta encontrada com esses filtros.</p>
                    <button class="btn-primary" on:click={clearFilters}>Limpar Filtros</button>
                </div>
            {:else}
                <div class="cards-grid">
                    {#each cards as card}
                        <div class="card-item">
                            <div class="card-image">
                                <img src={card.image} alt={card.name} loading="lazy" />
                            </div>
                            <div class="card-detail">
                                <span class="card-name-text">{card.name}</span>
                                {#if card.rarity}
                                    <span class="card-rarity">{card.rarity}</span>
                                {/if}
                                {#if card.collector_number}
                                    <span class="card-number">#{card.collector_number}</span>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>

                {#if hasMore}
                    <div class="load-more">
                        <button class="btn-primary" on:click={loadMore} disabled={loading}>
                            {loading ? 'Carregando...' : 'Ver Mais Cartas'}
                        </button>
                    </div>
                {/if}
            {/if}
        </main>
    </div>
</div>

<style>
    .collection-page {
        padding: 1.5rem 0 4rem;
        background-color: var(--bg-main);
    }

    .back-link {
        display: inline-block;
        color: var(--poke-blue);
        font-weight: 600;
        font-size: 0.85rem;
        margin-bottom: 1.5rem;
    }

    .header-content {
        display: flex;
        align-items: center;
        gap: 2rem;
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: white;
        border-radius: 12px;
        border: 1px solid var(--border-card);
    }

    .header-logo {
        max-height: 80px;
        object-fit: contain;
    }

    .header-series {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--poke-blue);
        background: rgba(59, 76, 202, 0.1);
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
        display: inline-block;
        margin-bottom: 0.25rem;
    }

    .header-info h1 {
        font-size: 1.75rem;
    }

    .header-meta {
        font-size: 0.8rem;
        color: var(--text-secondary);
    }

    /* Layout */
    .content-layout {
        display: grid;
        grid-template-columns: 260px 1fr;
        gap: 2rem;
        align-items: start;
    }

    /* Sidebar */
    .filters-sidebar {
        position: sticky;
        top: 100px;
    }

    .filter-panel {
        background: white;
        border: 1px solid var(--border-card);
        border-radius: 12px;
        padding: 1.25rem;
    }

    .filter-panel h3 {
        font-size: 1.1rem;
        margin-bottom: 1rem;
        color: var(--poke-blue);
    }

    .filter-group {
        margin-bottom: 1.25rem;
    }

    .filter-group h4 {
        font-size: 0.85rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        padding-bottom: 0.35rem;
        border-bottom: 2px solid var(--poke-blue);
        display: inline-block;
    }

    .search-filter {
        position: relative;
    }

    .search-icon-f {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.85rem;
    }

    .search-filter input {
        width: 100%;
        padding: 0.6rem 2.25rem 0.6rem 0.75rem;
        border: 1.5px solid #ddd;
        border-radius: 20px;
        font-size: 0.85rem;
        outline: none;
        transition: border-color 0.2s;
    }

    .search-filter input:focus {
        border-color: var(--poke-blue);
    }

    .filter-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
    }

    .chip {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.35rem 0.7rem;
        border: 1.5px solid #ddd;
        border-radius: 20px;
        background: white;
        font-size: 0.72rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s;
        color: var(--text-primary);
    }

    .chip:hover {
        border-color: var(--poke-blue);
        background: rgba(59, 76, 202, 0.04);
    }

    .chip.active {
        background: var(--poke-blue);
        color: white;
        border-color: var(--poke-blue);
    }

    .chip-count {
        font-size: 0.65rem;
        opacity: 0.7;
    }

    .chip.active .chip-count {
        opacity: 1;
    }

    .btn-clear {
        display: block;
        width: 100%;
        padding: 0.5rem;
        background: none;
        border: 1.5px solid var(--poke-red);
        color: var(--poke-red);
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.15s;
    }

    .btn-clear:hover {
        background: var(--poke-red);
        color: white;
    }

    /* Cards Grid */
    .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 1.25rem;
    }

    .card-item {
        background: white;
        border: 1px solid var(--border-card);
        border-radius: 10px;
        overflow: hidden;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .card-item:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
    }

    .card-image {
        aspect-ratio: 2.5 / 3.5;
        overflow: hidden;
        background: #f9f9f9;
    }

    .card-image img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .card-detail {
        padding: 0.6rem;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
    }

    .card-name-text {
        font-weight: 600;
        font-size: 0.8rem;
        line-height: 1.2;
    }

    .card-rarity {
        font-size: 0.65rem;
        color: var(--poke-blue);
        font-weight: 500;
    }

    .card-number {
        font-size: 0.65rem;
        color: var(--text-secondary);
    }

    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--text-secondary);
    }

    .load-more {
        text-align: center;
        margin-top: 2.5rem;
    }

    .load-more button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    @media (max-width: 768px) {
        .content-layout {
            grid-template-columns: 1fr;
        }
        .filters-sidebar {
            position: static;
        }
        .cards-grid {
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        }
    }
</style>
