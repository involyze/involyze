export interface Invoice {
  userId: string;
  jobId: string;
  shop?: string;
  date: { iso: boolean; date: string };
  items: Array<Item>;
}

export interface Item {
  name: string;
  quantity?: number;
  price?: number;
}
