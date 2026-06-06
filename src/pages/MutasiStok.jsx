import { useEffect, useState } from "react"
import MainLayout from "../layouts/MainLayout"
import StockMutationHistoryModal from "../components/stock-barang/StockMutationHistoryModal"
import { getStockMutations } from "../utils/transactionStorage"

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

    return new Date(date).toLocaleString("id-ID", {
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

  const filteredStockMutations = stockMutations.filter((item) => {
    const keyword = mutationSearch.toLowerCase()

    const matchType =
      mutationTypeFilter === "Semua" || item.type === mutationTypeFilter

    const matchSearch =
      item.productName?.toLowerCase().includes(keyword) ||
      item.brand?.toLowerCase().includes(keyword) ||
      item.variantValue?.toString().toLowerCase().includes(keyword) ||
      item.sku?.toLowerCase().includes(keyword) ||
      item.invoiceNumber?.toLowerCase().includes(keyword) ||
      item.reference?.toLowerCase().includes(keyword) ||
      item.source?.toLowerCase().includes(keyword) ||
      item.note?.toLowerCase().includes(keyword)

    return matchType && matchSearch
  })

  const totalMutation = stockMutations.length

  const totalSaleMutation = stockMutations.filter((item) => {
    return item.type === "SALE"
  }).length

  const totalVoidRestoreMutation = stockMutations.filter((item) => {
    return item.type === "VOID_RESTORE"
  }).length

  const totalStockOut = stockMutations.reduce((total, item) => {
    const qty = Number(item.quantity || item.qty || item.difference || 0)

    if (item.type === "SALE") {
      return total + Math.abs(qty)
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
              Cek jejak perubahan stok dari penjualan, void transaksi, dan
              penyesuaian stok agar pergerakan barang lebih mudah ditelusuri.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={refreshStockMutations}
              className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
            >
              Refresh Data
            </button>

            <button
              onClick={openStockMutationHistoryModal}
              className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"
            >
              Buka Riwayat Mutasi
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <SummaryCard label="Total Mutasi" value={totalMutation} color="slate" />
          <SummaryCard label="SALE" value={totalSaleMutation} color="red" />
          <SummaryCard
            label="VOID RESTORE"
            value={totalVoidRestoreMutation}
            color="emerald"
          />
          <SummaryCard label="Stok Keluar" value={totalStockOut} color="amber" />
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Riwayat Mutasi Stok
              </h2>

              <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
                Data ini membaca log perubahan stok dari transaksi kasir dan
                void transaksi. Nanti tipe STOCK_OPNAME_ADJUSTMENT juga akan
                masuk ke halaman ini.
              </p>
            </div>

            <button
              onClick={openStockMutationHistoryModal}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-700"
            >
              Lihat Detail
            </button>
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
            ) : (
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-black text-slate-900">
                    Data mutasi stok tersedia.
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Total {stockMutations.length} log mutasi tercatat di sistem.
                  </p>
                </div>

                <p className="rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
                  Audit aktif
                </p>
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

export default MutasiStok