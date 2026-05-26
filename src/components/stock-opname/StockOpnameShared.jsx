function MiniSummary({ label, value, color = "slate" }) {
  const style = {
    slate: "border-slate-200 bg-white text-slate-900",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-600",
    blue: "border-blue-100 bg-blue-50 text-blue-600",
    amber: "border-amber-100 bg-amber-50 text-amber-600",
    red: "border-red-100 bg-red-50 text-red-600",
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-sm ${style[color]}`}>
      <p className="text-[11px] font-black uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  )
}

function FilterGroup({
  label,
  filters,
  value,
  onChange,
  activeClass,
  inactiveClass,
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = value === filter

          return (
            <button
              key={filter}
              onClick={() => onChange(filter)}
              className={`rounded-xl px-3 py-2 text-xs font-black transition ${
                isActive ? activeClass : inactiveClass
              }`}
            >
              {filter}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function EmptyModalState({ text }) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-400">
      {text}
    </div>
  )
}

function SessionTableText({
  label,
  value,
  color = "text-slate-700",
  strong = false,
  small = false,
}) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 xl:hidden">
        {label}
      </p>
      <p
        className={`${color} ${
          strong ? "font-black" : "font-bold"
        } ${small ? "text-xs text-slate-500" : ""}`}
      >
        {value}
      </p>
    </div>
  )
}

export { MiniSummary, FilterGroup, EmptyModalState, SessionTableText }