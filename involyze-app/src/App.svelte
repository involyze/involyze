<script lang="ts">
  import './app.css';
  import RouterView from './routing/RouterView.svelte';
  import { Toaster } from '$lib/components/ui/sonner';
</script>

<main class="w-full h-full">
  <Toaster />
  <RouterView />
</main>
