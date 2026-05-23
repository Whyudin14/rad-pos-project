function StatCard({ title, value, note, icon }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{value}</h3>
          <p className="text-xs text-slate-400 mt-2">{note}</p>
        </div>

        <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
          {icon}
        </div>
      </div>
    </div>
  )
}

export default StatCard