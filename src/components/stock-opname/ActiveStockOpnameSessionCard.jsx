function ActiveStockOpnameSessionCard({
  activeStockOpnameSession,
  activeSessionProgress,
  onCreateSession,
  onCloseActiveSession,
  onOpenActiveSessionResult,
  onOpenSessionHistory,
}) {
  return (
    <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-emerald-600">
            Sesi SO Aktif
          </p>

          {activeStockOpnameSession ? (
            <>
              <h2 className="mt-1 text-xl font-black text-slate-900">
                {activeStockOpnameSession.name}
              </h2>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                {activeStockOpnameSession.scheduleDay} •{" "}
                {activeStockOpnameSession.type} • Aktif
              </p>

              <p className="mt-1 text-xs font-bold text-slate-400">
                Kategori:{" "}
                {activeStockOpnameSession.categories?.join(", ") || "-"}
              </p>

              {activeStockOpnameSession.note && (
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Catatan: {activeStockOpnameSession.note}
                </p>
              )}
            </>
          ) : (
            <>
              <h2 className="mt-1 text-xl font-black text-slate-900">
                Belum ada sesi SO aktif
              </h2>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                Buat sesi SO sesuai jadwal mingguan sebelum mulai input stok
                fisik agar riwayat lebih rapi.
              </p>
            </>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[520px] xl:grid-cols-4">
          <ProgressCard
            label="Target Item"
            value={activeSessionProgress.targetTotal}
            color="slate"
          />

          <ProgressCard
            label="Sudah Dicek"
            value={activeSessionProgress.checkedTotal}
            color="blue"
          />

          <ProgressCard
            label="Belum Dicek"
            value={activeSessionProgress.uncheckedTotal}
            color="amber"
          />

          <ProgressCard
            label="Progress"
            value={`${activeSessionProgress.progressPercent}%`}
            color="emerald"
          />
        </div>
      </div>

      {activeStockOpnameSession && (
        <div className="mt-4 rounded-2xl bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Progress Sesi Aktif
            </p>

            <p className="text-xs font-black text-emerald-600">
              {activeSessionProgress.checkedTotal} /{" "}
              {activeSessionProgress.targetTotal} item
            </p>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${activeSessionProgress.progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          onClick={onCreateSession}
          className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
        >
          {activeStockOpnameSession
            ? "Ganti / Buat Sesi Baru"
            : "+ Buat Sesi SO"}
        </button>

        {activeStockOpnameSession && (
          <button
            onClick={onCloseActiveSession}
            className="rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-100"
          >
            Akhiri Sesi Aktif
          </button>
        )}

        <button
          onClick={onOpenActiveSessionResult}
          className="rounded-2xl bg-blue-50 px-5 py-3 text-sm font-black text-blue-600 transition hover:bg-blue-100"
        >
          Hasil SO Sesi Ini
        </button>

        <button
          onClick={onOpenSessionHistory}
          className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-200"
        >
          Lihat Riwayat Sesi
        </button>
      </div>
    </div>
  )
}

function ProgressCard({ label, value, color }) {
  const style = {
    slate: "bg-slate-50 text-slate-900",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  }

  return (
    <div className={`rounded-2xl p-4 ${style[color]}`}>
      <p className="text-xs font-black uppercase tracking-wide opacity-70">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  )
}

export default ActiveStockOpnameSessionCard