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
      <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
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
            className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 dark:border-slate-800"
          >
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {txn.userName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(txn.date).toLocaleDateString()}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
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
