import { useState } from "react"
import MainLayout from "../layouts/MainLayout"
import { products } from "../data/dummyProducts"

function StokBarang() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedProductId, setExpandedProductId] = useState(null)

  const formatRupiah = (number) => {
    return `Rp ${Number(number || 0).toLocaleString("id-ID")}`
  }

  const getTotalStock = (product) => {
    if (!product.variants || product.variants.length === 0) {
      return Number(product.stock || 0)
    }

    return product.variants.reduce((total, variant) => {
      return total + Number(variant.stock || 0)
    }, 0)
  }

  const totalProducts = products.length

  const totalVariants = products.reduce((total, product) => {
    return total + Number(product.variants?.length || 0)
  }, 0)

  const totalStock = products.reduce((total, product) => {
    return total + getTotalStock(product)
  }, 0)

  const filteredProducts = products.filter((product) => {
    const keyword = searchTerm.toLowerCase()

    const matchProduct =
      product.name?.toLowerCase().includes(keyword) ||
      product.brand?.toLowerCase().includes(keyword) ||
      product.category?.toLowerCase().includes(keyword) ||
      product.sku?.toLowerCase().includes(keyword) ||
      product.barcode?.includes(searchTerm)

    const matchVariant = product.variants?.some((variant) => {
      return (
        variant.value?.toLowerCase().includes(keyword) ||
        variant.sku?.toLowerCase().includes(keyword) ||
        variant.barcode?.includes(searchTerm)
      )
    })

    return matchProduct || matchVariant
  })

  const toggleExpandProduct = (productId) => {
    setExpandedProductId((currentId) =>
      currentId === productId ? null : productId
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold text-blue-600">
              Inventory
            </p>
            <h1 className="text-3xl font-black text-slate-900">
              Produk / Stok Barang
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Pantau data produk, varian, SKU, barcode, dan stok barang.
            </p>
          </div>

          <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800">
            + Tambah Produk
          </button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-400">Total Produk</p>
            <p className="mt-2 text-3xl font-black text-slate-900">
              {totalProducts}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              Produk utama
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-400">Total Varian</p>
            <p className="mt-2 text-3xl font-black text-blue-600">
              {totalVariants}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              Ukuran / variasi produk
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-400">Total Stok</p>
            <p className="mt-2 text-3xl font-black text-emerald-600">
              {totalStock}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              Akumulasi semua varian
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Daftar Produk
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-400">
                Klik detail untuk melihat stok per ukuran.
              </p>
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari produk, brand, SKU, barcode..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 lg:max-w-md"
            />
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-400">
              Produk tidak ditemukan
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => {
                const isExpanded = expandedProductId === product.id
                const productStock = getTotalStock(product)

                return (
                  <div
                    key={product.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white"
                  >
                    <div className="grid gap-4 p-4 md:grid-cols-[1.4fr_0.8fr_0.7fr_0.7fr_auto] md:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-black text-slate-900">
                            {product.name}
                          </h3>

                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-600">
                            {product.status || "active"}
                          </span>
                        </div>

                        <p className="mt-1 text-sm font-semibold text-slate-400">
                          {product.brand || "-"} • {product.category || "-"}
                        </p>

                        <p className="mt-1 text-xs font-bold text-slate-400">
                          SKU: {product.sku || "-"} • Barcode:{" "}
                          {product.barcode || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-400">
                          Harga
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-900">
                          {formatRupiah(product.price)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-400">
                          Varian
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-900">
                          {product.variants?.length || 0} {product.variantType}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-400">
                          Total Stok
                        </p>
                        <p
                          className={`mt-1 text-sm font-black ${
                            productStock <= 0
                              ? "text-red-600"
                              : productStock <= 3
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {productStock}
                        </p>
                      </div>

                      <button
                        onClick={() => toggleExpandProduct(product.id)}
                        className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-blue-600 hover:text-white"
                      >
                        {isExpanded ? "Tutup" : "Detail"}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-sm font-black text-slate-700">
                            Detail Varian
                          </p>
                          <p className="text-xs font-bold text-slate-400">
                            {product.variantType || "Varian"}
                          </p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                          {product.variants?.map((variant) => (
                            <div
                              key={variant.id || variant.value}
                              className="rounded-2xl border border-slate-200 bg-white p-4"
                            >
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-xs font-bold text-slate-400">
                                    {product.variantType || "Varian"}
                                  </p>
                                  <p className="text-2xl font-black text-slate-900">
                                    {variant.value}
                                  </p>
                                </div>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-black ${
                                    Number(variant.stock || 0) <= 0
                                      ? "bg-red-50 text-red-600"
                                      : Number(variant.stock || 0) <= 2
                                      ? "bg-amber-50 text-amber-600"
                                      : "bg-emerald-50 text-emerald-600"
                                  }`}
                                >
                                  Stok {variant.stock}
                                </span>
                              </div>

                              <div className="space-y-1 text-xs font-semibold text-slate-500">
                                <div className="flex justify-between gap-3">
                                  <span>SKU</span>
                                  <span className="text-right text-slate-700">
                                    {variant.sku || "-"}
                                  </span>
                                </div>

                                <div className="flex justify-between gap-3">
                                  <span>Barcode</span>
                                  <span className="text-right text-slate-700">
                                    {variant.barcode || "-"}
                                  </span>
                                </div>

                                <div className="flex justify-between gap-3">
                                  <span>Harga</span>
                                  <span className="text-right font-black text-slate-900">
                                    {formatRupiah(variant.price)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

export default StokBarang