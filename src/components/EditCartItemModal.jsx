import { useEffect, useState } from "react"

function EditCartItemModal({ isOpen, onClose, item, onSave, onAfterSave }) {
  const [qty, setQty] = useState(1)
  const [customPrice, setCustomPrice] = useState("")
  const [discountPercent, setDiscountPercent] = useState("")
  const [note, setNote] = useState("")

  useEffect(() => {
    if (item) {
      setQty(Number(item.qty || 1))
      setCustomPrice(item.customPrice)
      setDiscountPercent(item.discountPercent === 0 ? "" : item.discountPercent)
      setNote(item.note || "")
    }
  }, [item])

  if (!isOpen || !item) return null

  const formatRupiah = (number) => {
    return `Rp ${Number(number || 0).toLocaleString("id-ID")}`
  }

  const maxStock = Number(item.variantStock ?? item.stock ?? 0)
  const hasStockLimit = maxStock > 0
  const isMaxQty = hasStockLimit && qty >= maxStock

  const price = Number(customPrice || 0)
  const discount = Number(discountPercent || 0)
  const netPrice = price - (price * discount) / 100
  const total = netPrice * qty

  const decreaseQty = () => {
    setQty((prevQty) => {
      const currentQty = Number(prevQty || 1)
      return currentQty > 1 ? currentQty - 1 : 1
    })
  }

  const increaseQty = () => {
    setQty((prevQty) => {
      const currentQty = Number(prevQty || 1)

      if (hasStockLimit && currentQty >= maxStock) {
        return currentQty
      }

      return currentQty + 1
    })
  }

  const handleSave = () => {
    const finalQty = Number(qty || 0)

    if (finalQty < 1) {
      alert("Qty minimal 1")
      return
    }

    if (hasStockLimit && finalQty > maxStock) {
      alert(`Qty tidak boleh melebihi stok varian. Stok tersedia: ${maxStock}`)
      return
    }

    onSave(item.id, {
      qty: finalQty,
      customPrice: price,
      discountPercent: discount,
      note,
    })

    if (onAfterSave) {
      onAfterSave()
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-[620px] rounded-[26px] bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-blue-600">
              Edit Item Keranjang
            </p>

            <h2 className="mt-0.5 truncate text-xl font-black leading-tight text-slate-900">
              {item.name}
            </h2>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                {item.category}
              </span>

              {item.variantValue && (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-600">
                  {item.variantType || "Varian"}: {item.variantValue}
                </span>
              )}

              {hasStockLimit && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-600">
                  Stok: {maxStock}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[22px] bg-blue-50 px-5 py-4">
            <p className="text-xs font-black uppercase tracking-wide text-blue-500">
              Total Item
            </p>

            <p className="mt-1 text-3xl font-black leading-tight tracking-tight text-blue-700">
              {formatRupiah(total)}
            </p>

            <p className="mt-1 text-xs font-bold text-blue-500">
              {qty} x {formatRupiah(netPrice)}
            </p>
          </div>

          <div className="rounded-[22px] bg-slate-50 px-4 py-4">
            <p className="mb-3 text-center text-xs font-black uppercase tracking-wide text-slate-400">
              Qty
            </p>

            <div className="grid grid-cols-[44px_1fr_44px] items-center gap-2">
              <button
                onClick={decreaseQty}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-2xl font-black text-slate-500 shadow-sm transition hover:bg-slate-100"
              >
                −
              </button>

              <span className="text-center text-5xl font-black leading-none text-blue-600">
                {qty}
              </span>

              <button
                onClick={increaseQty}
                disabled={isMaxQty}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-2xl font-black text-slate-500 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-300"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {isMaxQty && (
          <div className="mb-3 rounded-2xl bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700">
            Qty sudah mencapai stok maksimal untuk varian ini.
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
              Harga Bandrol / Sementara
            </label>

            <input
              type="number"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
              Diskon Reguler (%)
            </label>

            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2">
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="0"
                className="h-11 w-full min-w-0 rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              />

              {[5, 10, 15].map((value) => (
                <button
                  key={value}
                  onClick={() => setDiscountPercent(value)}
                  className="h-11 rounded-2xl bg-slate-100 px-3 text-sm font-black text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
              Catatan Singkat
            </label>

            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: promo, reject box, diskon reguler"
              className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-800 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="h-12 rounded-2xl border border-slate-200 text-sm font-black text-slate-500 transition hover:bg-slate-50"
          >
            Batal
          </button>

          <button
            onClick={handleSave}
            className="h-12 rounded-2xl bg-blue-600 text-sm font-black text-white transition hover:bg-blue-700"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditCartItemModal