import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({
  open,
  title = "Konfirmasi tindakan",
  message = "Apakah Anda yakin ingin melanjutkan tindakan ini?",
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) onCancel(); }}>
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-message" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-red-50 text-red-600"><AlertTriangle size={21} /></span>
          <div className="min-w-0 flex-1"><h2 id="confirm-dialog-title" className="m-0 text-base font-bold text-slate-800">{title}</h2><p id="confirm-dialog-message" className="mt-2 text-sm leading-6 text-slate-500">{message}</p></div>
          <button type="button" className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50" onClick={onCancel} disabled={loading} aria-label="Tutup dialog"><X size={18} /></button>
        </div>
        <div className="mt-6 flex justify-end gap-3"><button type="button" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50" onClick={onCancel} disabled={loading}>{cancelLabel}</button><button type="button" className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60" onClick={onConfirm} disabled={loading}>{loading ? "Menghapus..." : confirmLabel}</button></div>
      </section>
    </div>
  );
}
