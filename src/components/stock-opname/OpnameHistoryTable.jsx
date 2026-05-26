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
  return (
    <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
      <div
        className={`hidden gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-wide text-slate-400 xl:grid ${
          showAction
            ? "grid-cols-[0.95fr_1.45fr_0.45fr_0.45fr_0.45fr_0.5fr_0.6fr_1fr_0.35fr]"
            : "grid-cols-[0.95fr_1.45fr_0.45fr_0.45fr_0.45fr_0.5fr_0.6fr_1fr]"
        }`}
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
              className={`grid gap-3 px-4 py-3 text-sm font-bold text-slate-700 xl:items-start ${
                showAction
                  ? "xl:grid-cols-[0.95fr_1.45fr_0.45fr_0.45fr_0.45fr_0.5fr_0.6fr_1fr_0.35fr]"
                  : "xl:grid-cols-[0.95fr_1.45fr_0.45fr_0.45fr_0.45fr_0.5fr_0.6fr_1fr]"
              }`}
            >
              <HistoryCell label="Tanggal">
                <p className="text-xs font-bold text-slate-500">
                  {formatDateTime(item.date)}
                </p>
              </HistoryCell>

              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 xl:hidden">
                  Barang
                </p>

                <p className="truncate text-sm font-black text-slate-900">
                  {item.productName}
                </p>

                <p className="mt-0.5 truncate text-xs font-bold text-slate-500">
                  Brand: {item.brand || "-"}
                </p>

                <p className="mt-0.5 truncate text-xs font-bold text-slate-400">
                  {item.sku || "-"}
                </p>

                <p className="mt-0.5 truncate text-xs font-bold text-slate-400">
                  Rak: {item.rackLocation || "-"}
                </p>

                <p className="mt-1 truncate text-xs font-black text-emerald-600">
                  {item.sessionName || "Tanpa Sesi"}
                </p>
              </div>

              <HistoryCell label="Ukuran">
                <p className="font-black text-slate-900">{item.variantValue}</p>
              </HistoryCell>

              <HistoryCell label="Sistem">
                <p>{item.systemStock}</p>
              </HistoryCell>

              <HistoryCell label="Fisik">
                <p>{item.physicalStock}</p>
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
                  {item.status}
                </span>
              </HistoryCell>

              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 xl:hidden">
                  Catatan
                </p>
                <p className="line-clamp-2 text-xs font-semibold leading-relaxed text-slate-500">
                  {item.note || "-"}
                </p>
              </div>

              {showAction && (
                <div className="flex gap-2 xl:justify-end">
                  <EditButton onClick={() => openEditStockOpnameModal(item)} />
                  <TrashButton onClick={() => deleteStockOpnameHistory(item.id)} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function HistoryCell({ label, children }) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 xl:hidden">
        {label}
      </p>
      {children}
    </div>
  )
}

export default OpnameHistoryTable