import { useMemo, useState } from "react"

import MainLayout from "../layouts/MainLayout"
import StatCard from "../components/StatCard"
import { getTransactions } from "../utils/transactionStorage"
import {
  canViewFinancialData,
  getCurrentUserRole,
  getCurrentUserRoleLabel,
} from "../utils/accessControl"

const formatRupiah = (number) => {
  return `Rp ${Number(number || 0).toLocaleString("id-ID")}`
}

const safeNumber = (value) => {
  if (typeof value === "number") return value

  if (typeof value === "string") {
    const cleanedValue = value.replace(/[^\d.-]/g, "")
    return Number(cleanedValue || 0)
  }

  return Number(value || 0)
}

const formatDate = (value) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const formatTime = (value) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

const getTransactionDate = (transaction) => {
  return (
    transaction.createdAt ||
    transaction.date ||
    transaction.transactionDate ||
    transaction.stockReducedAt ||
    transaction.updatedAt ||
    ""
  )
}

const getTransactionTotal = (transaction) => {
  return safeNumber(
    transaction.grandTotal ||
      transaction.finalTotal ||
      transaction.total ||
      transaction.totalAmount ||
      transaction.subtotal ||
      0
  )
}

const getTransactionInvoice = (transaction) => {
  return transaction.invoiceNumber || transaction.invoice || transaction.id || "-"
}

const getTransactionPayment = (transaction) => {
  return (
    transaction.paymentMethod ||
    transaction.payment ||
    transaction.paymentType ||
    transaction.metodePembayaran ||
    "-"
  )
}

const getTransactionQty = (transaction) => {
  if (!Array.isArray(transaction.items)) return 0

  return transaction.items.reduce((sum, item) => {
    return sum + safeNumber(item.qty || item.quantity || 0)
  }, 0)
}

const getTransactionProductText = (transaction) => {
  if (!Array.isArray(transaction.items) || transaction.items.length === 0) {
    return "-"
  }

  const firstItem = transaction.items[0]
  const firstProductName =
    firstItem.productName || firstItem.name || firstItem.product || "-"

  if (transaction.items.length === 1) {
    return firstProductName
  }

  return `${firstProductName} +${transaction.items.length - 1} item`
}

const isVoidTransaction = (transaction) => {
  return transaction.status === "Void"
}

const isSameDay = (dateA, dateB) => {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  )
}

const getStartOfWeek = (date) => {
  const copiedDate = new Date(date)
  const day = copiedDate.getDay()
  const diff = copiedDate.getDate() - day + (day === 0 ? -6 : 1)

  copiedDate.setDate(diff)
  copiedDate.setHours(0, 0, 0, 0)

  return copiedDate
}

const isInSelectedPeriod = (transaction, period) => {
  const now = new Date()
  const transactionDate = new Date(getTransactionDate(transaction))

  if (Number.isNaN(transactionDate.getTime())) return false

  if (period === "daily") {
    return isSameDay(transactionDate, now)
  }

  if (period === "weekly") {
    const startOfWeek = getStartOfWeek(now)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    return transactionDate >= startOfWeek && transactionDate < endOfWeek
  }

  if (period === "monthly") {
    return (
      transactionDate.getFullYear() === now.getFullYear() &&
      transactionDate.getMonth() === now.getMonth()
    )
  }

  if (period === "yearly") {
    return transactionDate.getFullYear() === now.getFullYear()
  }

  return true
}

const getPeriodLabel = (period) => {
  const labels = {
    daily: "Hari Ini",
    weekly: "Minggu Ini",
    monthly: "Bulan Ini",
    yearly: "Tahun Ini",
  }

  return labels[period] || "Hari Ini"
}

function LaporanPenjualan() {
  const [selectedPeriod, setSelectedPeriod] = useState("daily")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState("valid")

  const currentUserRole = getCurrentUserRole()
  const currentUserRoleLabel = getCurrentUserRoleLabel(currentUserRole)
  const userCanViewFinance = canViewFinancialData(currentUserRole)

  const reportData = useMemo(() => {
    const transactions = getTransactions()

    const periodTransactions = transactions.filter((transaction) => {
      return isInSelectedPeriod(transaction, selectedPeriod)
    })

    const statusTransactions = periodTransactions.filter((transaction) => {
      if (statusFilter === "all") return true
      if (statusFilter === "void") return isVoidTransaction(transaction)

      return !isVoidTransaction(transaction)
    })

    const filteredTransactions = statusTransactions.filter((transaction) => {
      const keyword = searchKeyword.toLowerCase().trim()

      if (!keyword) return true

      const invoice = getTransactionInvoice(transaction)
      const payment = getTransactionPayment(transaction)
      const productText = getTransactionProductText(transaction)

      return `${invoice} ${payment} ${productText}`
        .toLowerCase()
        .includes(keyword)
    })

    const validTransactions = filteredTransactions.filter((transaction) => {
      return !isVoidTransaction(transaction)
    })

    const voidTransactions = filteredTransactions.filter((transaction) => {
      return isVoidTransaction(transaction)
    })

    const totalSales = validTransactions.reduce((sum, transaction) => {
      return sum + getTransactionTotal(transaction)
    }, 0)

    const totalQty = validTransactions.reduce((sum, transaction) => {
      return sum + getTransactionQty(transaction)
    }, 0)

    const averageTransaction =
      validTransactions.length > 0 ? totalSales / validTransactions.length : 0

    return {
      transactions: filteredTransactions,
      validTransactionCount: validTransactions.length,
      voidTransactionCount: voidTransactions.length,
      totalSales,
      totalQty,
      averageTransaction,
    }
  }, [selectedPeriod, searchKeyword, statusFilter])

  const periodLabel = getPeriodLabel(selectedPeriod)

  return (
    <MainLayout>
      <header className="flex flex-col gap-5 mb-8 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600 mb-1">
            Laporan Penjualan
          </p>
          <h2 className="text-3xl font-bold text-slate-900">
            Ringkasan Penjualan
          </h2>
          <p className="text-slate-500 mt-1">
            Pantau transaksi berdasarkan periode, status, dan invoice.
          </p>
        </div>

        <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-400">Role Aktif</p>
          <p className="font-semibold text-sm">{currentUserRoleLabel}</p>
        </div>
      </header>

      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_auto_auto] xl:items-center">
          <div>
            <label className="text-xs font-semibold text-slate-500">
              Cari Transaksi
            </label>
            <input
              type="text"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="Cari invoice, produk, metode pembayaran..."
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500">
              Periode
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { key: "daily", label: "Harian" },
                { key: "weekly", label: "Mingguan" },
                { key: "monthly", label: "Bulanan" },
                { key: "yearly", label: "Tahunan" },
              ].map((period) => {
                const isActive = selectedPeriod === period.key

                return (
                  <button
                    key={period.key}
                    type="button"
                    onClick={() => setSelectedPeriod(period.key)}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {period.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="valid">Transaksi Valid</option>
              <option value="void">Transaksi Void</option>
              <option value="all">Semua Status</option>
            </select>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 xl:grid-cols-4">
        {userCanViewFinance ? (
          <StatCard
            title={`Omzet ${periodLabel}`}
            value={formatRupiah(reportData.totalSales)}
            note="Tidak termasuk transaksi void"
            icon="💰"
          />
        ) : (
          <StatCard
            title={`Omzet ${periodLabel}`}
            value="Terkunci"
            note="Hanya owner/admin yang bisa melihat nominal"
            icon="🔒"
          />
        )}

        <StatCard
          title="Transaksi Valid"
          value={reportData.validTransactionCount}
          note="Transaksi yang masuk laporan"
          icon="🧾"
        />

        <StatCard
          title="Item Terjual"
          value={`${reportData.totalQty} Item`}
          note="Boleh dilihat staff/kasir"
          icon="👟"
        />

        {userCanViewFinance ? (
          <StatCard
            title="Rata-rata Transaksi"
            value={formatRupiah(reportData.averageTransaction)}
            note="Omzet dibagi transaksi valid"
            icon="📊"
          />
        ) : (
          <StatCard
            title="Rata-rata Transaksi"
            value="Terkunci"
            note="Termasuk data keuangan"
            icon="🔒"
          />
        )}
      </section>

      {!userCanViewFinance && (
        <section className="mb-8 rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5">
          <div className="flex gap-3">
            <div className="text-2xl">🔒</div>
            <div>
              <h3 className="font-bold text-amber-900">
                Akses nominal laporan dibatasi
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                Role {currentUserRoleLabel} hanya dapat melihat data operasional
                seperti jumlah transaksi dan item terjual. Omzet, rata-rata
                transaksi, HPP, laba, dan settlement hanya untuk owner/admin.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Detail Transaksi
            </h3>
            <p className="text-sm text-slate-400">
              Menampilkan {reportData.transactions.length} transaksi berdasarkan
              filter aktif.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
            Void: {reportData.voidTransactionCount}
          </div>
        </div>

        {reportData.transactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <p className="font-semibold text-slate-700">
              Belum ada transaksi
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Coba ubah periode, status, atau kata kunci pencarian.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="pb-3 font-medium">Invoice</th>
                  <th className="pb-3 font-medium">Tanggal</th>
                  <th className="pb-3 font-medium">Jam</th>
                  <th className="pb-3 font-medium">Produk</th>
                  <th className="pb-3 font-medium text-center">Qty</th>
                  <th className="pb-3 font-medium">Metode</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>

              <tbody>
                {reportData.transactions.map((transaction) => {
                  const invoice = getTransactionInvoice(transaction)
                  const date = getTransactionDate(transaction)
                  const productText = getTransactionProductText(transaction)
                  const qty = getTransactionQty(transaction)
                  const payment = getTransactionPayment(transaction)
                  const total = getTransactionTotal(transaction)
                  const isVoid = isVoidTransaction(transaction)

                  return (
                    <tr
                      key={transaction.id || invoice}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-4 font-semibold text-slate-700">
                        {invoice}
                      </td>

                      <td className="py-4 text-slate-500">
                        {formatDate(date)}
                      </td>

                      <td className="py-4 text-slate-500">
                        {formatTime(date)}
                      </td>

                      <td className="py-4 text-slate-600">
                        {productText}
                      </td>

                      <td className="py-4 text-center font-semibold text-slate-700">
                        {qty}
                      </td>

                      <td className="py-4">
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                          {payment}
                        </span>
                      </td>

                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isVoid
                              ? "bg-red-50 text-red-600"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {isVoid ? "Void" : "Valid"}
                        </span>
                      </td>

                      <td className="py-4 text-right font-bold text-blue-600">
                        {userCanViewFinance ? formatRupiah(total) : "Terkunci"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </MainLayout>
  )
}

export default LaporanPenjualan