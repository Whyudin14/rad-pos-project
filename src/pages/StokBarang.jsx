import { useEffect, useState } from "react"
import MainLayout from "../layouts/MainLayout"
import { products } from "../data/dummyProducts"

function StokBarang() {
  const [searchTerm, setSearchTerm] = useState("")
  const [stockFilter, setStockFilter] = useState("Semua")
  const [expandedProductId, setExpandedProductId] = useState(null)
  const [showComingSoon, setShowComingSoon] = useState(false)

  const [selectedStockOpname, setSelectedStockOpname] = useState(null)
  const [physicalStock, setPhysicalStock] = useState("")
  const [opnameNote, setOpnameNote] = useState("")
  const [showOpnameSuccess, setShowOpnameSuccess] = useState(false)

  const [showOpnameHistory, setShowOpnameHistory] = useState(false)
  const [stockOpnameHistory, setStockOpnameHistory] = useState([])

  useEffect(() => {
    const storedHistory = JSON.parse(
      localStorage.getItem("stockOpnameHistory") || "[]"
    )

    setStockOpnameHistory(storedHistory)
  }, [])

  const formatRupiah = (number) => {
    return `Rp ${Number(number || 0).toLocaleString("id-ID")}`
  }

  const formatDateTime = (date) => {
    if (!date) return "-"

    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  const getMinimumStock = (product) => {
    return Number(product.minimumStock || 0)
  }

  const getStockStatus = (stock, minimumStock = 0) => {
    const numericStock = Number(stock || 0)
    const numericMinimumStock = Number(minimumStock || 0)

    if (numericStock <= 0) {
      return {
        label: "Kosong",
        badgeClass: "bg-red-50 text-red-600 border-red-100",
        textClass: "text-red-600",
      }
    }

    if (numericMinimumStock > 0 && numericStock <= numericMinimumStock) {
      return {
        label: "Menipis",
        badgeClass: "bg-amber-50 text-amber-600 border-amber-100",
        textClass: "text-amber-600",
      }
    }

    return {
      label: "Aman",
      badgeClass: "bg-emerald-50 text-emerald-600 border-emerald-100",
      textClass: "text-emerald-600",
    }
  }

  const getOpnameStatusClass = (status) => {
    if (status === "Sesuai") {
      return "bg-emerald-50 text-emerald-600 border-emerald-100"
    }

    if (status === "Lebih") {
      return "bg-blue-50 text-blue-600 border-blue-100"
    }

    return "bg-red-50 text-red-600 border-red-100"
  }

  const getDifferenceClass = (difference) => {
    const numericDifference = Number(difference || 0)

    if (numericDifference === 0) return "text-emerald-600"
    if (numericDifference > 0) return "text-blue-600"

    return "text-red-600"
  }

  const formatDifference = (difference) => {
    const numericDifference = Number(difference || 0)

    if (numericDifference > 0) return `+${numericDifference}`

    return numericDifference
  }

  const getVariantMinimumStock = (product, variant) => {
    if (variant?.minimumStock !== undefined) {
      return Number(variant.minimumStock || 0)
    }

    return getMinimumStock(product)
  }

  const totalProducts = products.length

  const totalVariants = products.reduce((total, product) => {
    return total + Number(product.variants?.length || 0)
  }, 0)

  const totalStock = products.reduce((total, product) => {
    return total + getTotalStock(product)
  }, 0)

  const totalNeedCheck = products.filter((product) => {
    const stock = getTotalStock(product)
    const minimumStock = getMinimumStock(product)
    const status = getStockStatus(stock, minimumStock)

    return status.label === "Menipis" || status.label === "Kosong"
  }).length

  const filteredProducts = products.filter((product) => {
    const keyword = searchTerm.toLowerCase()
    const productStock = getTotalStock(product)
    const minimumStock = getMinimumStock(product)
    const stockStatus = getStockStatus(productStock, minimumStock)

    const matchProduct =
      product.name?.toLowerCase().includes(keyword) ||
      product.brand?.toLowerCase().includes(keyword) ||
      product.category?.toLowerCase().includes(keyword) ||
      product.sku?.toLowerCase().includes(keyword) ||
      product.barcode?.includes(searchTerm) ||
      product.rackLocation?.toLowerCase().includes(keyword) ||
      product.description?.toLowerCase().includes(keyword)

    const matchVariant = product.variants?.some((variant) => {
      return (
        variant.value?.toLowerCase().includes(keyword) ||
        variant.sku?.toLowerCase().includes(keyword) ||
        variant.barcode?.includes(searchTerm)
      )
    })

    const matchFilter =
      stockFilter === "Semua" || stockStatus.label === stockFilter

    return (matchProduct || matchVariant) && matchFilter
  })

  const toggleExpandProduct = (productId) => {
    setExpandedProductId((currentId) =>
      currentId === productId ? null : productId
    )
  }

  const openStockOpnameModal = (product, variant) => {
    setSelectedStockOpname({
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      category: product.category,
      rackLocation: product.rackLocation,
      variantId: variant.id,
      variantValue: variant.value,
      sku: variant.sku,
      barcode: variant.barcode,
      systemStock: Number(variant.stock || 0),
    })

    setPhysicalStock("")
    setOpnameNote("")
    setShowOpnameSuccess(false)
  }

  const closeStockOpnameModal = () => {
    setSelectedStockOpname(null)
    setPhysicalStock("")
    setOpnameNote("")
    setShowOpnameSuccess(false)
  }

  const saveStockOpname = () => {
    if (!selectedStockOpname) return

    const numericPhysicalStock = Number(physicalStock)

    if (physicalStock === "" || Number.isNaN(numericPhysicalStock)) {
      return
    }

    const difference =
      numericPhysicalStock - Number(selectedStockOpname.systemStock || 0)

    const opnameData = {
      id: `SO-${Date.now()}`,
      date: new Date().toISOString(),
      productId: selectedStockOpname.productId,
      productName: selectedStockOpname.productName,
      brand: selectedStockOpname.brand,
      category: selectedStockOpname.category,
      rackLocation: selectedStockOpname.rackLocation,
      variantId: selectedStockOpname.variantId,
      variantValue: selectedStockOpname.variantValue,
      sku: selectedStockOpname.sku,
      barcode: selectedStockOpname.barcode,
      systemStock: Number(selectedStockOpname.systemStock || 0),
      physicalStock: numericPhysicalStock,
      difference,
      note: opnameNote,
      status:
        difference === 0
          ? "Sesuai"
          : difference > 0
          ? "Lebih"
          : "Kurang",
    }

    const existingHistory = JSON.parse(
      localStorage.getItem("stockOpnameHistory") || "[]"
    )

    const updatedHistory = [opnameData, ...existingHistory]

    localStorage.setItem("stockOpnameHistory", JSON.stringify(updatedHistory))
    setStockOpnameHistory(updatedHistory)

    setShowOpnameSuccess(true)

    setTimeout(() => {
      closeStockOpnameModal()
    }, 900)
  }

  const stockFilters = ["Semua", "Aman", "Menipis", "Kosong"]

  const selectedSystemStock = Number(selectedStockOpname?.systemStock || 0)
  const selectedPhysicalStock = Number(physicalStock || 0)
  const selectedDifference =
    physicalStock === "" ? 0 : selectedPhysicalStock - selectedSystemStock

  return (
    <MainLayout>
      <div className="min-h-screen">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-1 text-sm font-black uppercase tracking-wide text-blue-600">
              Manajemen Barang
            </p>

            <h1 className="text-3xl font-black text-slate-900">
              Stok Barang
            </h1>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Cek stok produk, ukuran, SKU, barcode, dan lokasi rak dengan cepat.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => setShowOpnameHistory(true)}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-slate-700"
            >
              Riwayat SO
            </button>

            <button
              onClick={() => setShowComingSoon(true)}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
            >
              + Tambah Produk
            </button>
          </div>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Produk
            </p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              {totalProducts}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Varian
            </p>
            <p className="mt-1 text-2xl font-black text-blue-600">
              {totalVariants}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Total Stok
            </p>
            <p className="mt-1 text-2xl font-black text-emerald-600">
              {totalStock}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Perlu Dicek
            </p>
            <p className="mt-1 text-2xl font-black text-amber-600">
              {totalNeedCheck}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Data Barang
              </h2>

              <p className="mt-1 text-sm font-semibold text-slate-400">
                Klik detail untuk melihat informasi barang dan stok per ukuran.
              </p>
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama barang, SKU, barcode, ukuran, rak..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 xl:max-w-lg"
            />
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {stockFilters.map((filter) => {
              const isActive = stockFilter === filter

              return (
                <button
                  key={filter}
                  onClick={() => setStockFilter(filter)}
                  className={`rounded-2xl px-4 py-2 text-sm font-black transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {filter}
                </button>
              )
            })}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-400">
              Produk tidak ditemukan
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="hidden grid-cols-[1.5fr_0.8fr_0.7fr_0.7fr_0.7fr_auto] gap-4 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-400 xl:grid">
                <span>Barang</span>
                <span>Kategori</span>
                <span>Harga</span>
                <span>Varian</span>
                <span>Stok</span>
                <span>Aksi</span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredProducts.map((product) => {
                  const isExpanded = expandedProductId === product.id
                  const productStock = getTotalStock(product)
                  const minimumStock = getMinimumStock(product)
                  const stockStatus = getStockStatus(
                    productStock,
                    minimumStock
                  )

                  return (
                    <div key={product.id} className="bg-white">
                      <div className="grid gap-4 px-4 py-4 xl:grid-cols-[1.5fr_0.8fr_0.7fr_0.7fr_0.7fr_auto] xl:items-center">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-base font-black text-slate-900">
                              {product.name}
                            </h3>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-black ${stockStatus.badgeClass}`}
                            >
                              {stockStatus.label}
                            </span>
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
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-400 xl:hidden">
                            Kategori
                          </p>
                          <p className="text-sm font-black text-slate-700">
                            {product.category || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-400 xl:hidden">
                            Harga
                          </p>
                          <p className="text-sm font-black text-slate-900">
                            {formatRupiah(product.price)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-400 xl:hidden">
                            Varian
                          </p>
                          <p className="text-sm font-black text-slate-700">
                            {product.variants?.length || 0}{" "}
                            {product.variantType || ""}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-400 xl:hidden">
                            Total Stok
                          </p>
                          <p
                            className={`text-lg font-black ${stockStatus.textClass}`}
                          >
                            {productStock}
                          </p>

                          <p className="text-xs font-bold text-slate-400">
                            Min: {minimumStock || "-"}
                          </p>
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
                        <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
                          <div className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-4">
                            <div>
                              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                                Harga Jual
                              </p>
                              <p className="mt-1 text-sm font-black text-slate-900">
                                {formatRupiah(product.price)}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                                SKU Barang
                              </p>
                              <p className="mt-1 break-all text-sm font-black text-slate-900">
                                {product.sku || "-"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                                Barcode Barang
                              </p>
                              <p className="mt-1 break-all text-sm font-black text-slate-900">
                                {product.barcode || "-"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                                Total Stok
                              </p>
                              <p
                                className={`mt-1 text-lg font-black ${stockStatus.textClass}`}
                              >
                                {productStock}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                                Brand
                              </p>
                              <p className="mt-1 text-sm font-black text-slate-900">
                                {product.brand || "-"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                                Kategori
                              </p>
                              <p className="mt-1 text-sm font-black text-slate-900">
                                {product.category || "-"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                                Stok Minimum
                              </p>
                              <p className="mt-1 text-sm font-black text-slate-900">
                                {minimumStock || "-"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                                Letak Rak
                              </p>
                              <p className="mt-1 text-sm font-black text-slate-900">
                                {product.rackLocation || "-"}
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

                          <div className="mb-3">
                            <p className="text-sm font-black text-slate-800">
                              Stok Per {product.variantType || "Varian"}
                            </p>
                            <p className="text-xs font-semibold text-slate-400">
                              Fokus utama tabel ini adalah stok fisik per ukuran
                              untuk membantu proses stok opname.
                            </p>
                          </div>

                          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                            <div className="min-w-[900px]">
                              <div className="grid grid-cols-[0.45fr_0.45fr_0.65fr_1.15fr_1.15fr_0.75fr_0.45fr] gap-3 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-400">
                                <span>Ukuran</span>
                                <span>Stok</span>
                                <span>Status</span>
                                <span>SKU</span>
                                <span>Barcode</span>
                                <span className="text-right">Harga</span>
                                <span className="text-right">Aksi</span>
                              </div>

                              <div className="divide-y divide-slate-100">
                                {product.variants?.map((variant) => {
                                  const variantStock = Number(variant.stock || 0)
                                  const variantMinimumStock =
                                    getVariantMinimumStock(product, variant)
                                  const variantStatus = getStockStatus(
                                    variantStock,
                                    variantMinimumStock
                                  )

                                  return (
                                    <div
                                      key={variant.id || variant.value}
                                      className="grid grid-cols-[0.45fr_0.45fr_0.65fr_1.15fr_1.15fr_0.75fr_0.45fr] gap-3 px-4 py-3 text-sm font-bold text-slate-700"
                                    >
                                      <span className="font-black text-slate-900">
                                        {variant.value}
                                      </span>

                                      <span
                                        className={`font-black ${variantStatus.textClass}`}
                                      >
                                        {variantStock}
                                      </span>

                                      <span>
                                        <span
                                          className={`inline-flex rounded-full border px-2 py-1 text-xs font-black ${variantStatus.badgeClass}`}
                                        >
                                          {variantStatus.label}
                                        </span>
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

                                      <span className="text-right">
                                        <button
                                          onClick={() =>
                                            openStockOpnameModal(
                                              product,
                                              variant
                                            )
                                          }
                                          className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-black text-white transition hover:bg-slate-700"
                                        >
                                          SO
                                        </button>
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 rounded-2xl bg-blue-50 px-4 py-3 text-xs font-bold text-blue-600">
                            Catatan: warna dan status stok tetap dihitung dari
                            stok minimum masing-masing ukuran, tapi angka minimum
                            tidak ditampilkan di tabel agar staff gudang fokus
                            pada stok fisik saat stok opname.
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {selectedStockOpname && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-blue-600">
                    Stok Opname
                  </p>

                  <h3 className="mt-1 text-2xl font-black text-slate-900">
                    Cek Stok Fisik
                  </h3>

                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Input stok fisik sesuai hasil hitung barang di rak dan gudang.
                  </p>
                </div>

                <button
                  onClick={closeStockOpnameModal}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-lg font-black text-slate-900">
                  {selectedStockOpname.productName}
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Ukuran
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-900">
                      {selectedStockOpname.variantValue}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Letak Rak
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-900">
                      {selectedStockOpname.rackLocation || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      SKU
                    </p>
                    <p className="mt-1 break-all text-sm font-black text-slate-900">
                      {selectedStockOpname.sku || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Barcode
                    </p>
                    <p className="mt-1 break-all text-sm font-black text-slate-900">
                      {selectedStockOpname.barcode || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Stok Sistem
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {selectedSystemStock}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Stok Fisik
                  </p>
                  <input
                    type="number"
                    min="0"
                    value={physicalStock}
                    onChange={(e) => setPhysicalStock(e.target.value)}
                    placeholder="0"
                    className="mt-1 w-full text-2xl font-black text-slate-900 outline-none placeholder:text-slate-300"
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Selisih
                  </p>
                  <p
                    className={`mt-1 text-2xl font-black ${
                      physicalStock === ""
                        ? "text-slate-300"
                        : selectedDifference === 0
                        ? "text-emerald-600"
                        : selectedDifference > 0
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    {physicalStock === ""
                      ? "-"
                      : selectedDifference > 0
                      ? `+${selectedDifference}`
                      : selectedDifference}
                  </p>
                </div>
              </div>

              <div className="mb-5">
                <label className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Catatan
                </label>
                <textarea
                  value={opnameNote}
                  onChange={(e) => setOpnameNote(e.target.value)}
                  placeholder="Contoh: barang ada di display, dus belum dicek, selisih karena retur, dll."
                  className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {showOpnameSuccess && (
                <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-600">
                  Data stok opname berhasil disimpan.
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={closeStockOpnameModal}
                  className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-200"
                >
                  Batal
                </button>

                <button
                  onClick={saveStockOpname}
                  disabled={physicalStock === ""}
                  className={`rounded-2xl px-5 py-3 text-sm font-black text-white transition ${
                    physicalStock === ""
                      ? "cursor-not-allowed bg-slate-300"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Simpan SO
                </button>
              </div>
            </div>
          </div>
        )}

        {showOpnameHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-3xl bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-blue-600">
                    Riwayat
                  </p>

                  <h3 className="mt-1 text-2xl font-black text-slate-900">
                    Riwayat Stok Opname
                  </h3>

                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Data pencatatan SO tersimpan sementara di localStorage.
                  </p>
                </div>

                <button
                  onClick={() => setShowOpnameHistory(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>

              {stockOpnameHistory.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-400">
                  Belum ada riwayat stok opname
                </div>
              ) : (
                <div className="overflow-auto rounded-2xl border border-slate-200">
                  <div className="min-w-[980px]">
                    <div className="grid grid-cols-[0.9fr_1.2fr_0.5fr_0.5fr_0.5fr_0.5fr_0.6fr_1.4fr] gap-3 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-400">
                      <span>Tanggal</span>
                      <span>Barang</span>
                      <span>Ukuran</span>
                      <span>Sistem</span>
                      <span>Fisik</span>
                      <span>Selisih</span>
                      <span>Status</span>
                      <span>Catatan</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {stockOpnameHistory.map((item) => {
                        return (
                          <div
                            key={item.id}
                            className="grid grid-cols-[0.9fr_1.2fr_0.5fr_0.5fr_0.5fr_0.5fr_0.6fr_1.4fr] gap-3 px-4 py-3 text-sm font-bold text-slate-700"
                          >
                            <span className="text-xs text-slate-500">
                              {formatDateTime(item.date)}
                            </span>

                            <span>
                              <span className="block font-black text-slate-900">
                                {item.productName}
                              </span>
                              <span className="block break-all text-xs text-slate-400">
                                {item.sku || "-"}
                              </span>
                            </span>

                            <span className="font-black text-slate-900">
                              {item.variantValue}
                            </span>

                            <span>{item.systemStock}</span>

                            <span>{item.physicalStock}</span>

                            <span
                              className={`font-black ${getDifferenceClass(
                                item.difference
                              )}`}
                            >
                              {formatDifference(item.difference)}
                            </span>

                            <span>
                              <span
                                className={`inline-flex rounded-full border px-2 py-1 text-xs font-black ${getOpnameStatusClass(
                                  item.status
                                )}`}
                              >
                                {item.status}
                              </span>
                            </span>

                            <span className="text-xs font-semibold leading-relaxed text-slate-500">
                              {item.note || "-"}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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