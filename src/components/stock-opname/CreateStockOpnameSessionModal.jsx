import {
  ModalWrapper,
  ModalHeader,
  ModalFooter,
} from "./StockOpnameModalLayout"

function CreateStockOpnameSessionModal({
  stockOpnameTypes,
  selectedSessionType,
  setSelectedSessionType,
  sessionNote,
  setSessionNote,
  onClose,
  onSubmit,
}) {
  return (
    <ModalWrapper maxWidth="max-w-4xl">
      <ModalHeader
        eyebrow="Sesi Stok Opname"
        title="Buat Sesi SO"
        description="Pilih jenis SO sesuai jadwal mingguan RAD Sport."
        color="emerald"
        onClose={onClose}
      />

      <div className="overflow-y-auto px-5 py-4 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {stockOpnameTypes.map((item) => {
            const isActive = selectedSessionType === item.type

            return (
              <button
                key={item.type}
                onClick={() => setSelectedSessionType(item.type)}
                className={`rounded-2xl border p-4 text-left transition ${
                  isActive
                    ? "border-emerald-300 bg-emerald-50 ring-4 ring-emerald-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <p
                  className={`text-xl font-black ${
                    isActive ? "text-emerald-700" : "text-slate-900"
                  }`}
                >
                  {item.type}
                </p>

                <p className="mt-1 text-sm font-black text-slate-500">
                  Jadwal: {item.scheduleDay}
                </p>

                <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-400">
                  Kategori: {item.categories.join(", ")}
                </p>
              </button>
            )
          })}
        </div>

        <div className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-xs font-bold leading-relaxed text-blue-600">
          Catatan: bola sepak fisik masuk ke Aksesoris. Sepatu bola pakai
          kategori Football dan Football Junior.
        </div>

        <div className="mt-4">
          <label className="text-xs font-black uppercase tracking-wide text-slate-400">
            Catatan Sesi
          </label>

          <textarea
            value={sessionNote}
            onChange={(e) => setSessionNote(e.target.value)}
            placeholder="Contoh: SO closing mingguan, cek rak display dan gudang..."
            className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
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
          disabled={!selectedSessionType}
          className={`rounded-2xl px-5 py-3 text-sm font-black text-white transition ${
            !selectedSessionType
              ? "cursor-not-allowed bg-slate-300"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          Buat Sesi
        </button>
      </ModalFooter>
    </ModalWrapper>
  )
}

export default CreateStockOpnameSessionModal