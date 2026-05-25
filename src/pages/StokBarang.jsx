import { useState } from "react"
import MainLayout from "../layouts/MainLayout"
import { products } from "../data/dummyProducts"

function StokBarang() {
  const [searchTerm, setSearchTerm] = useState("")
  const [stockFilter, setStockFilter] = useState("Semua")
  const [expandedProductId, setExpandedProductId] = useState(null)
  const [showComingSoon, setShowComingSoon] = useState(false)

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

  const getStockStatus = (stock) => {
    if (stock <= 0) {
      return {
        label: "Kosong",
        className: "bg-red-50 text-red-600",
        textClassName: "text-red-600",
      }
    }

    if (stock <= 3) {
      return {
        label: "Menipis",
        className: "bg-amber-50 text-amber-600",
        textClassName: "text-amber-600",
      }
    }

    return {
      label: "Aman",
      className: "bg-emerald-50 text-emerald-600",
      textClassName: "text-emerald-600",
    }
  }

  const getVariantStockStats = (product) => {
    const variants = product.variants || []

    return {
      total: variants.length,
      safe: variants.filter((variant) => Number(variant.stock || 0) > 3).length,
      low: variants.filter((variant) => {
        const stock = Number(variant.stock || 0)
        return stock > 0 && stock <= 3
      }).length,
      empty: variants.filter((variant) => Number(variant.stock || 0) <= 0)
        .length,
    }
  }

  const totalProducts = products.length

  const totalVariants = products.reduce((total, product) => {
    return total + Number(product.variants?.length || 0)
  }, 0)

  const totalStock = products.reduce((total, product) => {
    return total + getTotalStock(product)
  }, 0)

  const totalLowStockProducts = products.filter((product) => {
    const stock = getTotalStock(product)
    return stock > 0 && stock <= 3
  }).length

  const totalEmptyProducts = products.filter((product) => {
    return getTotalStock(product) <= 0
  }).length

  const stockFilters = [
    { label: "Semua", value: "Semua" },
    { label: "Stok Aman", value: "Aman" },
    { label: "Stok Menipis", value: "Menipis" },
    { label: "Stok Kosong", value: "Kosong" },
  ]

  const filteredProducts = products.filter((product) => {
    const keyword = searchTerm.toLowerCase()
    const productStock = getTotalStock(product)
    const stockStatus = getStockStatus(productStock)

    const matchSearch =
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

    const matchStockFilter =
      stockFilter === "Semua" || stockStatus.label === stockFilter

    return (matchSearch || matchVariant) && matchStockFilter
  })

  const toggleExpandProduct = (productId) => {
    setExpandedProductId((currentId) =>
      currentId === productId ? null : productId
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-1 text-sm font-black uppercase tracking-wide text-blue-600">
              Manajemen
            </p>

            <h1 className="text-3xl font-black text-slate-900">
              Stok Barang
            </h1>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Pantau produk, varian ukuran, SKU, barcode, harga, dan stok.
            </p>
          </div>

          <button
            onClick={() => setShowComingSoon(true)}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
          >
            + Tambah Produk
          </button>
        </div>

        <div className="mb-5 grid gap-4 md:grid-cols-4">
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
              Ukuran / variasi
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-400">Total Stok</p>
            <p className="mt-2 text-3xl font-black text-emerald-600">
              {totalStock}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              Semua varian
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-400">Perlu Dicek</p>
            <p className="mt-2 text-3xl font-black text-amber-600">
              {totalLowStockProducts + totalEmptyProducts}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              Menipis / kosong
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Data Barang
                </h2>

                <p className="mt-1 text-sm font-semibold text-slate-400">
                  Klik detail untuk melihat stok per ukuran.
                </p>
              </div>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama, brand, SKU, barcode, ukuran..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 lg:max-w-md"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {stockFilters.map((filter) => {
                const isActive = stockFilter === filter.value

                return (
                  <button
                    key={filter.value}
                    onClick={() => setStockFilter(filter.value)}
                    className={`rounded-2xl px-4 py-2 text-sm font-black transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {filter.label}
                  </button>
                )
              })}
            </div>
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
                const stockStatus = getStockStatus(productStock)
                const variantStats = getVariantStockStats(product)

                return (
                  <div
                    key={product.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:border-blue-200"
                  >
                    <div className="grid gap-4 p-4 xl:grid-cols-[1.45fr_0.8fr_0.6fr_0.75fr_0.65fr_auto] xl:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-black text-slate-900">
                            {product.name}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-black ${stockStatus.className}`}
                          >
                            {stockStatus.label}
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
                          Harga Jual
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
                          {product.variants?.length || 0}{" "}
                          {product.variantType || ""}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-400">
                          Kondisi Varian
                        </p>
                        <p className="mt-1 text-xs font-black text-slate-600">
                          {variantStats.safe} aman • {variantStats.low} menipis
                          • {variantStats.empty} kosong
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-400">
                          Total Stok
                        </p>
                        <p
                          className={`mt-1 text-lg font-black ${stockStatus.textClassName}`}
                        >
                          {productStock}
                        </p>
                      </div>

                      <button
                        onClick={() => toggleExpandProduct(product.id)}
                        className={`rounded-2xl px-4 py-2.5 text-sm font-black transition ${
                          isExpanded
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white"
                        }`}
                      >
                        {isExpanded ? "Tutup" : "Detail"}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50 p-4">
                        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-black text-slate-700">
                              Detail Varian
                            </p>
                            <p className="text-xs font-semibold text-slate-400">
                              Cek stok, SKU, barcode, dan harga per ukuran.
                            </p>
                          </div>

                          <p className="text-xs font-black text-slate-400">
                            {product.variantType || "Varian"}
                          </p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                          {product.variants?.map((variant) => {
                            const variantStock = Number(variant.stock || 0)
                            const variantStatus = getStockStatus(variantStock)

                            return (
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
                                    className={`rounded-full px-3 py-1 text-xs font-black ${variantStatus.className}`}
                                  >
                                    Stok {variantStock}
                                  </span>
                                </div>

                                <div className="space-y-1.5 text-xs font-semibold text-slate-500">
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
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {showComingSoon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-blue-600">
                    Info
                  </p>

                  <h3 className="mt-1 text-2xl font-black text-slate-900">
                    Tambah Produk
                  </h3>
                </div>

                <button
                  onClick={() => setShowComingSoon(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm font-semibold leading-relaxed text-slate-500">
                Fitur tambah produk belum diaktifkan di tahap ini. Sekarang kita
                fokus dulu ke tampilan data barang dan stok agar aman sebelum
                masuk ke form tambah/edit produk.
              </p>

              <button
                onClick={() => setShowComingSoon(false)}
                className="mt-5 w-full rounded-2xl bg-blue-600 py-3 text-sm font-black text-white transition hover:bg-blue-700"
              >
                Oke, Paham
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default StokBarang