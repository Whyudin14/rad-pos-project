import { SessionTableText } from "./StockOpnameShared"

function UncheckedTargetTable({ items, openStockOpnameModal }) {
  return (
    <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
      <div className="hidden grid-cols-[1.4fr_0.7fr_0.45fr_0.45fr_1fr_1fr_0.65fr_0.4fr] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-wide text-slate-400 xl:grid">
        <span>Barang</span>
        <span>Kategori</span>
        <span>Ukuran</span>
        <span>Sistem</span>
        <span>SKU</span>
        <span>Barcode</span>
        <span>Rak</span>
        <span className="text-right">Aksi</span>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid gap-3 px-4 py-3 text-sm font-bold text-slate-700 xl:grid-cols-[1.4fr_0.7fr_0.45fr_0.45fr_1fr_1fr_0.65fr_0.4fr] xl:items-start"
          >
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
            </div>

            <SessionTableText label="Kategori" value={item.category || "-"} />
            <SessionTableText
              label="Ukuran"
              value={item.variantValue || "-"}
              strong
            />
            <SessionTableText label="Sistem" value={item.systemStock} strong />
            <SessionTableText label="SKU" value={item.sku || "-"} small />
            <SessionTableText
              label="Barcode"
              value={item.barcode || "-"}
              small
            />
            <SessionTableText
              label="Rak"
              value={item.rackLocation || "-"}
              small
            />

            <div className="flex xl:justify-end">
              <button
                onClick={() => openStockOpnameModal(item.product, item.variant)}
                className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-black text-white transition hover:bg-slate-700"
              >
                SO
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UncheckedTargetTable