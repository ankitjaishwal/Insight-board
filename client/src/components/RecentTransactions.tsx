type Props = {
  transactions?: {
    id: string;
    userName: string;
    amount: number;
    status: string;
    date: string;
  }[];
};

const RecentTransactions = ({ transactions = [] }: Props) => {
  if (!transactions.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        No recent transactions.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {transactions.map((txn) => {
        const statusColor =
          txn.status === "COMPLETED"
            ? "text-green-600"
            : txn.status === "FAILED"
              ? "text-red-600"
              : "text-amber-600";
        return (
          <div
            key={txn.id}
            className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">
                {txn.userName}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(txn.date).toLocaleDateString()}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold">
                ₹{txn.amount.toLocaleString()}
              </p>
              <p className={`text-xs ${statusColor}`}>{txn.status}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecentTransactions;
