function ProductCard({ product, onAddToCart }) {
  const formatRupiah = (number) => {
    return `Rp ${Number(number || 0).toLocaleString("id-ID")}`
  }

  const productName = product.displayName || product.name || "-"
  const productColor = product.color || product.warna || ""
  const productStock = Number(product.stock || 0)
  const productPrice = Number(product.price || product.hargaJual || 0)

  return (
    <button
      type="button"
      onClick={() => onAddToCart(product)}
      className="group flex min-h-[200px] flex-col rounded-[18px] border border-slate-300 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-500 hover:shadow-md focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
    >
      <div className="mb-4 flex h-40 items-center justify-center rounded-[18px] bg-slate-100">
        <span className="text-6xl transition group-hover:scale-105">👟</span>
      </div>

      <div className="flex flex-1 flex-col">
        <div>
          <h3
            title={product.name}
            className="line-clamp-2 text-sm font-black uppercase leading-[1.15] text-slate-950"
          >
            {productName}
          </h3>

            {productColor && (
              <p
                title={productColor}
                className="mt-1.5 line-clamp-2 min-h-[32px] text-xs font-black uppercase leading-tight tracking-wide text-blue-600"
              >
                {productColor}
              </p>
            )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-400">
            Stok: <span className="text-slate-500">{productStock}</span>
          </p>

          <span className="max-w-[130px] truncate rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
            {product.category}
          </span>
        </div>

        <div className="mt-auto pt-5">
          <p className="whitespace-nowrap text-lg font-black leading-none text-blue-600">
            {formatRupiah(productPrice)}
          </p>
        </div>
      </div>
    </button>
  )
}

export default ProductCard