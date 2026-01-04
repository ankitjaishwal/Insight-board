export type Transaction = {
  transactionId: string;
  user: string;
  status: string;
  amount: number;
  date: string;
};

export const transactions: Transaction[] = [
  {
    transactionId: "TXN-98765",
    user: "Ankit Jaishwal",
    status: "Completed",
    amount: 250,
    date: "1 Jan 2026",
  },
  {
    transactionId: "TXN-12345",
    user: "Ankit Jaishwal",
    status: "Pending",
    amount: 150,
    date: "5 Jan 2026",
  },
  {
    transactionId: "TXN-67890",
    user: "Jane Smith",
    status: "Failed",
    amount: 300,
    date: "10 Jan 2026",
  },
  {
    transactionId: "TXN-54321",
    user: "Alice Johnson",
    status: "Completed",
    amount: 400,
    date: "15 Jan 2026",
  },
  {
    transactionId: "TXN-98766",
    user: "Bob Brown",
    status: "Completed",
    amount: 500,
    date: "20 Jan 2026",
  },
  {
    transactionId: "TXN-12346",
    user: "Charlie Davis",
    status: "Pending",
    amount: 600,
    date: "25 Jan 2026",
  },
  {
    transactionId: "TXN-67891",
    user: "Diana Evans",
    status: "Failed",
    amount: 700,
    date: "30 Jan 2026",
  },
];
