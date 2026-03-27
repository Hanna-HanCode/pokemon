<script lang="ts">
    export let data: any;
</script>

<div class="collections-page">
    <section class="hero container">
        <h1>📦 Coleções</h1>
        <p class="subtitle">Explore todas as expansões e coleções do Pokémon TCG</p>
    </section>

    {#each data.series as seriesGroup}
        <section class="series-section container">
            <div class="series-header">
                <h2>{seriesGroup.name}</h2>
                <div class="series-line"></div>
            </div>

            <div class="sets-grid">
                {#each seriesGroup.sets as set}
                    <a href="/colecoes/{set.id}" class="set-card">
                        <div class="set-logo-wrapper">
                            {#if set.logo}
                                <img src={set.logo} alt={set.name} class="set-logo" />
                            {:else}
                                <div class="set-logo-placeholder">{set.name}</div>
                            {/if}
                        </div>
                        <div class="set-info">
                            <span class="set-name">{set.name}</span>
                            <span class="set-meta">{set.release_date || '---'} · {set.card_count} cartas</span>
                        </div>
                    </a>
                {/each}
            </div>
        </section>
    {/each}
</div>

<style>
    .collections-page {
        padding: 2rem 0 4rem;
        background-color: var(--bg-main);
    }

    .hero {
        text-align: center;
        margin-bottom: 3rem;
    }

    .hero h1 {
        font-size: 2.5rem;
        color: var(--text-primary);
    }

    .subtitle {
        color: var(--text-secondary);
        font-size: 1rem;
        margin-top: 0.5rem;
    }

    .series-section {
        margin-bottom: 3rem;
    }

    .series-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .series-header h2 {
        font-size: 1.1rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-primary);
        white-space: nowrap;
    }

    .series-line {
        flex: 1;
        height: 2px;
        background: linear-gradient(to right, var(--border-card), transparent);
    }

    .sets-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 1.25rem;
    }

    .set-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        text-decoration: none;
        padding: 1.25rem 0.75rem;
        border-radius: 12px;
        background: white;
        border: 1px solid var(--border-card);
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .set-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
    }

    .set-logo-wrapper {
        width: 100%;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 0.75rem;
    }

    .set-logo {
        max-width: 100%;
        max-height: 80px;
        object-fit: contain;
    }

    .set-logo-placeholder {
        font-weight: 700;
        font-size: 0.85rem;
        color: var(--text-secondary);
        padding: 0.5rem;
        background: #f3f4f6;
        border-radius: 6px;
    }

    .set-info {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
    }

    .set-name {
        font-weight: 600;
        font-size: 0.8rem;
        color: var(--text-primary);
    }

    .set-meta {
        font-size: 0.7rem;
        color: var(--text-secondary);
    }

    @media (max-width: 768px) {
        .sets-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 0.75rem;
        }
    }
</style>
