import { useEffect, useState } from "react"
import MainLayout from "../layouts/MainLayout"
import { products as dummyProducts } from "../data/dummyProducts"
import AddProductModal from "../components/stock-barang/AddProductModal"
import EditProductModal from "../components/stock-barang/EditProductModal"

function DataBarang() {
  const [searchTerm, setSearchTerm] = useState("")
  const [productStatusFilter, setProductStatusFilter] = useState("Semua")
  const [expandedProductId, setExpandedProductId] = useState(null)
  const [productList, setProductList] = useState([])
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [selectedEditProduct, setSelectedEditProduct] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")

  const productStatusFilters = ["Semua", "Aktif", "Nonaktif"]

  useEffect(() => {
    const storedProducts = JSON.parse(
      localStorage.getItem("radProducts") || "null"
    )

    if (Array.isArray(storedProducts) && storedProducts.length > 0) {
      setProductList(storedProducts)
    } else {
      setProductList(dummyProducts)
      localStorage.setItem("radProducts", JSON.stringify(dummyProducts))
    }
  }, [])

  const formatRupiah = (number) => {
    return `Rp ${Number(number || 0).toLocaleString("id-ID")}`
  }

  const formatDate = (date) => {
    if (!date) return "-"

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) return "-"

    return parsedDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getTotalStock = (product) => {
    if (!product.variants || product.variants.length === 0) {
      return Number(product.stock || 0)
    }

    return product.variants.reduce((total, variant) => {
      return total + Number(variant.stock || 0)
    }, 0)
  }

  const getMinimumStock = (product) => Number(product.minimumStock || 0)

  const isProductActive = (product) => {
    return product.isActive !== false
  }

  const getStockAgeStatusLabel = (status) => {
    const labels = {
      accurate: "Akurat",
      estimated: "Estimasi",
      unknown: "Tidak diketahui",
    }

    return labels[status] || "Tidak diketahui"
  }

  const getStockAgeStatusData = (status) => {
    if (status === "accurate") {
      return {
        label: "Akurat",
        badgeClass: "bg-emerald-50 text-emerald-600 border-emerald-100",
      }
    }

    if (status === "estimated") {
      return {
        label: "Estimasi",
        badgeClass: "bg-amber-50 text-amber-600 border-amber-100",
      }
    }

    return {
      label: "Tidak diketahui",
      badgeClass: "bg-slate-100 text-slate-500 border-slate-200",
    }
  }

  const isProductAgeUnknown = (product) => {
    return !product.stockInDate || product.stockAgeStatus === "unknown"
  }

  const getProductStatusData = (product) => {
    if (isProductActive(product)) {
      return {
        label: "Aktif",
        badgeClass: "bg-emerald-50 text-emerald-600 border-emerald-100",
      }
    }

    return {
      label: "Nonaktif",
      badgeClass: "bg-slate-100 text-slate-500 border-slate-200",
    }
  }

  const totalProducts = productList.length

  const totalActiveProducts = productList.filter((product) => {
    return isProductActive(product)
  }).length

  const totalInactiveProducts = productList.filter((product) => {
    return !isProductActive(product)
  }).length

  const totalVariants = productList.reduce((total, product) => {
    return total + Number(product.variants?.length || 0)
  }, 0)

  const totalUnknownAgeProducts = productList.filter((product) => {
    return isProductActive(product) && getTotalStock(product) > 0 && isProductAgeUnknown(product)
  }).length

  const filteredProducts = productList.filter((product) => {
    const keyword = searchTerm.toLowerCase()
    const productActive = isProductActive(product)

    const matchProduct =
      product.name?.toLowerCase().includes(keyword) ||
      product.brand?.toLowerCase().includes(keyword) ||
      product.category?.toLowerCase().includes(keyword) ||
      product.sku?.toLowerCase().includes(keyword) ||
      product.barcode?.includes(searchTerm) ||
      product.rackLocation?.toLowerCase().includes(keyword) ||
      product.description?.toLowerCase().includes(keyword) ||
      product.stockAgeNote?.toLowerCase().includes(keyword)

    const matchVariant = product.variants?.some((variant) => {
      return (
        variant.value?.toString().toLowerCase().includes(keyword) ||
        variant.sku?.toLowerCase().includes(keyword) ||
        variant.barcode?.includes(searchTerm)
      )
    })

    const matchProductStatus =
      productStatusFilter === "Semua" ||
      (productStatusFilter === "Aktif" && productActive) ||
      (productStatusFilter === "Nonaktif" && !productActive)

    return (matchProduct || matchVariant) && matchProductStatus
  })

  const showSuccessNotification = (message) => {
    setSuccessMessage(message)

    setTimeout(() => {
      setSuccessMessage("")
    }, 2500)
  }

  const toggleExpandProduct = (productId) => {
    setExpandedProductId((currentId) =>
      currentId === productId ? null : productId
    )
  }

  const saveNewProduct = (newProduct) => {
    const productWithStatus = {
      ...newProduct,
      isActive: newProduct.isActive ?? true,
      stockInDate: newProduct.stockInDate || "",
      stockAgeStatus: newProduct.stockAgeStatus || "unknown",
      stockAgeNote: newProduct.stockAgeNote || "",
    }

    const updatedProducts = [productWithStatus, ...productList]

    localStorage.setItem("radProducts", JSON.stringify(updatedProducts))
    setProductList(updatedProducts)
    setShowAddProduct(false)
    setExpandedProductId(productWithStatus.id)
    showSuccessNotification("Produk baru berhasil ditambahkan.")
  }

  const saveEditedProduct = (updatedProduct) => {
    const updatedProducts = productList.map((product) => {
      if (product.id !== updatedProduct.id) return product

      return {
        ...product,
        ...updatedProduct,
        isActive: updatedProduct.isActive ?? product.isActive ?? true,
        stockInDate: updatedProduct.stockInDate || "",
        stockAgeStatus: updatedProduct.stockAgeStatus || "unknown",
        stockAgeNote: updatedProduct.stockAgeNote || "",
        updatedAt: new Date().toISOString(),
      }
    })

    localStorage.setItem("radProducts", JSON.stringify(updatedProducts))
    setProductList(updatedProducts)
    setSelectedEditProduct(null)
    setExpandedProductId(updatedProduct.id)
    showSuccessNotification("Perubahan produk berhasil disimpan.")
  }

  const toggleProductActive = (product) => {
    const currentlyActive = isProductActive(product)

    if (currentlyActive) {
      const confirmInactive = window.confirm(
        `Nonaktifkan produk "${product.name}"?

Produk tidak akan muncul di POS Kasir, tapi data produk dan riwayat transaksi lama tetap aman.`
      )

      if (!confirmInactive) return
    }

    const updatedProducts = productList.map((item) => {
      if (item.id !== product.id) return item

      return {
        ...item,
        isActive: !currentlyActive,
        updatedAt: new Date().toISOString(),
      }
    })

    localStorage.setItem("radProducts", JSON.stringify(updatedProducts))
    setProductList(updatedProducts)

    showSuccessNotification(
      currentlyActive
        ? "Produk berhasil dinonaktifkan."
        : "Produk berhasil diaktifkan kembali."
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen">
        {successMessage && (
          <div className="fixed right-4 top-4 z-[80] w-[calc(100%-2rem)] max-w-sm rounded-3xl border border-emerald-100 bg-white p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-lg">
                ✅
              </div>

              <div>
                <p className="text-sm font-black text-slate-900">Berhasil</p>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-1 text-sm font-black uppercase tracking-wide text-blue-600">
              Manajemen Stok
            </p>

            <h1 className="text-3xl font-black text-slate-900">Data Barang</h1>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Kelola data operasional barang, varian, SKU, barcode, rak, harga,
              umur barang, dan status produk.
            </p>
          </div>

          <button
            onClick={() => setShowAddProduct(true)}
            className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
          >
            + Tambah Produk
          </button>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-5">
          <SummaryCard label="Total Produk" value={totalProducts} color="slate" />
          <SummaryCard label="Produk Aktif" value={totalActiveProducts} color="emerald" />
          <SummaryCard label="Nonaktif" value={totalInactiveProducts} color="red" />
          <SummaryCard label="Total Varian" value={totalVariants} color="blue" />
          <SummaryCard label="Umur Belum Diisi" value={totalUnknownAgeProducts} color="amber" />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 grid gap-4 xl:grid-cols-[1fr_520px] xl:items-start">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Daftar Data Barang
              </h2>

              <p className="mt-1 text-sm font-semibold text-slate-400">
                Halaman ini untuk tambah, edit, dan mengatur status produk.
                Cek stok cepat tetap ada di menu Stok Barang.
              </p>
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama barang, SKU, barcode, ukuran, rak..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div className="mb-4 rounded-3xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {productStatusFilters.map((filter) => {
                  const isActive = productStatusFilter === filter

                  return (
                    <button
                      key={filter}
                      onClick={() => setProductStatusFilter(filter)}
                      className={`rounded-2xl px-4 py-2 text-sm font-black transition ${
                        isActive
                          ? "bg-slate-900 text-white shadow-sm"
                          : "bg-white text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {filter}
                    </button>
                  )
                })}
              </div>

              <p className="text-xs font-bold text-slate-400">
                Menampilkan {filteredProducts.length} dari {productList.length} produk
              </p>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <EmptyState text="Data barang tidak ditemukan" />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="hidden grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr_0.7fr_auto] gap-4 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-400 xl:grid">
                <span>Barang</span>
                <span>Kategori</span>
                <span>Harga</span>
                <span>Varian</span>
                <span>Status</span>
                <span>Aksi</span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredProducts.map((product) => {
                  const isExpanded = expandedProductId === product.id
                  const productStatus = getProductStatusData(product)
                  const productActive = isProductActive(product)
                  const stockAgeStatus = getStockAgeStatusData(
                    product.stockAgeStatus || "unknown"
                  )
                  const productHasUnknownAge =
                    productActive &&
                    getTotalStock(product) > 0 &&
                    isProductAgeUnknown(product)

                  return (
                    <div
                      key={product.id}
                      className={productActive ? "bg-white" : "bg-slate-50"}
                    >
                      <div className="grid gap-4 px-4 py-4 xl:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr_0.7fr_auto] xl:items-center">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-base font-black text-slate-900">
                              {product.name}
                            </h3>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-black ${productStatus.badgeClass}`}
                            >
                              {productStatus.label}
                            </span>

                            {productHasUnknownAge && (
                              <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-600">
                                Umur belum diisi
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {product.brand || "-"}
                          </p>

                          <p className="mt-1 text-xs font-bold text-slate-400">
                            SKU: {product.sku || "-"}
                          </p>

                          <p className="mt-0.5 text-xs font-bold text-slate-400">
                            Barcode: {product.barcode || "-"}
                          </p>

                          <p className="mt-0.5 text-xs font-bold text-slate-400">
                            Rak: {product.rackLocation || "-"}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
                            <span>Tanggal masuk: {formatDate(product.stockInDate)}</span>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[11px] font-black ${stockAgeStatus.badgeClass}`}
                            >
                              {stockAgeStatus.label}
                            </span>
                          </div>
                        </div>

                        <TableInfo
                          label="Kategori"
                          value={product.category || "-"}
                        />

                        <TableInfo
                          label="Harga"
                          value={formatRupiah(product.price)}
                          strong
                        />

                        <TableInfo
                          label="Varian"
                          value={`${product.variants?.length || 0} ${
                            product.variantType || ""
                          }`}
                        />

                        <div>
                          <p className="text-xs font-bold text-slate-400 xl:hidden">
                            Status
                          </p>
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${productStatus.badgeClass}`}
                          >
                            {productStatus.label}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleExpandProduct(product.id)}
                          className={`w-full rounded-2xl px-4 py-2.5 text-sm font-black transition xl:w-auto ${
                            isExpanded
                              ? "bg-slate-900 text-white"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {isExpanded ? "Tutup" : "Detail"}
                        </button>
                      </div>

                      {isExpanded && (
                        <ProductDetail
                          product={product}
                          totalStock={getTotalStock(product)}
                          minimumStock={getMinimumStock(product)}
                          formatRupiah={formatRupiah}
                          formatDate={formatDate}
                          getStockAgeStatusLabel={getStockAgeStatusLabel}
                          getStockAgeStatusData={getStockAgeStatusData}
                          onEditProduct={setSelectedEditProduct}
                          onToggleProductActive={toggleProductActive}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {showAddProduct && (
          <AddProductModal
            onClose={() => setShowAddProduct(false)}
            onSave={saveNewProduct}
          />
        )}

        {selectedEditProduct && (
          <EditProductModal
            product={selectedEditProduct}
            onClose={() => setSelectedEditProduct(null)}
            onSave={saveEditedProduct}
          />
        )}
      </div>
    </MainLayout>
  )
}

function SummaryCard({ label, value, color }) {
  const colorClass = {
    slate: "text-slate-900",
    blue: "text-blue-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    red: "text-red-600",
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-black ${colorClass[color]}`}>
        {value}
      </p>
    </div>
  )
}

function TableInfo({ label, value, strong = false }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 xl:hidden">{label}</p>
      <p
        className={`text-sm ${
          strong ? "font-black text-slate-900" : "font-black text-slate-700"
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-400">
      {text}
    </div>
  )
}

function ProductDetail({
  product,
  totalStock,
  minimumStock,
  formatRupiah,
  formatDate,
  getStockAgeStatusLabel,
  getStockAgeStatusData,
  onEditProduct,
  onToggleProductActive,
}) {
  const stockAgeStatus = getStockAgeStatusData(
    product.stockAgeStatus || "unknown"
  )

  return (
    <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
      <div className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Harga Jual" value={formatRupiah(product.price)} />
        <DetailItem label="SKU Barang" value={product.sku || "-"} breakText />
        <DetailItem
          label="Barcode Barang"
          value={product.barcode || "-"}
          breakText
        />
        <DetailItem label="Total Stok" value={totalStock} />
        <DetailItem label="Brand" value={product.brand || "-"} />
        <DetailItem label="Kategori" value={product.category || "-"} />
        <DetailItem label="Stok Minimum" value={minimumStock || "-"} />
        <DetailItem label="Letak Rak" value={product.rackLocation || "-"} />
        <DetailItem
          label="Tanggal Masuk Barang"
          value={formatDate(product.stockInDate)}
        />
        <DetailItem
          label="Status Umur"
          value={getStockAgeStatusLabel(product.stockAgeStatus || "unknown")}
        />
        <DetailItem
          label="Terakhir Diubah"
          value={formatDate(product.updatedAt)}
        />
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            Umur Barang
          </p>

          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-black ${stockAgeStatus.badgeClass}`}
          >
            {stockAgeStatus.label}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Tanggal Masuk Barang
            </p>
            <p className="mt-1 text-sm font-black text-slate-900">
              {formatDate(product.stockInDate)}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Status Data Umur
            </p>
            <p className="mt-1 text-sm font-black text-slate-900">
              {getStockAgeStatusLabel(product.stockAgeStatus || "unknown")}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            Catatan Umur Barang
          </p>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-600">
            {product.stockAgeNote || "-"}
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
          Keterangan
        </p>
        <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-600">
          {product.description || "-"}
        </p>
      </div>

      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-black text-slate-800">
            Data Varian {product.variantType || ""}
          </p>
          <p className="text-xs font-semibold text-slate-400">
            Berisi ukuran, stok awal/aktif, SKU varian, barcode varian, dan
            harga per varian.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => onEditProduct(product)}
            className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
          >
            Edit Produk
          </button>

          <button
            onClick={() => onToggleProductActive(product)}
            className={`rounded-2xl px-4 py-2.5 text-sm font-black transition ${
              product.isActive === false
                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                : "bg-red-50 text-red-600 hover:bg-red-100"
            }`}
          >
            {product.isActive === false ? "Aktifkan Lagi" : "Nonaktifkan"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <div className="min-w-[820px]">
          <div className="grid grid-cols-[0.45fr_0.45fr_1.15fr_1.15fr_0.75fr] gap-3 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-400">
            <span>Ukuran</span>
            <span>Stok</span>
            <span>SKU</span>
            <span>Barcode</span>
            <span className="text-right">Harga</span>
          </div>

          <div className="divide-y divide-slate-100">
            {product.variants?.map((variant) => {
              return (
                <div
                  key={variant.id || variant.value}
                  className="grid grid-cols-[0.45fr_0.45fr_1.15fr_1.15fr_0.75fr] gap-3 px-4 py-3 text-sm font-bold text-slate-700"
                >
                  <span className="font-black text-slate-900">
                    {variant.value}
                  </span>

                  <span className="font-black text-slate-900">
                    {Number(variant.stock || 0)}
                  </span>

                  <span className="break-all text-xs text-slate-500">
                    {variant.sku || "-"}
                  </span>

                  <span className="break-all text-xs text-slate-500">
                    {variant.barcode || "-"}
                  </span>

                  <span className="text-right text-xs font-black text-slate-900">
                    {formatRupiah(variant.price)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-blue-50 px-4 py-3 text-xs font-bold text-blue-600">
        Catatan: halaman ini adalah pusat data operasional barang. Untuk cek stok
        cepat gunakan menu Stok Barang, sedangkan proses SO ada di menu Stock
        Opname.
      </div>
    </div>
  )
}

function DetailItem({ label, value, breakText = false }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-black text-slate-900 ${
          breakText ? "break-all" : ""
        }`}
      >
        {value}
      </p>
    </div>
  )
}

export default DataBarang