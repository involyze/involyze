<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import Logo from '$lib/Logo.svelte';
  import ListPage from './ListPage.svelte';
  import ScanPage from './ScanPage.svelte';
  import StatisticsPage from './StatisticsPage.svelte';

  let { page }: { page: 'scan' | 'statistics' | 'list' } = $props();
</script>

<div class="header bg-white border-b">
  <div class="logo-container">
    <img src="/logo_without_com.png" alt="Involyze" class="logo">
  </div>
  <div id="menu">
    <Button variant="link" href="/">Scan</Button>
    <Button variant="link" href="/list">List</Button>
    <Button variant="link" href="/statistics">Statistics</Button>
  </div>
</div>
<div class="flex flex-col items-center justify-center m-6">
  {#if page === 'scan'}
    <ScanPage />
  {:else if page === 'statistics'}
    <StatisticsPage />
  {:else if page === 'list'}
    <ListPage />
  {/if}
</div>

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    top: 0;
    right: 0;
    padding: 1rem;
  }

  .logo-container {
    display: flex;
    align-items: center;
    max-height: 3rem; /* Adjust height as needed */
  }

  .logo {
    max-height: 3rem; /* Ensures the logo is resized to fit the header */
    height: auto; /* Maintains aspect ratio */
    width: auto;
  }

  #menu {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-left: auto;
  }
</style>
