<script lang="ts">
  import { useCurrentRouteSvelte } from './useCurrentRoute.svelte';

  const route = useCurrentRouteSvelte();
</script>

<div>
  We are sorry {route.path} has no mapped pages
  <div>:(</div>
</div>
