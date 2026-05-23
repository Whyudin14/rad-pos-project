function ProductCard({ product, onAddToCart }) {
  return (
    <button
      onClick={() => onAddToCart(product)}
      className="bg-white border border-slate-200 rounded-3xl p-4 hover:border-blue-500 hover:shadow-md transition text-left"
    >
      <div className="h-36 bg-slate-100 rounded-2xl mb-4 flex items-center justify-center text-5xl">
        👟
      </div>

      <div>
        <h3 className="font-semibold text-slate-800 line-clamp-1">
          {product.name}
        </h3>

        <p className="text-sm text-slate-400 mt-1">
          Stok: {product.stock}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-lg font-bold text-blue-600">
            Rp {product.price.toLocaleString("id-ID")}
          </p>

          <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-500">
            {product.category}
          </span>
        </div>
      </div>
    </button>
  )
}

export default ProductCard