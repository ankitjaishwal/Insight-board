const TransactionsTable = () => {
  return (
    <table className="w-full border border-gray-200 rounded-md mt-6">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
            Transaction ID
          </th>
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
            User
          </th>
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
            Status
          </th>
          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
            Amount
          </th>
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
            Date
          </th>
        </tr>
      </thead>

      <tbody>
        <tr className="border-b border-gray-200">
          <td className="px-4 py-3 text-sm text-gray-700">TXN-98765</td>
          <td className="px-4 py-3 text-sm text-gray-900">Ankit Jaishwal</td>
          <td className="px-4 py-3 text-sm text-gray-700">Completed</td>
          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
            ₹250.00
          </td>
          <td className="px-4 py-3 text-sm text-gray-600">1 Jan 2026</td>
        </tr>
      </tbody>
    </table>
  );
};

export default TransactionsTable;
