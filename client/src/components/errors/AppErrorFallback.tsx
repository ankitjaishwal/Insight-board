import { reloadPage } from "../../utils/browser";

type AppErrorFallbackProps = {
  message?: string;
};

export function AppErrorFallback({
  message = "The application crashed unexpectedly.",
}: AppErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
        <h1 className="text-xl font-semibold text-red-600 mb-3">
          Something went wrong
        </h1>

        <p className="text-gray-600 mb-4">{message}</p>

        <button
          onClick={reloadPage}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reload App
        </button>
      </div>
    </div>
  );
}
