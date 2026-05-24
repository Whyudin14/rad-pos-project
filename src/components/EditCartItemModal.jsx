import { useEffect, useState } from "react"

function EditCartItemModal({ isOpen, onClose, item, onSave, onAfterSave }) {
  const [qty, setQty] = useState(1)
  const [customPrice, setCustomPrice] = useState("")
  const [discountPercent, setDiscountPercent] = useState("")
  const [note, setNote] = useState("")

  useEffect(() => {
    if (item) {
      setQty(item.qty)
      setCustomPrice(item.customPrice)
      setDiscountPercent(item.discountPercent === 0 ? "" : item.discountPercent)
      setNote(item.note || "")
    }
  }, [item])

  if (!isOpen || !item) return null

  const formatRupiah = (number) => {
    return `Rp ${Number(number || 0).toLocaleString("id-ID")}`
  }

  const price = Number(customPrice || 0)
  const discount = Number(discountPercent || 0)
  const netPrice = price - (price * discount) / 100
  const total = netPrice * qty

  const handleSave = () => {
    onSave(item.id, {
      qty,
      customPrice: price,
      discountPercent: discount,
      note,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[520px] rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">{item.name}</h2>
            <p className="mt-0.5 text-sm font-medium text-slate-400">
              {item.category}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 rounded-3xl bg-blue-50 px-5 py-4 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-500">
            Total Item
          </p>
          <p className="mt-1 text-3xl font-black tracking-tight text-blue-700">
            {formatRupiah(total)}
          </p>
          <p className="mt-1 text-xs font-medium text-blue-500">
            {qty} x {formatRupiah(netPrice)}
          </p>
        </div>

        <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-3xl bg-slate-50 px-5 py-4">
          <button
            onClick={() => setQty(qty > 1 ? qty - 1 : 1)}
            className="ml-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-2xl font-black text-slate-500 shadow-sm transition hover:bg-slate-100"
          >
            −
          </button>

          <span className="min-w-[70px] text-center text-5xl font-black leading-none text-blue-600">
            {qty}
          </span>

          <button
            onClick={() => setQty(qty + 1)}
            className="mr-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-2xl font-black text-slate-500 shadow-sm transition hover:bg-slate-100"
          >
            +
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">
              Harga bandrol / harga sementara
            </label>
            <input
              type="number"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">
              Diskon reguler per item (%)
            </label>

            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2">
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="0"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              />

              {[5, 10, 15].map((value) => (
                <button
                  key={value}
                  onClick={() => setDiscountPercent(value)}
                  className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">
              Catatan singkat
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: promo, reject box, diskon reguler"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition placeholder:font-medium focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-200 py-3 text-sm font-black text-slate-500 transition hover:bg-slate-50"
          >
            Batal
          </button>

          <button
            onClick={handleSave}
            className="rounded-2xl bg-blue-600 py-3 text-sm font-black text-white transition hover:bg-blue-700"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditCartItemModal