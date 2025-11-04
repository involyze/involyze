<script lang="ts">
  import * as Table from '$lib/components/ui/table/index.js';
  import type { Item } from '$lib/models';

  let { item }: { item: Item } = $props();
</script>

<Table.Row>
  <span class="font-bold">{item.name}</span><br />
  {#if item.price !== undefined}Price: {item.price.toFixed(2)} €<br />{/if}
  {#if item.quantity !== undefined}Quantity: {item.quantity}<br />{/if}
</Table.Row>
