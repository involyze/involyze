<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import Chart from 'chart.js/auto';
  import {
    useStatistics,
    type StatisticResult,
    type StatisticsGranularity,
  } from '../statistics/useStatistics';
  import { onMount } from 'svelte';

  var chart: Chart | null = null;

  onMount(() => {
    drawChart('Day');
  });

  const statistics = useStatistics();

  async function drawChart(granularity: StatisticsGranularity) {
    const values = (await statistics.fetchMyStatistics(granularity)).sort(
      (a: StatisticResult, b: StatisticResult) => {
        if (!a.date.iso && b.date.iso) return -1;
        if (a.date.iso && !b.date.iso) return 1;

        const dateA = new Date(a.date.date);
        const dateB = new Date(b.date.date);

        return dateA.getTime() - dateB.getTime();
      },
    );
    console.log(values);

    const months: Map<number, string> = new Map([
      [0, 'January'],
      [1, 'February'],
      [2, 'March'],
      [3, 'April'],
      [4, 'May'],
      [5, 'June'],
      [6, 'July'],
      [7, 'August'],
      [8, 'September'],
      [9, 'October'],
      [10, 'November'],
      [11, 'December'],
    ]);

    let labels: string[];
    switch (granularity) {
      case 'Day':
        labels = values.map((s) => new Date(s.date.date).toLocaleDateString());
        break;
      case 'Week':
        labels = values.map(
          (s) =>
            `${getISOWeek(s.date.date)}/${new Date(s.date.date).getFullYear()}`,
        );
        break;
      case 'Month':
        labels = values.map(
          (s) =>
            `${months.get(new Date(s.date.date).getMonth())} ${new Date(s.date.date).getFullYear()}`,
        );
        break;
    }
    const data: number[] = values.map((s) => s.totalExpenses);

    if (chart) {
      chart.destroy();
    }
    chart = new Chart('myChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: '€ spent',
            data,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  let selectedOption: StatisticsGranularity = 'Day';

  const options: StatisticsGranularity[] = ['Day', 'Week', 'Month'];

  const selectOption = (option: StatisticsGranularity) => {
    selectedOption = option;
    drawChart(selectedOption);
  };

  function getISOWeek(date: string) {
    const tempDate = new Date(date);

    // Set to Thursday in the current week to ensure proper calculation
    tempDate.setUTCDate(
      tempDate.getUTCDate() + 4 - (tempDate.getUTCDay() || 7),
    );

    // Start of the year
    const startOfYear = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));

    // Calculate the difference in days
    const dayOfYear =
      Math.floor((tempDate - startOfYear) / (24 * 60 * 60 * 1000)) + 1;

    // Calculate the ISO week number
    return Math.ceil(dayOfYear / 7);
  }
</script>

<Card.Root class="w-full max-w-screen-lg">
  <Card.Header class="flex items-center">
    <Card.Title class="text-2xl">Your Spendings</Card.Title>
  </Card.Header>
  <Card.Content>
    <div class="flex border border-gray-300 rounded-lg overflow-hidden">
      {#each options as option}
        <Button
          class="flex-1 text-center py-2 cursor-pointer transition-colors duration-200 border-r last:border-r-0"
          variant={option === selectedOption ? 'default' : 'secondary'}
          onclick={() => selectOption(option)}>{option}</Button
        >
      {/each}
    </div>
    <canvas id="myChart"></canvas>
  </Card.Content>
</Card.Root>
