enum ProgressState {
  PENDING = 'PENDING',
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

interface ProgressStatus {
  id: string;
  timestamp: number;
  state: ProgressState;
  message: string | undefined;
}

interface Invoice {
  userId: string;
  jobId: string;
  shop?: string;
  date: { iso: boolean; date: string };
  items: Array<Item>;
}

interface Item {
  name: string;
  quantity?: number;
  price?: number;
}

type StatisticsGranularity = 'Day' | 'Week' | 'Month';

export { ProgressState, ProgressStatus, Invoice, Item, StatisticsGranularity };
