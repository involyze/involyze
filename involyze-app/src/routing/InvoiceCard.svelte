<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import type { Invoice } from '$lib/models';
  import ItemCard from './ItemCard.svelte';
  import * as Table from '$lib/components/ui/table/index.js';
  import { Separator } from '$lib/components/ui/separator';
  import * as Accordion from '$lib/components/ui/accordion';

  let { invoice }: { invoice: Invoice } = $props();
</script>

<Card.Root class="w-full">
  <Card.Content>
    <span class="font-bold">Shop:</span>
    {invoice.shop}<br />
    <span class="font-bold">Date:</span>
    {invoice.date.iso
      ? new Date(invoice.date.date).toLocaleDateString('de-AT')
      : invoice.date.date}<br />
    <Accordion.Root>
      <Accordion.Item value="item-1">
        <Accordion.Trigger
          ><span class="font-bold">Items:</span></Accordion.Trigger
        >
        <Accordion.Content>
          <Separator></Separator>
          <Table.Root class="overflow-hidden">
            <Table.Body>
              {#each invoice.items as item}
                <ItemCard {item}></ItemCard>
              {/each}
            </Table.Body>
          </Table.Root>
          <Separator></Separator>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
    <span class="font-bold">Total:</span>
    {invoice.items.reduce((sum, item) => sum + (item.price ?? 0), 0).toFixed(2)}
    €
  </Card.Content>
</Card.Root>
