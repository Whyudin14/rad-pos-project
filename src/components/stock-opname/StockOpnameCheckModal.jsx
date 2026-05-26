import {
  ModalWrapper,
  ModalHeader,
  ModalFooter,
} from "./StockOpnameModalLayout"

function StockOpnameCheckModal({
  selectedStockOpname,
  physicalStock,
  setPhysicalStock,
  opnameNote,
  setOpnameNote,
  activeStockOpnameSession,
  selectedSystemStock,
  selectedDifference,
  showOpnameSuccess,
  onClose,
  onSubmit,
}) {
  return (
    <ModalWrapper maxWidth="max-w-3xl">
      <ModalHeader
        eyebrow="Stok Opname"
        title="Cek Stok Fisik"
        description="Input stok fisik sesuai hasil hitung barang di rak dan gudang."
        color="blue"
        onClose={onClose}
      />

      <div className="overflow-y-auto px-5 py-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-2xl font-black text-slate-900">
            {selectedStockOpname.productName}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem
              label="Ukuran"
              value={selectedStockOpname.variantValue}
            />

            <DetailItem
              label="Letak Rak"
              value={selectedStockOpname.rackLocation || "-"}
            />

            <DetailItem
              label="SKU"
              value={selectedStockOpname.sku || "-"}
              breakText
            />

            <DetailItem
              label="Barcode"
              value={selectedStockOpname.barcode || "-"}
              breakText
            />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-600">
            Sesi SO
          </p>

          <p className="mt-1 text-sm font-black text-emerald-700">
            {activeStockOpnameSession
              ? activeStockOpnameSession.name
              : "Tanpa sesi aktif"}
          </p>

          {!activeStockOpnameSession && (
            <p className="mt-1 text-xs font-bold text-emerald-600">
              Data tetap bisa disimpan, tapi sebaiknya buat sesi SO dulu agar
              riwayat lebih rapi.
            </p>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <StockNumberBox label="Stok Sistem" value={selectedSystemStock} />

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Stok Fisik
            </p>

            <input
              type="number"
              min="0"
              value={physicalStock}
              onChange={(e) => setPhysicalStock(e.target.value)}
              placeholder="0"
              className="mt-2 w-full bg-transparent text-3xl font-black text-slate-900 outline-none placeholder:text-slate-300"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Selisih
            </p>

            <p
              className={`mt-2 text-3xl font-black ${
                physicalStock === ""
                  ? "text-slate-300"
                  : selectedDifference === 0
                  ? "text-emerald-600"
                  : selectedDifference > 0
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
            >
              {physicalStock === ""
                ? "-"
                : selectedDifference > 0
                ? `+${selectedDifference}`
                : selectedDifference}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-black uppercase tracking-wide text-slate-400">
            Catatan
          </label>

          <textarea
            value={opnameNote}
            onChange={(e) => setOpnameNote(e.target.value)}
            placeholder="Contoh: barang ada di display, dus belum dicek, selisih karena retur, dll."
            className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          />
        </div>

        {showOpnameSuccess && (
          <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-600">
            Data stok opname berhasil disimpan.
          </div>
        )}
      </div>

      <ModalFooter>
        <button
          onClick={onClose}
          className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-200"
        >
          Batal
        </button>

        <button
          onClick={onSubmit}
          disabled={physicalStock === ""}
          className={`rounded-2xl px-5 py-3 text-sm font-black text-white transition ${
            physicalStock === ""
              ? "cursor-not-allowed bg-slate-300"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Simpan SO
        </button>
      </ModalFooter>
    </ModalWrapper>
  )
}

function StockNumberBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
    </div>
  )
}

function DetailItem({ label, value, breakText = false }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-black text-slate-900 ${
          breakText ? "break-all" : ""
        }`}
      >
        {value}
      </p>
    </div>
  )
}

export default StockOpnameCheckModal