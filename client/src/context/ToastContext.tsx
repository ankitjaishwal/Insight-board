import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastType = "success" | "error" | "warning";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Record<string, number>>({});

  const toastStyles: Record<
    ToastType,
    { icon: string; className: string }
  > = {
    success: {
      icon: "✓",
      className:
        "border-emerald-400/40 bg-emerald-600 text-white dark:border-emerald-400/30 dark:bg-emerald-500",
    },
    error: {
      icon: "!",
      className:
        "border-red-400/40 bg-red-600 text-white dark:border-red-400/30 dark:bg-red-500",
    },
    warning: {
      icon: "!",
      className:
        "border-amber-400/40 bg-amber-500 text-slate-950 dark:border-amber-300/30 dark:bg-amber-400",
    },
  };

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));

    const timer = timersRef.current[id];
    if (timer) {
      window.clearTimeout(timer);
      delete timersRef.current[id];
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);

      timersRef.current[id] = window.setTimeout(() => {
        removeToast(id);
      }, 3000);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed bottom-4 left-4 z-100 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg ${toastStyles[toast.type].className}`}
            role="status"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                  {toastStyles[toast.type].icon}
                </span>
                <span>{toast.message}</span>
              </div>
              <button
                className="text-current/80 hover:text-current"
                onClick={() => removeToast(toast.id)}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return ctx;
}
