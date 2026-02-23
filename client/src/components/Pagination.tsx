type PaginationProps = {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export default function Pagination({
  page,
  pages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const hasPages = pages > 0;

  return (
    <div className="mt-3 flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPages || page <= 1}
          className="px-3 py-1.5 text-sm border rounded-md bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        <span className="text-sm text-gray-700">
          Page {hasPages ? page : 0} of {pages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasPages || page >= pages}
          className="px-3 py-1.5 text-sm border rounded-md bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
        <span>Total: {total}</span>

        <label htmlFor="page-size" className="text-gray-600">
          Rows per page
        </label>
        <select
          id="page-size"
          value={limit}
          onChange={(e) => {
            const nextLimit = Number(e.target.value);
            onLimitChange(nextLimit);
          }}
          className="border border-gray-300 rounded px-2 py-1.5 bg-white"
        >
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
}
