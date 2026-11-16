import { Database, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function useMinimumLoading(isLoading, duration = 900) {
  const [visible, setVisible] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      return undefined;
    }

    const timer = window.setTimeout(() => setVisible(false), duration);
    return () => window.clearTimeout(timer);
  }, [duration, isLoading]);

  return visible;
}

export default function DatabaseLoading({ message = "Memuat data..." }) {
  return (
    <div
      className="database-loading-overlay fixed inset-0 z-[200] grid place-items-center bg-slate-900/25 p-4 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="database-loading-card flex min-w-[190px] flex-col items-center rounded-xl border border-white/70 bg-white/90 px-7 py-6 text-center shadow-xl">
        <span className="relative mb-3 grid h-12 w-12 place-items-center rounded-full bg-blue-50 text-blue-700">
          <LoaderCircle
            size={50}
            className="absolute animate-spin text-blue-600"
            strokeWidth={1.5}
          />
        </span>
        <b className="text-[12px] text-slate-700">{message}</b>
      </div>
    </div>
  );
}
