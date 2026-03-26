<script>
    import "../app.css";
</script>

<div class="layout-wrapper">
    <slot />
</div>

<style>
    .layout-wrapper {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }
</style>
