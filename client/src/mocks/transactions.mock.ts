import { Status, type Transaction } from "../types/transaction";

export const transactions: Transaction[] = [
  {
    transactionId: "TXN-98765",
    user: "Ankit Jaishwal",
    status: Status.Completed,
    amount: 250.99,
    date: "2026-01-01",
  },
  {
    transactionId: "TXN-12345",
    user: "Ankit Jaishwal",
    status: Status.Pending,
    amount: 150,
    date: "2026-01-05",
  },
  {
    transactionId: "TXN-67890",
    user: "Jane Smith",
    status: Status.Failed,
    amount: 300,
    date: "2026-01-10",
  },
  {
    transactionId: "TXN-54321",
    user: "Alice Johnson",
    status: Status.Completed,
    amount: 400.18,
    date: "2026-01-15",
  },
  {
    transactionId: "TXN-98766",
    user: "Bob Brown",
    status: Status.Completed,
    amount: 500,
    date: "2025-10-20",
  },
  {
    transactionId: "TXN-12346",
    user: "Charlie Davis",
    status: Status.Pending,
    amount: 600,
    date: "2026-01-25",
  },
  {
    transactionId: "TXN-67891",
    user: "Diana Evans",
    status: Status.Failed,
    amount: 700,
    date: "2026-01-30",
  },
];
