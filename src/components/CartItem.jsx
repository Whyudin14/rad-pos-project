function CartItem({ item, onRemove, onEdit }) {
  const formatRupiah = (number) => {
    return `Rp ${Number(number || 0).toLocaleString("id-ID")}`
  }

  const customPrice = Number(item.customPrice || 0)
  const discountPercent = Number(item.discountPercent || 0)
  const priceAfterDiscount =
    customPrice - (customPrice * discountPercent) / 100

  const itemTotal = priceAfterDiscount * item.qty

  return (
    <div
      onClick={() => onEdit(item)}
      className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-blue-300 hover:bg-blue-50/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="line-clamp-1 text-sm font-black text-slate-900">
            {item.name}
          </h4>

          <p className="mt-0.5 text-xs font-medium text-slate-400">
            {item.qty} x {formatRupiah(customPrice)}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(item.id)
          }}
          className="rounded-xl bg-red-50 px-2.5 py-1 text-xs font-bold text-red-500 hover:bg-red-100"
        >
          Hapus
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
            Qty {item.qty}
          </span>

          {discountPercent > 0 && (
            <span className="rounded-xl bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
              Disc {discountPercent}%
            </span>
          )}
        </div>

        <p className="text-lg font-black text-blue-600">
          {formatRupiah(itemTotal)}
        </p>
      </div>
    </div>
  )
}

export default CartItem