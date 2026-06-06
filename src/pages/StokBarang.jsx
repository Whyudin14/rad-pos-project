import { useEffect, useMemo, useState } from "react"
import MainLayout from "../layouts/MainLayout"
import { products as dummyProducts } from "../data/dummyProducts"

function StokBarang() {
  const [searchTerm, setSearchTerm] = useState("")
  const [stockFilter, setStockFilter] = useState("Semua")
  const [productStatusFilter, setProductStatusFilter] = useState("Semua")
  const [viewMode, setViewMode] = useState("Ringkas")
  const [expandedProductId, setExpandedProductId] = useState(null)
  const [expandedRowId, setExpandedRowId] = useState(null)
  const [productList, setProductList] = useState([])

  const stockFilters = ["Semua", "Aman", "Menipis", "Kosong"]
  const productStatusFilters = ["Semua", "Aktif", "Nonaktif"]
  const viewModes = ["Ringkas", "Per Varian"]

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

  const getTotalStock = (product) => {
    if (!product.variants || product.variants.length === 0) {
      return Number(product.stock || 0)
    }

    return product.variants.reduce((total, variant) => {
      return total + Number(variant.stock || 0)
    }, 0)
  }

  const getMinimumStock = (product) => Number(product.minimumStock || 0)

  const getVariantMinimumStock = (product, variant) => {
    if (variant?.minimumStock !== undefined) {
      return Number(variant.minimumStock || 0)
    }

    return getMinimumStock(product)
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

  const isProductActive = (product) => {
    return product.isActive !== false
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

  const getProductStockSummary = (product) => {
    const variants = product.variants || []
    const safeVariants =
      variants.length > 0
        ? variants
        : [
            {
              id: `${product.id}-default`,
              value: "-",
              sku: product.sku,
              barcode: product.barcode,
              stock: product.stock,
              price: product.price,
              minimumStock: product.minimumStock,
            },
          ]

    const statuses = safeVariants.map((variant) => {
      const stock = Number(variant.stock || 0)
      const minimumStock = getVariantMinimumStock(product, variant)

      return getStockStatus(stock, minimumStock).label
    })

    const totalStock = getTotalStock(product)
    const minimumStock = getMinimumStock(product)

    if (statuses.includes("Kosong")) {
      return getStockStatus(0, minimumStock)
    }

    if (statuses.includes("Menipis")) {
      return {
        label: "Menipis",
        badgeClass: "bg-amber-50 text-amber-600 border-amber-100",
        textClass: "text-amber-600",
      }
    }

    return getStockStatus(totalStock, minimumStock)
  }

  const stockRows = useMemo(() => {
    return productList.flatMap((product) => {
      const variants =
        product.variants && product.variants.length > 0
          ? product.variants
          : [
              {
                id: `${product.id}-default`,
                value: "-",
                sku: product.sku,
                barcode: product.barcode,
                stock: product.stock,
                price: product.price,
                minimumStock: product.minimumStock,
              },
            ]

      return variants.map((variant) => {
        const stock = Number(variant.stock || 0)
        const minimumStock = getVariantMinimumStock(product, variant)
        const stockStatus = getStockStatus(stock, minimumStock)
        const productStatus = getProductStatusData(product)

        return {
          id: `${product.id}-${variant.id || variant.value || variant.sku}`,
          productId: product.id,
          productName: product.name,
          brand: product.brand,
          category: product.category,
          rackLocation: product.rackLocation,
          productSku: product.sku,
          productBarcode: product.barcode,
          productDescription: product.description,
          variantType: product.variantType,
          variantValue: variant.value,
          sku: variant.sku || product.sku,
          barcode: variant.barcode || product.barcode,
          price: variant.price || product.price,
          stock,
          minimumStock,
          stockStatus,
          productStatus,
          isActive: isProductActive(product),
        }
      })
    })
  }, [productList])

  const totalProducts = productList.length
  const totalVariants = stockRows.length

  const totalStock = stockRows.reduce((total, row) => {
    return total + Number(row.stock || 0)
  }, 0)

  const totalNeedCheck = stockRows.filter((row) => {
    return row.stockStatus.label === "Menipis" || row.stockStatus.label === "Kosong"
  }).length

  const filteredProducts = productList.filter((product) => {
    const keyword = searchTerm.toLowerCase()
    const productActive = isProductActive(product)
    const productStockStatus = getProductStockSummary(product)

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
        variant.value?.toString().toLowerCase().includes(keyword) ||
        variant.sku?.toLowerCase().includes(keyword) ||
        variant.barcode?.includes(searchTerm)
      )
    })

    const matchStockFilter =
      stockFilter === "Semua" || productStockStatus.label === stockFilter

    const matchProductStatus =
      productStatusFilter === "Semua" ||
      (productStatusFilter === "Aktif" && productActive) ||
      (productStatusFilter === "Nonaktif" && !productActive)

    return (
      (matchProduct || matchVariant) && matchStockFilter && matchProductStatus
    )
  })

  const filteredStockRows = stockRows.filter((row) => {
    const keyword = searchTerm.toLowerCase()

    const matchSearch =
      row.productName?.toLowerCase().includes(keyword) ||
      row.brand?.toLowerCase().includes(keyword) ||
      row.category?.toLowerCase().includes(keyword) ||
      row.variantValue?.toString().toLowerCase().includes(keyword) ||
      row.sku?.toLowerCase().includes(keyword) ||
      row.barcode?.toString().includes(searchTerm) ||
      row.rackLocation?.toLowerCase().includes(keyword) ||
      row.productDescription?.toLowerCase().includes(keyword)

    const matchStockFilter =
      stockFilter === "Semua" || row.stockStatus.label === stockFilter

    const matchProductStatus =
      productStatusFilter === "Semua" ||
      (productStatusFilter === "Aktif" && row.isActive) ||
      (productStatusFilter === "Nonaktif" && !row.isActive)

    return matchSearch && matchStockFilter && matchProductStatus
  })

  const toggleExpandProduct = (productId) => {
    setExpandedProductId((currentId) =>
      currentId === productId ? null : productId
    )
  }

  const toggleExpandRow = (rowId) => {
    setExpandedRowId((currentId) => (currentId === rowId ? null : rowId))
  }

  const handleChangeViewMode = (mode) => {
    setViewMode(mode)
    setExpandedProductId(null)
    setExpandedRowId(null)
  }

  const displayedCount =
    viewMode === "Ringkas" ? filteredProducts.length : filteredStockRows.length

  return (
    <MainLayout>
      <div className="min-h-screen">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-1 text-sm font-black uppercase tracking-wide text-blue-600">
              Manajemen Stok
            </p>

            <h1 className="text-3xl font-black text-slate-900">
              Stok Barang
            </h1>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Cek stok produk, ukuran, SKU, barcode, dan lokasi rak secara
              cepat.
            </p>
          </div>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-4">
          <SummaryCard label="Produk" value={totalProducts} color="slate" />
          <SummaryCard label="Varian/SKU" value={totalVariants} color="blue" />
          <SummaryCard label="Total Stok" value={totalStock} color="emerald" />
          <SummaryCard label="Perlu Dicek" value={totalNeedCheck} color="amber" />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 grid gap-4 xl:grid-cols-[1fr_520px] xl:items-start">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                {viewMode === "Ringkas"
                  ? "Ringkasan Stok Barang"
                  : "Daftar Stok Per Varian"}
              </h2>

              <p className="mt-1 text-sm font-semibold text-slate-400">
                {viewMode === "Ringkas"
                  ? "Tampilan ringkas per artikel produk. Klik detail untuk melihat stok ukuran."
                  : "Tampilan detail per ukuran/SKU untuk cek barcode, ukuran, dan stok spesifik."}
              </p>
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari barang, ukuran, SKU, barcode, rak..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div className="mb-4 rounded-3xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {stockFilters.map((filter) => {
                  const isActive = stockFilter === filter

                  return (
                    <button
                      key={filter}
                      onClick={() => setStockFilter(filter)}
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

              <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-end">
                <div className="flex rounded-2xl bg-white p-1">
                  {viewModes.map((mode) => {
                    const isActive = viewMode === mode

                    return (
                      <button
                        key={mode}
                        onClick={() => handleChangeViewMode(mode)}
                        className={`rounded-xl px-4 py-2 text-xs font-black transition ${
                          isActive
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {mode}
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Status Produk
                  </span>

                  <select
                    value={productStatusFilter}
                    onChange={(e) => setProductStatusFilter(e.target.value)}
                    className="bg-transparent text-sm font-black text-slate-700 outline-none"
                  >
                    {productStatusFilters.map((filter) => (
                      <option key={filter} value={filter}>
                        {filter}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="rounded-2xl bg-white px-4 py-2 text-xs font-black text-slate-400">
                  {displayedCount}{" "}
                  {viewMode === "Ringkas" ? "produk" : "varian"} ditampilkan
                </p>
              </div>
            </div>
          </div>

          {viewMode === "Ringkas" ? (
            <CompactProductStockTable
              products={filteredProducts}
              expandedProductId={expandedProductId}
              toggleExpandProduct={toggleExpandProduct}
              formatRupiah={formatRupiah}
              getTotalStock={getTotalStock}
              getMinimumStock={getMinimumStock}
              getVariantMinimumStock={getVariantMinimumStock}
              getStockStatus={getStockStatus}
              getProductStockSummary={getProductStockSummary}
              getProductStatusData={getProductStatusData}
              isProductActive={isProductActive}
            />
          ) : (
            <VariantStockTable
              rows={filteredStockRows}
              expandedRowId={expandedRowId}
              toggleExpandRow={toggleExpandRow}
              formatRupiah={formatRupiah}
            />
          )}
        </div>
      </div>
    </MainLayout>
  )
}

function CompactProductStockTable({
  products,
  expandedProductId,
  toggleExpandProduct,
  formatRupiah,
  getTotalStock,
  getMinimumStock,
  getVariantMinimumStock,
  getStockStatus,
  getProductStockSummary,
  getProductStatusData,
  isProductActive,
}) {
  if (products.length === 0) {
    return <EmptyState text="Stok barang tidak ditemukan" />
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="hidden grid-cols-[1.4fr_0.7fr_0.8fr_0.7fr_0.7fr_auto] gap-4 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-400 xl:grid">
        <span>Barang</span>
        <span>Kategori</span>
        <span>Rak</span>
        <span>Varian</span>
        <span>Stok</span>
        <span>Aksi</span>
      </div>

      <div className="divide-y divide-slate-100">
        {products.map((product) => {
          const isExpanded = expandedProductId === product.id
          const productStock = getTotalStock(product)
          const minimumStock = getMinimumStock(product)
          const stockStatus = getProductStockSummary(product)
          const productStatus = getProductStatusData(product)
          const productActive = isProductActive(product)

          return (
            <div
              key={product.id}
              className={productActive ? "bg-white" : "bg-slate-50"}
            >
              <div className="grid gap-4 px-4 py-4 xl:grid-cols-[1.4fr_0.7fr_0.8fr_0.7fr_0.7fr_auto] xl:items-center">
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

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-black ${productStatus.badgeClass}`}
                    >
                      {productStatus.label}
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
                </div>

                <TableInfo label="Kategori" value={product.category || "-"} />

                <TableInfo label="Rak" value={product.rackLocation || "-"} />

                <TableInfo
                  label="Varian"
                  value={`${product.variants?.length || 0} ${
                    product.variantType || ""
                  }`}
                />

                <div>
                  <p className="text-xs font-bold text-slate-400 xl:hidden">
                    Total Stok
                  </p>

                  <p className={`text-lg font-black ${stockStatus.textClass}`}>
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
                <CompactProductDetail
                  product={product}
                  formatRupiah={formatRupiah}
                  getVariantMinimumStock={getVariantMinimumStock}
                  getStockStatus={getStockStatus}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CompactProductDetail({
  product,
  formatRupiah,
  getVariantMinimumStock,
  getStockStatus,
}) {
  const variants =
    product.variants && product.variants.length > 0
      ? product.variants
      : [
          {
            id: `${product.id}-default`,
            value: "-",
            sku: product.sku,
            barcode: product.barcode,
            stock: product.stock,
            price: product.price,
            minimumStock: product.minimumStock,
          },
        ]

  return (
    <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
      <div className="mb-3">
        <p className="text-sm font-black text-slate-800">
          Detail Stok Per {product.variantType || "Varian"}
        </p>
        <p className="text-xs font-semibold text-slate-400">
          Tampilan ini untuk melihat stok ukuran tanpa masuk ke mode Per Varian.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <div className="min-w-[820px]">
          <div className="grid grid-cols-[0.45fr_0.45fr_0.65fr_1.15fr_1.15fr_0.75fr] gap-3 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-400">
            <span>Ukuran</span>
            <span>Stok</span>
            <span>Status</span>
            <span>SKU</span>
            <span>Barcode</span>
            <span className="text-right">Harga</span>
          </div>

          <div className="divide-y divide-slate-100">
            {variants.map((variant) => {
              const variantStock = Number(variant.stock || 0)
              const variantMinimumStock = getVariantMinimumStock(
                product,
                variant
              )
              const variantStatus = getStockStatus(
                variantStock,
                variantMinimumStock
              )

              return (
                <div
                  key={variant.id || variant.value}
                  className="grid grid-cols-[0.45fr_0.45fr_0.65fr_1.15fr_1.15fr_0.75fr] gap-3 px-4 py-3 text-sm font-bold text-slate-700"
                >
                  <span className="font-black text-slate-900">
                    {variant.value}
                  </span>

                  <span className={`font-black ${variantStatus.textClass}`}>
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
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function VariantStockTable({ rows, expandedRowId, toggleExpandRow, formatRupiah }) {
  if (rows.length === 0) {
    return <EmptyState text="Stok barang tidak ditemukan" />
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="hidden grid-cols-[1.35fr_0.45fr_0.75fr_0.8fr_1fr_0.55fr_0.65fr_auto] gap-4 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-400 xl:grid">
        <span>Barang</span>
        <span>Ukuran</span>
        <span>Kategori</span>
        <span>Rak</span>
        <span>SKU / Barcode</span>
        <span>Stok</span>
        <span>Status</span>
        <span>Aksi</span>
      </div>

      <div className="divide-y divide-slate-100">
        {rows.map((row) => {
          const isExpanded = expandedRowId === row.id

          return (
            <div
              key={row.id}
              className={row.isActive ? "bg-white" : "bg-slate-50"}
            >
              <div className="grid gap-4 px-4 py-4 xl:grid-cols-[1.35fr_0.45fr_0.75fr_0.8fr_1fr_0.55fr_0.65fr_auto] xl:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-black text-slate-900">
                      {row.productName}
                    </h3>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-black ${row.productStatus.badgeClass}`}
                    >
                      {row.productStatus.label}
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {row.brand || "-"}
                  </p>
                </div>

                <TableInfo
                  label="Ukuran"
                  value={row.variantValue || "-"}
                  strong
                />

                <TableInfo label="Kategori" value={row.category || "-"} />

                <TableInfo label="Rak" value={row.rackLocation || "-"} />

                <div>
                  <p className="text-xs font-bold text-slate-400 xl:hidden">
                    SKU / Barcode
                  </p>

                  <p className="break-all text-xs font-black text-slate-700">
                    SKU: {row.sku || "-"}
                  </p>

                  <p className="mt-0.5 break-all text-xs font-bold text-slate-400">
                    Barcode: {row.barcode || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 xl:hidden">
                    Stok
                  </p>
                  <p className={`text-lg font-black ${row.stockStatus.textClass}`}>
                    {row.stock}
                  </p>

                  <p className="text-xs font-bold text-slate-400">
                    Min: {row.minimumStock || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 xl:hidden">
                    Status
                  </p>
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${row.stockStatus.badgeClass}`}
                  >
                    {row.stockStatus.label}
                  </span>
                </div>

                <button
                  onClick={() => toggleExpandRow(row.id)}
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
                <StockRowDetail row={row} formatRupiah={formatRupiah} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StockRowDetail({ row, formatRupiah }) {
  return (
    <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Nama Barang" value={row.productName || "-"} />
        <DetailItem label="Brand" value={row.brand || "-"} />
        <DetailItem label="Kategori" value={row.category || "-"} />
        <DetailItem label="Letak Rak" value={row.rackLocation || "-"} />
        <DetailItem
          label={row.variantType ? `Varian ${row.variantType}` : "Varian"}
          value={row.variantValue || "-"}
        />
        <DetailItem label="SKU Varian" value={row.sku || "-"} breakText />
        <DetailItem
          label="Barcode Varian"
          value={row.barcode || "-"}
          breakText
        />
        <DetailItem label="Harga" value={formatRupiah(row.price)} />
        <DetailItem label="Stok Saat Ini" value={row.stock} />
        <DetailItem label="Stok Minimum" value={row.minimumStock || "-"} />
        <DetailItem label="Status Stok" value={row.stockStatus.label} />
        <DetailItem label="Status Produk" value={row.productStatus.label} />
      </div>

      <div className="mt-3 rounded-2xl bg-blue-50 px-4 py-3 text-xs font-bold text-blue-600">
        Catatan: halaman ini hanya untuk monitoring stok. Edit data barang,
        harga, SKU, barcode, dan status produk dilakukan dari menu Data Barang.
      </div>
    </div>
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

export default StokBarang