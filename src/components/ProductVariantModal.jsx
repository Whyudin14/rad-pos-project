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

  const variants = product.variants || []

  const productName = product.displayName || product.name || "-"
  const productColor = product.color || product.warna || ""

  const getVariantValue = (variant) => {
    return (
      variant?.value ||
      variant?.ukuran ||
      variant?.size ||
      variant?.variantValue ||
      "-"
    )
  }

  const getVariantStock = (variant) => {
    return Number(variant?.stock || variant?.stok || 0)
  }

  const getVariantPrice = (variant) => {
    return Number(
      variant?.price ||
        variant?.hargaJual ||
        variant?.sellingPrice ||
        product?.price ||
        product?.hargaJual ||
        0
    )
  }

  const getVariantSku = (variant) => {
    return variant?.sku || variant?.variantSku || ""
  }

  const getVariantBarcode = (variant) => {
    return variant?.barcode || variant?.variantBarcode || ""
  }

  const handleSelectVariant = (variant) => {
    if (getVariantStock(variant) <= 0) return

    setSelectedVariant(variant)
    onConfirm(variant)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="border-b border-slate-100 bg-white px-6 py-5 text-center">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600">
            Pilih Ukuran
          </p>

          <h2
            title={product.name}
            className="mx-auto mt-2 line-clamp-2 max-w-md text-2xl font-black uppercase leading-tight text-slate-900"
          >
            {productName}
          </h2>

          {productColor && (
            <p
              title={productColor}
              className="mx-auto mt-1 line-clamp-2 max-w-md text-sm font-black uppercase leading-tight text-blue-600"
            >
              {productColor}
            </p>
          )}
        </div>

        <div className="max-h-[62vh] overflow-y-auto bg-slate-50 p-4">
          {variants.length === 0 ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white text-center">
              <div>
                <p className="font-bold text-slate-500">
                  Varian belum tersedia
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Tambahkan varian ukuran di Stok Barang dulu.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {variants.map((variant, index) => {
                const variantValue = getVariantValue(variant)
                const stock = getVariantStock(variant)
                const price = getVariantPrice(variant)
                const sku = getVariantSku(variant)
                const barcode = getVariantBarcode(variant)

                const isOutOfStock = stock <= 0
                const isSelected =
                  selectedVariant &&
                  getVariantValue(selectedVariant) === variantValue

                return (
                  <button
                    key={variant.id || variantValue || index}
                    onClick={() => handleSelectVariant(variant)}
                    disabled={isOutOfStock}
                    className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition ${
                      isOutOfStock
                        ? "cursor-not-allowed border-slate-200 bg-white opacity-50"
                        : isSelected
                          ? "border-blue-600 bg-blue-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-slate-100 px-4 py-3">
                        <span className="text-2xl font-black leading-none text-slate-900">
                          {variantValue}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                              isOutOfStock
                                ? "bg-red-50 text-red-500"
                                : "bg-emerald-50 text-emerald-600"
                            }`}
                          >
                            {isOutOfStock ? "Stok kosong" : `Stok ${stock}`}
                          </span>

                          <span className="text-base font-black leading-none text-blue-600">
                            {formatRupiah(price)}
                          </span>
                        </div>

                        {(sku || barcode) && (
                          <p className="mt-1 line-clamp-1 text-[11px] font-medium text-slate-400">
                            {sku && `SKU: ${sku}`}
                            {sku && barcode && " • "}
                            {barcode && `Barcode: ${barcode}`}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-xl font-black ${
                          isOutOfStock
                            ? "bg-slate-100 text-slate-300"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        ›
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 bg-white p-5">
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-slate-900 py-3.5 text-sm font-black uppercase tracking-wide text-white transition hover:bg-slate-800"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductVariantModal