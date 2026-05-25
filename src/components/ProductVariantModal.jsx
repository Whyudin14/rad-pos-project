function ProductVariantModal({
  isOpen,
  onClose,
  product,
  selectedVariant,
  setSelectedVariant,
  onConfirm,
}) {
  if (!isOpen || !product) return null

  const formatRupiah = (number) => {
    return `Rp ${Number(number || 0).toLocaleString("id-ID")}`
  }

  const variantType = product.variantType || "Variasi"
  const variants = product.variants || []

  const handleSelectVariant = (variant) => {
    if (Number(variant.stock || 0) <= 0) return

    setSelectedVariant(variant)
    onConfirm(variant)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-5 py-4 text-center">
          <h2 className="text-base font-black uppercase tracking-wide text-slate-800">
            Pilih Variasi
          </h2>

          <p className="mt-1 text-xs font-medium text-slate-400">
            {product.name}
          </p>
        </div>

        <div className="max-h-[65vh] overflow-y-auto">
          {variants.map((variant) => {
            const stock = Number(variant.stock || 0)
            const price = Number(variant.price || product.price || 0)
            const isOutOfStock = stock <= 0
            const isSelected = selectedVariant?.value === variant.value

            return (
              <button
                key={variant.value}
                onClick={() => handleSelectVariant(variant)}
                disabled={isOutOfStock}
                className={`flex w-full items-center justify-between border-b border-slate-100 px-6 py-4 text-left transition ${
                  isOutOfStock
                    ? "cursor-not-allowed bg-slate-50 opacity-55"
                    : "bg-white hover:bg-slate-50"
                } ${isSelected ? "bg-blue-50" : ""}`}
              >
                <div>
                  <p className="text-lg font-bold text-slate-800">
                    {variant.value}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-400">
                    sisa {stock} • {formatRupiah(price)}
                  </p>
                </div>

                <span className="text-2xl font-bold text-slate-300">›</span>
              </button>
            )
          })}
        </div>

        <div className="p-5">
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-black uppercase tracking-wide text-white hover:bg-emerald-700"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductVariantModal