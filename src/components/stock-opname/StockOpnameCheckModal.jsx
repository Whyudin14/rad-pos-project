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
  const hasPhysicalStock = physicalStock !== ""

  const resultStatus = !hasPhysicalStock
    ? {
        label: "Belum Diisi",
        badgeClass: "bg-slate-100 text-slate-500 border-slate-200",
        textClass: "text-slate-300",
        description: "Input stok fisik terlebih dahulu.",
      }
    : selectedDifference === 0
    ? {
        label: "Sesuai",
        badgeClass: "bg-emerald-50 text-emerald-600 border-emerald-100",
        textClass: "text-emerald-600",
        description: "Stok fisik sesuai dengan stok sistem.",
      }
    : selectedDifference > 0
    ? {
        label: "Lebih",
        badgeClass: "bg-blue-50 text-blue-600 border-blue-100",
        textClass: "text-blue-600",
        description: "Stok fisik lebih banyak dari stok sistem.",
      }
    : {
        label: "Kurang",
        badgeClass: "bg-red-50 text-red-600 border-red-100",
        textClass: "text-red-600",
        description: "Stok fisik lebih sedikit dari stok sistem.",
      }

  const handlePhysicalStockChange = (value) => {
    if (value === "") {
      setPhysicalStock("")
      return
    }

    const numericValue = Number(value)

    if (Number.isNaN(numericValue)) return

    if (numericValue < 0) {
      setPhysicalStock("0")
      return
    }

    setPhysicalStock(value)
  }

  return (
    <ModalWrapper maxWidth="max-w-3xl" zIndex="z-[60]">
      <ModalHeader
        eyebrow="Stok Opname"
        title="Cek Stok Fisik"
        description="Input stok fisik sesuai hasil hitung barang di rak, display, dan gudang."
        color="blue"
        onClose={onClose}
      />

      <div className="overflow-y-auto px-5 py-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-2xl font-black leading-tight text-slate-900">
                {selectedStockOpname.productName}
              </p>

              <p className="mt-1 text-sm font-bold text-slate-500">
                {selectedStockOpname.brand || "-"} •{" "}
                {selectedStockOpname.category || "-"}
              </p>
            </div>

            <span
              className={`w-fit rounded-full border px-3 py-1 text-xs font-black ${resultStatus.badgeClass}`}
            >
              {resultStatus.label}
            </span>
          </div>

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

        <div
          className={`mt-4 rounded-2xl border px-4 py-3 ${
            activeStockOpnameSession
              ? "border-emerald-100 bg-emerald-50"
              : "border-amber-100 bg-amber-50"
          }`}
        >
          <p
            className={`text-xs font-black uppercase tracking-wide ${
              activeStockOpnameSession ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            Sesi SO
          </p>

          <p
            className={`mt-1 text-sm font-black ${
              activeStockOpnameSession ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            {activeStockOpnameSession
              ? activeStockOpnameSession.name
              : "Tanpa sesi aktif"}
          </p>

          {!activeStockOpnameSession && (
            <p className="mt-1 text-xs font-bold leading-relaxed text-amber-700">
              Data tetap bisa disimpan, tapi untuk proses SO mingguan sebaiknya
              buat sesi SO dulu agar riwayat lebih rapi dan mudah dicek.
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
              onChange={(e) => handlePhysicalStockChange(e.target.value)}
              placeholder="0"
              className="mt-2 w-full bg-transparent text-3xl font-black text-slate-900 outline-none placeholder:text-slate-300"
            />

            <p className="mt-1 text-xs font-semibold text-slate-400">
              Isi sesuai jumlah barang fisik yang benar-benar ditemukan.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Selisih
            </p>

            <p className={`mt-2 text-3xl font-black ${resultStatus.textClass}`}>
              {!hasPhysicalStock
                ? "-"
                : selectedDifference > 0
                ? `+${selectedDifference}`
                : selectedDifference}
            </p>

            <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-400">
              {resultStatus.description}
            </p>
          </div>
        </div>

        {hasPhysicalStock && selectedDifference !== 0 && (
          <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-bold leading-relaxed text-amber-700">
            Ada selisih stok. Sebaiknya isi catatan singkat agar owner/admin
            lebih mudah mengecek penyebabnya sebelum koreksi stok dilakukan.
          </div>
        )}

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
          disabled={!hasPhysicalStock}
          className={`rounded-2xl px-5 py-3 text-sm font-black text-white transition ${
            !hasPhysicalStock
              ? "cursor-not-allowed bg-slate-300"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Simpan Hasil SO
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

      <p className="mt-1 text-xs font-semibold text-slate-400">
        Data dari sistem
      </p>
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