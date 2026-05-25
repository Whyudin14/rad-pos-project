function CartItem({ item, onRemove, onEdit }) {
  const formatRupiah = (number) => {
    return `Rp ${Number(number || 0).toLocaleString("id-ID")}`
  }

  const customPrice = Number(item.customPrice || item.price || 0)
  const discountPercent = Number(item.discountPercent || item.discount || 0)
  const qty = Number(item.qty || 0)

  const priceAfterDiscount =
    customPrice - (customPrice * discountPercent) / 100

  const itemTotal = priceAfterDiscount * qty

  const variantLabel =
    item.variantType && item.variantValue
      ? `${item.variantType}: ${item.variantValue}`
      : null

  const stockLabel =
    item.variantStock !== undefined && item.variantStock !== null
      ? `Stok varian: ${item.variantStock}`
      : null

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

          {variantLabel && (
            <p className="mt-1 w-fit rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
              {variantLabel}
            </p>
          )}

          <p className="mt-1 text-xs font-medium text-slate-400">
            {qty} x {formatRupiah(customPrice)}
          </p>

          {stockLabel && (
            <p className="mt-0.5 text-[11px] font-medium text-slate-400">
              {stockLabel}
            </p>
          )}

          {item.note && (
            <p className="mt-1 line-clamp-1 text-[11px] italic text-slate-400">
              Catatan: {item.note}
            </p>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(item.cartId || item.id)
          }}
          className="rounded-xl bg-red-50 px-2.5 py-1 text-xs font-bold text-red-500 hover:bg-red-100"
        >
          Hapus
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-xl bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
            Qty {qty}
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