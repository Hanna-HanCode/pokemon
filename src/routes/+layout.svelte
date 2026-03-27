<script>
    import "../app.css";
</script>

<div class="layout-wrapper">
    <header class="main-header">
        <div class="container nav-container">
            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input type="text" placeholder="Pesquisar..." />
            </div>
            <nav class="main-nav">
                <a href="/" class="active">Início</a>
                <a href="/colecoes">Coleções</a>
                <a href="/popular">Populares</a>
                <a href="/historico">Histórico</a>
                <a href="/sobre">Sobre</a>
            </nav>
        </div>
    </header>

    <div class="content-wrapper">
        <slot />
    </div>
</div>

<style>
    .layout-wrapper {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }

    .main-header {
        background-color: white;
        border-bottom: 1px solid var(--border-card);
        height: 80px;
        display: flex;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 100;
    }

    .nav-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    .search-box {
        position: relative;
        width: 300px;
    }

    .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    .search-box input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.5rem;
        background-color: #f9f9f9;
        border: 1px solid #eee;
        border-radius: 8px;
        font-size: 0.9rem;
        outline: none;
        transition: border-color 0.2s;
    }

    .search-box input:focus {
        border-color: var(--poke-blue);
    }

    .main-nav {
        display: flex;
        gap: 2rem;
    }

    .main-nav a {
        color: var(--text-secondary);
        font-weight: 500;
        font-size: 0.95rem;
        padding: 0.5rem 0;
        position: relative;
    }

    .main-nav a.active {
        color: var(--text-primary);
    }

    .main-nav a.active::after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 0;
        right: 0;
        height: 3px;
        background-color: var(--poke-blue);
        border-radius: 2px;
    }

    .main-nav a:hover {
        color: var(--text-primary);
    }

    .content-wrapper {
        flex-grow: 1;
    }

    @media (max-width: 768px) {
        .search-box { display: none; }
        .main-nav { gap: 1rem; }
    }
</style>
