<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import type { Invoice } from '$lib/models';
  import InvoiceCard from './InvoiceCard.svelte';
  import { type InvoiceResult, useResults } from '../results/useResults';

  let invoices: InvoiceResult[] = $state([]);

  const results = useResults();

  results.fetchMyResults().then((results: InvoiceResult[]) => {
    invoices = results.sort((a: Invoice, b: Invoice) => {
      if (!a.date.iso && b.date.iso) return -1;
      if (a.date.iso && !b.date.iso) return 1;

      const dateA = new Date(a.date.date);
      const dateB = new Date(b.date.date);

      return dateB.getTime() - dateA.getTime();
    });
  });
</script>

<Card.Root class="w-full max-w-2xl">
  <Card.Header class="flex items-center">
    <Card.Title class="text-2xl">Your Uploaded Invoices</Card.Title>
  </Card.Header>
  <Card.Content class="flex gap-2 flex-col items-center max-w-2xl">
    {#each invoices as invoice}
      <InvoiceCard {invoice}></InvoiceCard>
    {/each}
  </Card.Content>
</Card.Root>
