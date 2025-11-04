<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
  
    // 1) Import Amplify + generateClient
    import { Amplify } from 'aws-amplify';
    import { generateClient } from 'aws-amplify/api';
  
    // 2) Import your Amplify config
    import config from '../../aws-exports.js';
    Amplify.configure(config);
  
    // 3) Create the GraphQL client
    const client = generateClient();
  
    // 4) Import your auto-generated queries, mutations, and subscriptions
    import { getJobs } from '../graphql/queries';
    import { notifyJobStatus } from '../graphql/mutations';
    import { onJobStatusUpdated } from '../graphql/subscriptions';
  
    // 5) Import generated TypeScript types
    import type { JobStatus } from '../API';
  
    // 6) Local component state
    let jobs: JobStatus[] = [];
    let jobId: string = '';
    let status: string = '';
    let message: string = '';
  
    // We'll hold a reference to the subscription for cleanup
    let jobStatusSubscription: any;
  
    // 7) Fetch jobs on mount + start subscription
    onMount(() => {
      fetchJobs();
      subscribeToJobUpdates();
  
      // Clean up subscription on unmount
      onDestroy(() => {
        if (jobStatusSubscription) {
          jobStatusSubscription.unsubscribe();
        }
      });
    });
  
    // 8) Query jobs
    async function fetchJobs() {
      try {
        const response = await client.graphql({
          query: getJobs
        });
        jobs = response.data?.getJobs ?? [];
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    }
  
    // 9) Update (or create) a job status
    async function updateJobStatus() {
      try {
        const response = await client.graphql({
          query: notifyJobStatus,
          variables: {
            jobId,
            status,
            message
          }
        });
        // The newly updated JobStatus is in response.data.notifyJobStatus
        const updatedJob: JobStatus = response.data?.notifyJobStatus;
  
        // Replace or append in local state
        jobs = jobs.filter((j) => j.jobId !== updatedJob.jobId);
        jobs = [...jobs, updatedJob];
  
        // Clear local fields
        jobId = '';
        status = '';
        message = '';
      } catch (err) {
        console.error('Error updating job status:', err);
      }
    }
  
    // 10) Subscribe to updates for real-time changes
    function subscribeToJobUpdates() {
      // If your schema allows, you can omit 'variables' to subscribe to all
      // or dynamically set { jobId: 'xxx' } as needed.
      jobStatusSubscription = client
        .graphql({
          query: onJobStatusUpdated,
          variables: { jobId: '1'},
        })
        .subscribe({
          next: ({ data }) => {
            const updatedJob = data?.onJobStatusUpdated;
            if (updatedJob) {
              jobs = jobs.filter((j) => j.jobId !== updatedJob.jobId);
              jobs = [...jobs, updatedJob];
            }
          },
          error: (error) => {
            console.error('Subscription error:', JSON.stringify(error, null, 2));
          }
        });
    }
  </script>
  
  <h1>Job Status Management</h1>
  
  <!-- Simple form to update/create a job status -->
  <form on:submit|preventDefault={updateJobStatus}>
    <div>
      <label>Job ID</label>
      <input bind:value={jobId} placeholder="Job ID" />
    </div>
    <div>
      <label>Status</label>
      <input bind:value={status} placeholder="Status" />
    </div>
    <div>
      <label>Message</label>
      <textarea bind:value={message} placeholder="Optional message"></textarea>
    </div>
    <button type="submit">Notify Job Status</button>
  </form>
  
  <hr />
  
  <!-- Display current jobs if any -->
  {#if jobs.length > 0}
    <ul>
      {#each jobs as job}
        <li>
          <strong>Job ID:</strong> {job.jobId}<br />
          <strong>Status:</strong> {job.status}<br />
          <strong>Message:</strong> {job.message}
        </li>
      {/each}
    </ul>
  {:else}
    <p>No jobs found.</p>
  {/if}  