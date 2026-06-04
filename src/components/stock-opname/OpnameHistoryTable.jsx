import { EditButton, TrashButton } from "./StockOpnameActionButtons"

function OpnameHistoryTable({
  items,
  formatDateTime,
  getOpnameStatusClass,
  getDifferenceClass,
  formatDifference,
  deleteStockOpnameHistory,
  openEditStockOpnameModal,
  showAction = false,
}) {
  const gridClass = showAction
    ? "xl:grid-cols-[0.9fr_1.55fr_0.4fr_0.4fr_0.4fr_0.5fr_0.6fr_1fr_0.35fr]"
    : "xl:grid-cols-[0.9fr_1.55fr_0.4fr_0.4fr_0.4fr_0.5fr_0.6fr_1fr]"

  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="min-w-[1080px]">
        <div
          className={`sticky top-0 z-10 hidden gap-3 border-b border-slate-100 bg-slate-50/95 px-4 py-3 text-[11px] font-black uppercase tracking-wide text-slate-400 backdrop-blur xl:grid ${gridClass}`}
        >
          <span>Tanggal</span>
          <span>Barang</span>
          <span>Ukuran</span>
          <span>Sistem</span>
          <span>Fisik</span>
          <span>Selisih</span>
          <span>Status</span>
          <span>Catatan</span>
          {showAction && <span className="text-right">Aksi</span>}
        </div>

        <div className="divide-y divide-slate-100">
          {items.map((item) => {
            return (
              <div
                key={item.id}
                className={`grid gap-3 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 xl:items-start ${gridClass}`}
              >
                <HistoryCell label="Tanggal">
                  <p className="text-xs font-bold leading-relaxed text-slate-500">
                    {formatDateTime(item.date)}
                  </p>
                </HistoryCell>

                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 xl:hidden">
                    Barang
                  </p>

                  <p
                    className="truncate text-sm font-black text-slate-900"
                    title={item.productName}
                  >
                    {item.productName || "-"}
                  </p>

                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-slate-400">
                    <span className="max-w-full truncate text-slate-500">
                      Brand: {item.brand || "-"}
                    </span>

                    <span className="max-w-full truncate">
                      SKU: {item.sku || "-"}
                    </span>

                    <span className="max-w-full truncate">
                      Rak: {item.rackLocation || "-"}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-xs font-black text-emerald-600">
                    {item.sessionName || "Tanpa Sesi"}
                  </p>
                </div>

                <HistoryCell label="Ukuran">
                  <p className="font-black text-slate-900">
                    {item.variantValue || "-"}
                  </p>
                </HistoryCell>

                <HistoryCell label="Sistem">
                  <p>{item.systemStock ?? 0}</p>
                </HistoryCell>

                <HistoryCell label="Fisik">
                  <p>{item.physicalStock ?? 0}</p>
                </HistoryCell>

                <HistoryCell label="Selisih">
                  <p className={`font-black ${getDifferenceClass(item.difference)}`}>
                    {formatDifference(item.difference)}
                  </p>
                </HistoryCell>

                <HistoryCell label="Status">
                  <span
                    className={`inline-flex rounded-full border px-2 py-1 text-xs font-black ${getOpnameStatusClass(
                      item.status
                    )}`}
                  >
                    {item.status || "-"}
                  </span>
                </HistoryCell>

                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 xl:hidden">
                    Catatan
                  </p>

                  <p
                    className="line-clamp-2 text-xs font-semibold leading-relaxed text-slate-500"
                    title={item.note}
                  >
                    {item.note || "-"}
                  </p>
                </div>

                {showAction && (
                  <div className="flex gap-2 xl:justify-end">
                    <EditButton onClick={() => openEditStockOpnameModal(item)} />
                    <TrashButton
                      onClick={() => deleteStockOpnameHistory(item.id)}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function HistoryCell({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 xl:hidden">
        {label}
      </p>
      {children}
    </div>
  )
}

export default OpnameHistoryTable