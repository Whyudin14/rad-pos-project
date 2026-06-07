import { useMemo, useState } from "react"

import MainLayout from "../layouts/MainLayout"
import StatCard from "../components/StatCard"
import { getTransactions } from "../utils/transactionStorage"
import {
  canViewFinancialData,
  getCurrentUserRole,
  getCurrentUserRoleLabel,
} from "../utils/accessControl"

const MONTH_OPTIONS = [
  { value: 0, label: "Januari" },
  { value: 1, label: "Februari" },
  { value: 2, label: "Maret" },
  { value: 3, label: "April" },
  { value: 4, label: "Mei" },
  { value: 5, label: "Juni" },
  { value: 6, label: "Juli" },
  { value: 7, label: "Agustus" },
  { value: 8, label: "September" },
  { value: 9, label: "Oktober" },
  { value: 10, label: "November" },
  { value: 11, label: "Desember" },
]

const getTodayInputValue = () => {
  return new Date().toISOString().slice(0, 10)
}

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

const parseInputDate = (value, endOfDay = false) => {
  if (!value) return null

  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) return null

  if (endOfDay) {
    date.setHours(23, 59, 59, 999)
  } else {
    date.setHours(0, 0, 0, 0)
  }

  return date
}

const isInReportPeriod = ({
  transaction,
  reportMode,
  selectedDate,
  selectedMonth,
  selectedYear,
  rangeStartDate,
  rangeEndDate,
}) => {
  const transactionDate = new Date(getTransactionDate(transaction))

  if (Number.isNaN(transactionDate.getTime())) return false

  if (reportMode === "date") {
    const targetDate = parseInputDate(selectedDate)

    if (!targetDate) return true

    return (
      transactionDate.getFullYear() === targetDate.getFullYear() &&
      transactionDate.getMonth() === targetDate.getMonth() &&
      transactionDate.getDate() === targetDate.getDate()
    )
  }

  if (reportMode === "month") {
    return (
      transactionDate.getFullYear() === Number(selectedYear) &&
      transactionDate.getMonth() === Number(selectedMonth)
    )
  }

  if (reportMode === "year") {
    return transactionDate.getFullYear() === Number(selectedYear)
  }

  if (reportMode === "range") {
    const startDate = parseInputDate(rangeStartDate)
    const endDate = parseInputDate(rangeEndDate, true)

    if (!startDate && !endDate) return true
    if (startDate && transactionDate < startDate) return false
    if (endDate && transactionDate > endDate) return false

    return true
  }

  return true
}

const getReportLabel = ({
  reportMode,
  selectedDate,
  selectedMonth,
  selectedYear,
  rangeStartDate,
  rangeEndDate,
}) => {
  if (reportMode === "date") {
    return selectedDate ? formatDate(`${selectedDate}T00:00:00`) : "Tanggal"
  }

  if (reportMode === "month") {
    const monthLabel =
      MONTH_OPTIONS.find((month) => month.value === Number(selectedMonth))
        ?.label || "Bulan"

    return `${monthLabel} ${selectedYear}`
  }

  if (reportMode === "year") {
    return `Tahun ${selectedYear}`
  }

  if (reportMode === "range") {
    if (rangeStartDate && rangeEndDate) {
      return `${formatDate(`${rangeStartDate}T00:00:00`)} - ${formatDate(
        `${rangeEndDate}T00:00:00`
      )}`
    }

    if (rangeStartDate) {
      return `Mulai ${formatDate(`${rangeStartDate}T00:00:00`)}`
    }

    if (rangeEndDate) {
      return `Sampai ${formatDate(`${rangeEndDate}T00:00:00`)}`
    }

    return "Semua Tanggal"
  }

  return "Periode"
}

function LaporanPenjualan() {
  const now = new Date()

  const [reportMode, setReportMode] = useState("date")
  const [selectedDate, setSelectedDate] = useState(getTodayInputValue())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [rangeStartDate, setRangeStartDate] = useState("")
  const [rangeEndDate, setRangeEndDate] = useState("")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState("valid")

  const currentUserRole = getCurrentUserRole()
  const currentUserRoleLabel = getCurrentUserRoleLabel(currentUserRole)
  const userCanViewFinance = canViewFinancialData(currentUserRole)

  const reportData = useMemo(() => {
    const transactions = getTransactions()

    const periodTransactions = transactions.filter((transaction) => {
      return isInReportPeriod({
        transaction,
        reportMode,
        selectedDate,
        selectedMonth,
        selectedYear,
        rangeStartDate,
        rangeEndDate,
      })
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
  }, [
    reportMode,
    selectedDate,
    selectedMonth,
    selectedYear,
    rangeStartDate,
    rangeEndDate,
    searchKeyword,
    statusFilter,
  ])

  const reportLabel = getReportLabel({
    reportMode,
    selectedDate,
    selectedMonth,
    selectedYear,
    rangeStartDate,
    rangeEndDate,
  })

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
            Pantau transaksi berdasarkan tanggal, bulan, tahun, range, status,
            dan invoice.
          </p>
        </div>

        <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-400">Role Aktif</p>
          <p className="font-semibold text-sm">{currentUserRoleLabel}</p>
        </div>
      </header>

      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_auto_auto] xl:items-start">
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
              Jenis Laporan
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { key: "date", label: "Tanggal" },
                { key: "month", label: "Bulan" },
                { key: "year", label: "Tahun" },
                { key: "range", label: "Custom" },
              ].map((mode) => {
                const isActive = reportMode === mode.key

                return (
                  <button
                    key={mode.key}
                    type="button"
                    onClick={() => setReportMode(mode.key)}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {mode.label}
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

        <div className="mt-5 border-t border-slate-100 pt-5">
          {reportMode === "date" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Pilih Tanggal
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {reportMode === "month" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Pilih Bulan
                </label>
                <select
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                >
                  {MONTH_OPTIONS.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Pilih Tahun
                </label>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                  min="2020"
                  max="2100"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {reportMode === "year" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Pilih Tahun
                </label>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                  min="2020"
                  max="2100"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {reportMode === "range" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={rangeStartDate}
                  onChange={(event) => setRangeStartDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={rangeEndDate}
                  onChange={(event) => setRangeEndDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setRangeStartDate("")
                  setRangeEndDate("")
                }}
                className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 xl:grid-cols-4">
        {userCanViewFinance ? (
          <StatCard
            title="Omzet"
            value={formatRupiah(reportData.totalSales)}
            note={reportLabel}
            icon="💰"
          />
        ) : (
          <StatCard
            title="Omzet"
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
          note={reportLabel}
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
              filter aktif: {reportLabel}.
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
              Coba ubah tanggal, bulan, tahun, range, status, atau kata kunci
              pencarian.
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