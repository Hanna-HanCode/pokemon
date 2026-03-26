<script lang="ts">
    export let data: any;

    function formatCurrency(value: number | string | null) {
        if (value === null || value === undefined) return '---';
        return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function formatDate(dateStr: string | null) {
        if (!dateStr) return 'No data';
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR');
    }
</script>

<header class="hero">
    <div class="hero-content">
        <h1>PokéTCG <span class="accent">Aggregator</span></h1>
        <p>Real-time market insights from LigaPokemon Marketplace</p>
    </div>
</header>

<main class="container">
    <div class="stats-grid">
        {#each data.stats as stat}
            <div class="card-glass">
                <div class="image-wrapper">
                    <img src={stat.image} alt={stat.name} loading="lazy" />
                    <div class="image-overlay"></div>
                </div>
                
                <div class="card-content">
                    <div class="card-header">
                        <h2>{stat.name}</h2>
                        <span class="set-tag">{stat.set}</span>
                    </div>

                    <div class="price-metrics">
                        <div class="metric highlight">
                            <span class="label">Avg Market</span>
                            <span class="value">{formatCurrency(stat.avg_price)}</span>
                        </div>
                        
                        <div class="metric-row">
                            <div class="metric">
                                <span class="label">Lowest</span>
                                <span class="value success">{formatCurrency(stat.min_price)}</span>
                            </div>
                            <div class="metric">
                                <span class="label">Highest</span>
                                <span class="value danger">{formatCurrency(stat.max_price)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="card-footer">
                        <div class="footer-item">
                            <span class="icon">📦</span>
                            <span>{stat.listing_count || 0} listings</span>
                        </div>
                        <div class="footer-item">
                            <span class="icon">🕒</span>
                            <span>{formatDate(stat.date)}</span>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>

    {#if data.stats.length === 0}
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

    .price-metrics {
        margin-bottom: 2rem;
    }

    .metric {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .metric.highlight {
        background: rgba(255, 255, 255, 0.03);
        padding: 1rem;
        border-radius: 16px;
        margin-bottom: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.02);
    }

    .metric .label {
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--text-secondary);
        letter-spacing: 0.05em;
    }

    .metric .value {
        font-size: 1.25rem;
        font-weight: 700;
    }

    .metric.highlight .value {
        font-size: 1.75rem;
        color: var(--text-primary);
    }

    .metric-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .success { color: var(--accent-green); }
    .danger { color: var(--accent-red); }

    .card-footer {
        margin-top: auto;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-card);
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: var(--text-secondary);
    }

    .footer-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .empty-state {
        text-align: center;
        padding: 8rem 2rem;
        background: var(--bg-card);
        border: 1px dashed var(--border-card);
        border-radius: 32px;
    }

    .empty-icon {
        font-size: 4rem;
        margin-bottom: 1.5rem;
        opacity: 0.5;
    }

    @media (max-width: 768px) {
        .hero h1 { font-size: 2.5rem; }
        .stats-grid { grid-template-columns: 1fr; }
    }
</style>
