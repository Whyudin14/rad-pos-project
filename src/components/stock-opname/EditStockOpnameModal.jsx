import {
  ModalWrapper,
  ModalHeader,
  ModalFooter,
} from "./StockOpnameModalLayout"

function EditStockOpnameModal({
  selectedEditOpname,
  editPhysicalStock,
  setEditPhysicalStock,
  editOpnameNote,
  setEditOpnameNote,
  onClose,
  onSubmit,
}) {
  const systemStock = Number(selectedEditOpname?.systemStock || 0)
  const numericPhysicalStock = Number(editPhysicalStock || 0)
  const difference =
    editPhysicalStock === "" ? 0 : numericPhysicalStock - systemStock

  return (
    <ModalWrapper maxWidth="max-w-3xl">
      <ModalHeader
        eyebrow="Edit SO"
        title="Edit Hasil Stok Opname"
        description="Perbaiki angka stok fisik atau catatan jika ada typo saat input SO."
        color="blue"
        onClose={onClose}
      />

      <div className="overflow-y-auto px-5 py-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-2xl font-black text-slate-900">
            {selectedEditOpname.productName}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem label="Brand" value={selectedEditOpname.brand || "-"} />

            <DetailItem
              label="Ukuran"
              value={selectedEditOpname.variantValue || "-"}
            />

            <DetailItem
              label="Rak"
              value={selectedEditOpname.rackLocation || "-"}
            />

            <DetailItem
              label="SKU"
              value={selectedEditOpname.sku || "-"}
              breakText
            />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-blue-600">
            Sesi SO
          </p>

          <p className="mt-1 text-sm font-black text-blue-700">
            {selectedEditOpname.sessionName || "Tanpa Sesi"}
          </p>

          <p className="mt-1 text-xs font-bold text-blue-600">
            Edit ini akan memperbarui ringkasan sesuai/lebih/kurang pada sesi
            terkait.
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <StockNumberBox label="Stok Sistem" value={systemStock} />

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Stok Fisik Baru
            </p>

            <input
              type="number"
              min="0"
              value={editPhysicalStock}
              onChange={(e) => setEditPhysicalStock(e.target.value)}
              placeholder="0"
              className="mt-2 w-full bg-transparent text-3xl font-black text-slate-900 outline-none placeholder:text-slate-300"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Selisih Baru
            </p>

            <p
              className={`mt-2 text-3xl font-black ${
                editPhysicalStock === ""
                  ? "text-slate-300"
                  : difference === 0
                  ? "text-emerald-600"
                  : difference > 0
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
            >
              {editPhysicalStock === ""
                ? "-"
                : difference > 0
                ? `+${difference}`
                : difference}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-black uppercase tracking-wide text-slate-400">
            Catatan
          </label>

          <textarea
            value={editOpnameNote}
            onChange={(e) => setEditOpnameNote(e.target.value)}
            placeholder="Perbaiki catatan SO..."
            className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          />
        </div>
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
          disabled={editPhysicalStock === ""}
          className={`rounded-2xl px-5 py-3 text-sm font-black text-white transition ${
            editPhysicalStock === ""
              ? "cursor-not-allowed bg-slate-300"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Simpan Perubahan
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

export default EditStockOpnameModal