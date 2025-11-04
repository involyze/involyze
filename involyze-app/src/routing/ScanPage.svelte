<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import FilePicker from '../upload/FilePicker.svelte';
  import { pipelineStore } from "../jobs/watchPipelineStore.svelte";

  import {useResults} from "../results/useResults";
  import {Separator} from "$lib/components/ui/separator";
  import InvoiceCard from "./InvoiceCard.svelte";
  import type {Invoice} from "$lib/models";

  const result = useResults();

  const stateLabel = $derived.by(() => {
    if (pipelineStore.processingState == "pending") {
      return "Queued";
    } else if (pipelineStore.processingState == "started") {
      return "Processing the invoice...";
    } else if (pipelineStore.processingState == "finished") {
      return "Result";
    } else if (pipelineStore.processingState == "failed") {
      return "An unexpected error occured, please try again later";
    }
  });

  let invoice: Invoice | null = $state(null);

  $effect(() => {
    if (pipelineStore.processingState == "finished") {
      result.fetchMyResults(pipelineStore.jobIdOfLastProcessing).then((result) => {
        invoice = result[0];
      });
    } else {
      invoice = null;
    }
  });


</script>

<Card.Root class="w-full max-w-2xl">
  <Card.Header class="flex items-center">
    <Card.Title class="text-2xl">Upload new Invoice</Card.Title>
  </Card.Header>
  <Card.Content class="flex gap-6 flex-col items-center">
    <FilePicker></FilePicker>
    <h2>{stateLabel}</h2>
    {#if invoice != null}
      <Separator></Separator>
      <InvoiceCard {invoice}></InvoiceCard>
    {/if}
  </Card.Content>
</Card.Root>
