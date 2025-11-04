<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { toast } from 'svelte-sonner';
  import DropZone from './DropZone.svelte';
  import { useUpload } from './useUpload';
  import { useWatchPipeline } from "../jobs/useWatchPipeline";
  import { onDestroy } from "svelte";
  import { pipelineStore } from "../jobs/watchPipelineStore.svelte";

  const upload = useUpload();
  const pipeline = useWatchPipeline();

  let file: File | undefined = undefined;

  onDestroy(() => {
    pipeline.unsubscribe();
  });

  const tryFileUpload = async () => {
    if (file) {
      const uploadRequest = await upload.fetchPreSignedUrl();
      pipeline.unsubscribe();
      pipelineStore.pending();
      pipeline.subscribe(uploadRequest.jobId, (el) => { pipelineStore.handleEvent(el) });
      await upload.uploadFile(file, uploadRequest.uploadUrl);
    } else {
      toast.error('Select file first');
    }
  };

  const dropHandle = (event: any) => {
    file = undefined;
    event.preventDefault();
    if (event.dataTransfer.items) {
      [...event.dataTransfer.items].forEach((item, i) => {
        if (item.kind === 'file') {
          file = item.getAsFile();
        }
      });
    }
  };

  const handleChange = (event: any) => {
    const files = event.target.files;
    if (files.length > 0) {
      file = files[0];
    }
  };

  const showFiles = (file: File) => {
    let name = file.name;
    if (name.length > 40) {
      name = name.slice(0, 40);
      name += '...';
    }

    return name;
  };
</script>

<div class="flex items-center justify-center flex-col w-full">
  <DropZone
    id="dropzone"
    on:drop={dropHandle}
    on:dragover={(event) => {
      event.preventDefault();
    }}
    on:change={handleChange}
    class="mb-2 min-w-80 w-full"
    accept="image/png, image/jpeg, application/pdf"
  >
    <svg
      aria-hidden="true"
      class="mb-3 w-10 h-10 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      ><path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      /></svg
    >
    {#if !file}
      <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
        <span class="font-semibold">Click to upload</span> or drag and drop
      </p>
      <p class="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or PDF</p>
    {:else}
      <p>{showFiles(file)}</p>
    {/if}
  </DropZone>
  <Button onclick={() => tryFileUpload()} disabled="{pipelineStore.processingState === 'started' || pipelineStore.processingState === 'pending'}">Upload</Button>
</div>
