import TransactionsTable from "../components/TransactionsTable";

const columns = [
  { header: "Transaction ID", accessor: "transactionId" },
  { header: "User", accessor: "user" },
  { header: "Status", accessor: "status" },
  { header: "Amount", accessor: "amount", alignment: "right" },
  { header: "Date", accessor: "date" },
];

const data = [
  {
    transactionId: "TXN-98765",
    user: "Ankit Jaishwal",
    status: "Completed",
    amount: "₹250.00",
    date: "1 Jan 2026",
  },
  {
    transactionId: "TXN-12345",
    user: "John Doe",
    status: "Pending",
    amount: "₹150.00",
    date: "5 Jan 2026",
  },
  {
    transactionId: "TXN-67890",
    user: "Jane Smith",
    status: "Failed",
    amount: "₹300.00",
    date: "10 Jan 2026",
  },
  {
    transactionId: "TXN-54321",
    user: "Alice Johnson",
    status: "Completed",
    amount: "₹400.00",
    date: "15 Jan 2026",
  },
  {
    transactionId: "TXN-98766",
    user: "Bob Brown",
    status: "Completed",
    amount: "₹500.00",
    date: "20 Jan 2026",
  },
  {
    transactionId: "TXN-12346",
    user: "Charlie Davis",
    status: "Pending",
    amount: "₹600.00",
    date: "25 Jan 2026",
  },
  {
    transactionId: "TXN-67891",
    user: "Diana Evans",
    status: "Failed",
    amount: "₹700.00",
    date: "30 Jan 2026",
  },
];

const TransactionsPage = () => {
  return (
    <>
      <h1 className="text-xl text-gray-900 font-semibold pb-6">Transactions</h1>
      <TransactionsTable columns={columns} data={data} />
    </>
  );
};

export default TransactionsPage;
