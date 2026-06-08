import {
  ModalWrapper,
  ModalHeader,
} from "../stock-opname/StockOpnameModalLayout"

import {
  MiniSummary,
  EmptyModalState,
} from "../stock-opname/StockOpnameShared"

function StockMutationHistoryModal({
  stockMutations,
  filteredStockMutations,
  mutationTypeFilter,
  setMutationTypeFilter,
  mutationSearch,
  setMutationSearch,
  formatDateTime,
  formatDifference,
  getMutationTypeLabel,
  getMutationSourceLabel,
  onClose,
}) {
  const normalizeType = (type) => {
    if (type === "SALE") return "out"
    if (type === "VOID_RESTORE") return "in"

    return type || "-"
  }

  const normalizeSource = (source, type) => {
    if (source === "Transaksi POS") return "pos"
    if (source === "Void Transaksi") return "void"
    if (type === "SALE") return "pos"
    if (type === "VOID_RESTORE") return "void"

    return source || "-"
  }

  const getTypeLabel = (type) => {
    if (getMutationTypeLabel) {
      return getMutationTypeLabel(normalizeType(type))
    }

    const labels = {
      out: "Stok Keluar",
      in: "Stok Masuk",
      adjustment: "Koreksi",
      SALE: "Stok Keluar",
      VOID_RESTORE: "Stok Masuk",
    }

    return labels[type] || type || "-"
  }

  const getSourceLabel = (source, type) => {
    const normalizedSource = normalizeSource(source, type)

    if (getMutationSourceLabel) {
      return getMutationSourceLabel(normalizedSource)
    }

    const labels = {
      pos: "Transaksi POS",
      void: "Void Transaksi",
      manual: "Manual",
      stock_opname: "Stock Opname",
      product_create: "Tambah Produk",
    }

    return labels[normalizedSource] || normalizedSource || "-"
  }

  const getMutationDate = (item) => {
    return item.createdAt || item.date || "-"
  }

  const getVariantLabel = (item) => {
    return item.variantLabel || item.variantValue || item.ukuran || item.size || "-"
  }

  const getQtyBefore = (item) => {
    return item.qtyBefore ?? item.stockBefore ?? 0
  }

  const getQtyAfter = (item) => {
    return item.qtyAfter ?? item.stockAfter ?? 0
  }

  const getReference = (item) => {
    return item.referenceId || item.invoiceNumber || item.reference || "-"
  }

  const totalStockOut = stockMutations.filter((item) => {
    return normalizeType(item.type) === "out"
  }).length

  const totalStockIn = stockMutations.filter((item) => {
    return normalizeType(item.type) === "in"
  }).length

  const totalAdjustment = stockMutations.filter((item) => {
    return normalizeType(item.type) === "adjustment"
  }).length

  const mutationTypeFilters = [
    { label: "Semua", value: "Semua" },
    { label: "Stok Keluar", value: "out" },
    { label: "Stok Masuk", value: "in" },
    { label: "Koreksi", value: "adjustment" },
  ]

  const getMutationTypeClass = (type) => {
    const normalizedType = normalizeType(type)

    if (normalizedType === "out") {
      return "border-red-100 bg-red-50 text-red-600"
    }

    if (normalizedType === "in") {
      return "border-emerald-100 bg-emerald-50 text-emerald-600"
    }

    if (normalizedType === "adjustment") {
      return "border-amber-100 bg-amber-50 text-amber-600"
    }

    return "border-slate-200 bg-slate-50 text-slate-500"
  }

  const getQtyClass = (qtyChange) => {
    const numericQty = Number(qtyChange || 0)

    if (numericQty > 0) return "text-emerald-600"
    if (numericQty < 0) return "text-red-600"

    return "text-slate-500"
  }

  const displayedMutations = filteredStockMutations.filter((item) => {
    if (mutationTypeFilter === "Semua") return true

    return normalizeType(item.type) === mutationTypeFilter
  })

  return (
    <ModalWrapper maxWidth="max-w-7xl" tall>
      <ModalHeader
        eyebrow="Audit Stok"
        title="Riwayat Mutasi Stok"
        description="Lihat jejak perubahan stok dari transaksi penjualan, void transaksi, dan penyesuaian stok."
        color="emerald"
        onClose={onClose}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-4 sm:px-6">
        <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <MiniSummary
            label="Total Mutasi"
            value={stockMutations.length}
            color="slate"
          />

          <MiniSummary label="Stok Keluar" value={totalStockOut} color="red" />

          <MiniSummary
            label="Stok Masuk"
            value={totalStockIn}
            color="emerald"
          />

          <MiniSummary
            label="Koreksi"
            value={totalAdjustment}
            color="amber"
          />

          <MiniSummary
            label="Ditampilkan"
            value={displayedMutations.length}
            color="blue"
          />
        </div>

        <div className="mb-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="grid gap-3 xl:grid-cols-[1fr_1.6fr] xl:items-end">
            <div>
              <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
                Tipe Mutasi
              </p>

              <div className="flex flex-wrap gap-2">
                {mutationTypeFilters.map((filter) => {
                  const isActive = mutationTypeFilter === filter.value

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setMutationTypeFilter(filter.value)}
                      className={`rounded-xl px-3 py-2 text-xs font-black transition ${
                        isActive
                          ? "bg-slate-900 text-white shadow-sm"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {filter.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                  Pencarian
                </p>

                <p className="hidden text-xs font-bold text-emerald-600 sm:block">
                  {displayedMutations.length} dari {stockMutations.length} item
                </p>
              </div>

              <input
                type="text"
                value={mutationSearch}
                onChange={(e) => setMutationSearch(e.target.value)}
                placeholder="Cari barang, SKU, invoice, sumber, catatan..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
              />

              <p className="mt-2 text-xs font-bold text-emerald-600 sm:hidden">
                {displayedMutations.length} dari {stockMutations.length} mutasi ditampilkan.
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1">
          {stockMutations.length === 0 ? (
            <EmptyModalState text="Belum ada riwayat mutasi stok" />
          ) : displayedMutations.length === 0 ? (
            <EmptyModalState text="Mutasi stok tidak ditemukan" />
          ) : (
            <div className="min-h-0 flex-1 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="min-w-[1120px]">
                <div className="sticky top-0 z-10 hidden grid-cols-[0.85fr_0.75fr_1.55fr_0.45fr_0.55fr_0.55fr_0.55fr_0.9fr_1fr] gap-3 border-b border-slate-100 bg-slate-50/95 px-4 py-3 text-[11px] font-black uppercase tracking-wide text-slate-400 backdrop-blur xl:grid">
                  <span>Tanggal</span>
                  <span>Tipe</span>
                  <span>Barang</span>
                  <span>Ukuran</span>
                  <span>Qty</span>
                  <span>Sebelum</span>
                  <span>Sesudah</span>
                  <span>Sumber</span>
                  <span>Catatan</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {displayedMutations.map((item) => {
                    const normalizedType = normalizeType(item.type)
                    const normalizedSource = normalizeSource(
                      item.source,
                      item.type
                    )

                    return (
                      <div
                        key={item.id}
                        className="grid gap-3 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 xl:grid-cols-[0.85fr_0.75fr_1.55fr_0.45fr_0.55fr_0.55fr_0.55fr_0.9fr_1fr] xl:items-start"
                      >
                        <MutationCell label="Tanggal">
                          <p className="text-xs font-bold leading-relaxed text-slate-500">
                            {formatDateTime(getMutationDate(item))}
                          </p>
                        </MutationCell>

                        <MutationCell label="Tipe">
                          <span
                            className={`inline-flex rounded-full border px-2 py-1 text-xs font-black ${getMutationTypeClass(
                              normalizedType
                            )}`}
                          >
                            {getTypeLabel(normalizedType)}
                          </span>
                        </MutationCell>

                        <div className="min-w-0">
                          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 xl:hidden">
                            Barang
                          </p>

                          <p
                            className="truncate text-sm font-black text-slate-900"
                            title={item.productName}
                          >
                            {item.productName || "-"}
                          </p>

                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-slate-400">
                            <span className="truncate text-slate-500">
                              Brand: {item.brand || "-"}
                            </span>

                            {item.category && (
                              <span className="truncate">
                                Kategori: {item.category}
                              </span>
                            )}

                            <span className="truncate">
                              SKU: {item.sku || "-"}
                            </span>
                          </div>
                        </div>

                        <MutationCell label="Ukuran">
                          <p className="font-black text-slate-900">
                            {getVariantLabel(item)}
                          </p>
                        </MutationCell>

                        <MutationCell label="Qty">
                          <p className={`font-black ${getQtyClass(item.qtyChange)}`}>
                            {formatDifference(item.qtyChange)}
                          </p>
                        </MutationCell>

                        <MutationCell label="Stok Sebelum">
                          <p>{getQtyBefore(item)}</p>
                        </MutationCell>

                        <MutationCell label="Stok Sesudah">
                          <p className="font-black text-slate-900">
                            {getQtyAfter(item)}
                          </p>
                        </MutationCell>

                        <div className="min-w-0">
                          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 xl:hidden">
                            Sumber
                          </p>

                          <p className="truncate text-xs font-black text-slate-700">
                            {getSourceLabel(normalizedSource, normalizedType)}
                          </p>

                          <p className="mt-0.5 truncate text-xs font-bold text-blue-600">
                            {getReference(item)}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 xl:hidden">
                            Catatan
                          </p>

                          <p
                            className="line-clamp-2 text-xs font-semibold leading-relaxed text-slate-500"
                            title={item.note}
                          >
                            {item.note || "-"}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  )
}

function MutationCell({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 xl:hidden">
        {label}
      </p>
      {children}
    </div>
  )
}

export default StockMutationHistoryModal