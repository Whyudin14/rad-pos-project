import { useEffect, useMemo, useState } from "react"
import MainLayout from "../layouts/MainLayout"
import StockMutationHistoryModal from "../components/stock-barang/StockMutationHistoryModal"
import { getStockMutations } from "../utils/stockMutationStorage"

const MUTATION_TYPE_OPTIONS = [
  { value: "Semua", label: "Semua" },
  { value: "out", label: "Stok Keluar" },
  { value: "in", label: "Stok Masuk" },
  { value: "adjustment", label: "Koreksi" },
]

const getMutationTypeLabel = (type) => {
  const labels = {
    out: "Stok Keluar",
    in: "Stok Masuk",
    adjustment: "Koreksi",
  }

  return labels[type] || type || "-"
}

const getMutationSourceLabel = (source) => {
  const labels = {
    pos: "Transaksi POS",
    void: "Void Transaksi",
    manual: "Manual",
    stock_opname: "Stock Opname",
    product_create: "Tambah Produk",
  }

  return labels[source] || source || "-"
}

function MutasiStok() {
  const [stockMutations, setStockMutations] = useState([])
  const [mutationTypeFilter, setMutationTypeFilter] = useState("Semua")
  const [mutationSearch, setMutationSearch] = useState("")
  const [showStockMutationHistory, setShowStockMutationHistory] =
    useState(false)

  useEffect(() => {
    setStockMutations(getStockMutations())
  }, [])

  const formatDateTime = (date) => {
    if (!date) return "-"

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) return "-"

    return parsedDate.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDifference = (difference) => {
    const numericDifference = Number(difference || 0)

    if (numericDifference > 0) return `+${numericDifference}`

    return numericDifference
  }

  const filteredStockMutations = useMemo(() => {
    const keyword = mutationSearch.toLowerCase().trim()

    return stockMutations.filter((item) => {
      const matchType =
        mutationTypeFilter === "Semua" || item.type === mutationTypeFilter

      const searchableText = [
        item.productName,
        item.brand,
        item.category,
        item.variantLabel,
        item.variantValue,
        item.sku,
        item.referenceId,
        item.reference,
        item.invoiceNumber,
        item.source,
        getMutationSourceLabel(item.source),
        item.type,
        getMutationTypeLabel(item.type),
        item.note,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      const matchSearch = !keyword || searchableText.includes(keyword)

      return matchType && matchSearch
    })
  }, [stockMutations, mutationTypeFilter, mutationSearch])

  const totalMutation = stockMutations.length

  const totalStockOutMutation = stockMutations.filter((item) => {
    return item.type === "out"
  }).length

  const totalStockInMutation = stockMutations.filter((item) => {
    return item.type === "in"
  }).length

  const totalAdjustmentMutation = stockMutations.filter((item) => {
    return item.type === "adjustment"
  }).length

  const totalStockOut = stockMutations.reduce((total, item) => {
    const qtyChange = Number(item.qtyChange || 0)

    if (item.type === "out" || qtyChange < 0) {
      return total + Math.abs(qtyChange)
    }

    return total
  }, 0)

  const totalStockIn = stockMutations.reduce((total, item) => {
    const qtyChange = Number(item.qtyChange || 0)

    if (item.type === "in" || qtyChange > 0) {
      return total + Math.abs(qtyChange)
    }

    return total
  }, 0)

  const refreshStockMutations = () => {
    setStockMutations(getStockMutations())
  }

  const openStockMutationHistoryModal = () => {
    refreshStockMutations()
    setShowStockMutationHistory(true)
  }

  const latestMutations = filteredStockMutations.slice(0, 8)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-blue-600">
              Audit Stok
            </p>

            <h1 className="mt-1 text-3xl font-black text-slate-900">
              Mutasi Stok
            </h1>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              Cek jejak perubahan stok dari transaksi penjualan, void transaksi,
              koreksi manual, dan stock opname agar pergerakan barang mudah
              ditelusuri.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={refreshStockMutations}
              className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
            >
              Refresh Data
            </button>

            <button
              type="button"
              onClick={openStockMutationHistoryModal}
              className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"
            >
              Buka Riwayat Mutasi
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          <SummaryCard label="Total Mutasi" value={totalMutation} color="slate" />
          <SummaryCard
            label="Stok Keluar"
            value={totalStockOutMutation}
            color="red"
          />
          <SummaryCard
            label="Stok Masuk"
            value={totalStockInMutation}
            color="emerald"
          />
          <SummaryCard
            label="Koreksi"
            value={totalAdjustmentMutation}
            color="amber"
          />
          <SummaryCard
            label="Qty Keluar"
            value={totalStockOut}
            color="blue"
          />
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Riwayat Mutasi Stok
              </h2>

              <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
                Data ini membaca log perubahan stok dari transaksi POS dan void
                transaksi. Ke depan, koreksi manual dan stock opname juga akan
                masuk ke halaman ini.
              </p>
            </div>

            <button
              type="button"
              onClick={openStockMutationHistoryModal}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-700"
            >
              Lihat Detail
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 lg:grid-cols-[220px_1fr]">
            <div>
              <label className="text-xs font-black uppercase tracking-wide text-slate-400">
                Tipe Mutasi
              </label>
              <select
                value={mutationTypeFilter}
                onChange={(event) => setMutationTypeFilter(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
              >
                {MUTATION_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wide text-slate-400">
                Cari Mutasi
              </label>
              <input
                type="text"
                value={mutationSearch}
                onChange={(event) => setMutationSearch(event.target.value)}
                placeholder="Cari produk, brand, ukuran, SKU, invoice, sumber, catatan..."
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5">
            {stockMutations.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                  🔁
                </div>

                <h3 className="mt-4 text-base font-black text-slate-900">
                  Belum Ada Mutasi Stok
                </h3>

                <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-relaxed text-slate-500">
                  Mutasi stok akan muncul setelah ada transaksi penjualan atau
                  void transaksi yang mengubah stok barang.
                </p>
              </div>
            ) : filteredStockMutations.length === 0 ? (
              <div className="py-10 text-center">
                <h3 className="text-base font-black text-slate-900">
                  Data Tidak Ditemukan
                </h3>

                <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-relaxed text-slate-500">
                  Tidak ada mutasi stok yang cocok dengan filter atau pencarian
                  saat ini.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      Data mutasi stok tersedia.
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      Menampilkan {filteredStockMutations.length} dari{" "}
                      {stockMutations.length} log mutasi tercatat.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <p className="rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
                      Audit aktif
                    </p>

                    <p className="rounded-2xl bg-blue-50 px-4 py-2 text-xs font-black text-blue-700">
                      Masuk {totalStockIn} • Keluar {totalStockOut}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                  <table className="w-full min-w-[1000px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-400">
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Produk</th>
                        <th className="px-4 py-3 text-center">Tipe</th>
                        <th className="px-4 py-3 text-center">Sumber</th>
                        <th className="px-4 py-3 text-center">Sebelum</th>
                        <th className="px-4 py-3 text-center">Mutasi</th>
                        <th className="px-4 py-3 text-center">Sesudah</th>
                        <th className="px-4 py-3">Referensi</th>
                      </tr>
                    </thead>

                    <tbody>
                      {latestMutations.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-slate-100 align-top last:border-0"
                        >
                          <td className="px-4 py-4 text-xs font-semibold text-slate-500">
                            {formatDateTime(item.createdAt || item.date)}
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-black text-slate-900">
                              {item.productName || "-"}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-400">
                              {item.brand || "-"} • {item.category || "-"} •{" "}
                              Size {item.variantLabel || item.variantValue || "-"}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-400">
                              SKU: {item.sku || "-"}
                            </p>
                          </td>

                          <td className="px-4 py-4 text-center">
                            <MutationTypeBadge type={item.type} />
                          </td>

                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                              {getMutationSourceLabel(item.source)}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-center font-black text-slate-700">
                            {item.qtyBefore ?? item.stockBefore ?? 0}
                          </td>

                          <td
                            className={`px-4 py-4 text-center font-black ${
                              Number(item.qtyChange || 0) < 0
                                ? "text-red-600"
                                : Number(item.qtyChange || 0) > 0
                                ? "text-emerald-600"
                                : "text-slate-500"
                            }`}
                          >
                            {formatDifference(item.qtyChange)}
                          </td>

                          <td className="px-4 py-4 text-center font-black text-slate-700">
                            {item.qtyAfter ?? item.stockAfter ?? 0}
                          </td>

                          <td className="px-4 py-4">
                            <p className="text-xs font-black text-slate-700">
                              {item.referenceId ||
                                item.reference ||
                                item.invoiceNumber ||
                                "-"}
                            </p>
                            {item.note && (
                              <p className="mt-1 max-w-xs text-xs font-semibold leading-relaxed text-slate-400">
                                {item.note}
                              </p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredStockMutations.length > latestMutations.length && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={openStockMutationHistoryModal}
                      className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-700"
                    >
                      Lihat Semua Mutasi
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {showStockMutationHistory && (
          <StockMutationHistoryModal
            stockMutations={stockMutations}
            filteredStockMutations={filteredStockMutations}
            mutationTypeFilter={mutationTypeFilter}
            setMutationTypeFilter={setMutationTypeFilter}
            mutationSearch={mutationSearch}
            setMutationSearch={setMutationSearch}
            formatDateTime={formatDateTime}
            formatDifference={formatDifference}
            getMutationTypeLabel={getMutationTypeLabel}
            getMutationSourceLabel={getMutationSourceLabel}
            onClose={() => setShowStockMutationHistory(false)}
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

function MutationTypeBadge({ type }) {
  const config = {
    out: {
      label: "Keluar",
      className: "bg-red-50 text-red-700",
    },
    in: {
      label: "Masuk",
      className: "bg-emerald-50 text-emerald-700",
    },
    adjustment: {
      label: "Koreksi",
      className: "bg-amber-50 text-amber-700",
    },
  }

  const selectedConfig = config[type] || {
    label: type || "-",
    className: "bg-slate-100 text-slate-600",
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${selectedConfig.className}`}
    >
      {selectedConfig.label}
    </span>
  )
}

export default MutasiStok