export function ModalWrapper({ children, maxWidth = "max-w-3xl", tall = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`flex w-full ${maxWidth} flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ${
          tall ? "max-h-[92vh]" : "max-h-[88vh]"
        }`}
      >
        {children}
      </div>
    </div>
  )
}

export function ModalHeader({ eyebrow, title, description, color, onClose }) {
  const colorClass = {
    blue: "text-blue-600",
    emerald: "text-emerald-600",
  }

  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
      <div>
        <p
          className={`text-sm font-black uppercase tracking-wide ${colorClass[color]}`}
        >
          {eyebrow}
        </p>

        <h3 className="mt-1 text-2xl font-black text-slate-900">{title}</h3>

        <p className="mt-1 text-sm font-semibold text-slate-500">
          {description}
        </p>
      </div>

      <button
        onClick={onClose}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
      >
        ✕
      </button>
    </div>
  )
}

export function ModalFooter({ children }) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
      {children}
    </div>
  )
}