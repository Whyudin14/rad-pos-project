import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import MainLayout from "../layouts/MainLayout"
import StatCard from "../components/StatCard"
import TransactionTable from "../components/TransactionTable"
import { getTransactions } from "../utils/transactionStorage"
import {
  canViewFinancialData,
  getCurrentUserRole,
  getCurrentUserRoleLabel,
} from "../utils/accessControl"

const PRODUCT_KEY = "radProducts"

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

const getTransactionDate = (transaction) => {
  return new Date(
    transaction.createdAt ||
      transaction.date ||
      transaction.transactionDate ||
      transaction.stockReducedAt ||
      transaction.updatedAt ||
      Date.now()
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

const getTransactionQty = (transaction) => {
  if (!Array.isArray(transaction.items)) return 0

  return transaction.items.reduce((sum, item) => {
    return sum + safeNumber(item.qty || item.quantity || 0)
  }, 0)
}

const isValidTransaction = (transaction) => {
  return transaction.status !== "Void"
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
  const transactionDate = getTransactionDate(transaction)

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

const getProducts = () => {
  try {
    const data = localStorage.getItem(PRODUCT_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Gagal membaca produk:", error)
    return []
  }
}

const getLowStockProducts = (products) => {
  return products.filter((product) => {
    if (product.isActive === false) return false

    const variants = Array.isArray(product.variants) ? product.variants : []

    if (variants.length > 0) {
      const totalVariantStock = variants.reduce((sum, variant) => {
        return sum + safeNumber(variant.stock || variant.stok || 0)
      }, 0)

      return totalVariantStock > 0 && totalVariantStock <= 3
    }

    const productStock = safeNumber(product.stock || product.stok || 0)

    return productStock > 0 && productStock <= 3
  })
}

function Dashboard() {
  const navigate = useNavigate()
  const [selectedPeriod, setSelectedPeriod] = useState("daily")
  const [searchKeyword, setSearchKeyword] = useState("")

  const currentUserRole = getCurrentUserRole()
  const currentUserRoleLabel = getCurrentUserRoleLabel(currentUserRole)
  const userCanViewFinance = canViewFinancialData(currentUserRole)

  const dashboardData = useMemo(() => {
    const transactions = getTransactions()
    const products = getProducts()

    const validTransactions = transactions.filter(isValidTransaction)

    const periodTransactions = validTransactions.filter((transaction) => {
      return isInSelectedPeriod(transaction, selectedPeriod)
    })

    const filteredTransactions = periodTransactions.filter((transaction) => {
      const keyword = searchKeyword.toLowerCase().trim()

      if (!keyword) return true

      const invoice =
        transaction.invoiceNumber || transaction.invoice || transaction.id || ""

      const productText = Array.isArray(transaction.items)
        ? transaction.items
            .map((item) => {
              return item.productName || item.name || item.product || ""
            })
            .join(" ")
        : ""

      return `${invoice} ${productText}`.toLowerCase().includes(keyword)
    })

    const totalSales = filteredTransactions.reduce((sum, transaction) => {
      return sum + getTransactionTotal(transaction)
    }, 0)

    const totalQty = filteredTransactions.reduce((sum, transaction) => {
      return sum + getTransactionQty(transaction)
    }, 0)

    const lowStockProducts = getLowStockProducts(products)

    return {
      transactions: filteredTransactions,
      totalSales,
      totalTransactions: filteredTransactions.length,
      totalQty,
      lowStockCount: lowStockProducts.length,
    }
  }, [selectedPeriod, searchKeyword])

  const periodLabel = getPeriodLabel(selectedPeriod)

  return (
    <MainLayout>
      <header className="flex flex-col gap-5 mb-8 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600 mb-1">
            RAD Sport POS
          </p>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-slate-500 mt-1">
            Pantau transaksi, stok, dan performa toko berdasarkan periode.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:w-80 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
            <input
              type="text"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="Cari produk, transaksi, invoice..."
              className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-xs text-slate-400">Role Aktif</p>
            <p className="font-semibold text-sm">{currentUserRoleLabel}</p>
          </div>
        </div>
      </header>

      <section className="flex flex-wrap gap-2 mb-6">
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
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {period.label}
            </button>
          )
        })}
      </section>

      <section className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 xl:grid-cols-4">
        {userCanViewFinance ? (
          <StatCard
            title={`Penjualan ${periodLabel}`}
            value={formatRupiah(dashboardData.totalSales)}
            note="Tidak termasuk transaksi void"
            icon="💳"
          />
        ) : (
          <StatCard
            title={`Penjualan ${periodLabel}`}
            value="Terkunci"
            note="Hanya owner/admin yang bisa melihat nominal"
            icon="🔒"
          />
        )}

        <StatCard
          title="Total Transaksi"
          value={dashboardData.totalTransactions}
          note={`Transaksi ${periodLabel.toLowerCase()}`}
          icon="🧾"
        />

        <StatCard
          title="Produk Terjual"
          value={`${dashboardData.totalQty} Item`}
          note="Aman dilihat staff/kasir"
          icon="👟"
        />

        <StatCard
          title="Stok Menipis"
          value={`${dashboardData.lowStockCount} Produk`}
          note="Stok aktif 1 sampai 3"
          icon="⚠️"
        />
      </section>

      {!userCanViewFinance && (
        <section className="mb-8 rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5">
          <div className="flex gap-3">
            <div className="text-2xl">🔒</div>
            <div>
              <h3 className="font-bold text-amber-900">
                Akses nominal keuangan dibatasi
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                Role {currentUserRoleLabel} hanya dapat melihat data operasional
                seperti total item terjual, jumlah transaksi, dan stok. Nominal
                penjualan, HPP, laba, dan settlement hanya untuk owner/admin.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TransactionTable
            transactions={dashboardData.transactions}
            canViewFinance={userCanViewFinance}
            onViewAll={() => navigate("/riwayat-penjualan")}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-blue-600 text-white rounded-3xl shadow-sm p-6">
            <p className="text-blue-100 text-sm">Quick Action</p>
            <h3 className="text-2xl font-bold mt-2 mb-6">
              Mulai transaksi baru
            </h3>

            <button
              type="button"
              onClick={() => navigate("/pos-kasir")}
              className="w-full bg-white text-blue-600 font-semibold py-3 rounded-2xl hover:bg-blue-50 transition"
            >
              Buka Kasir
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold mb-2">Reminder Stok</h3>
            <p className="text-sm text-slate-500 mb-4">
              Ada {dashboardData.lowStockCount} produk aktif yang stoknya mulai
              menipis dan perlu dicek ulang.
            </p>

            <button
              type="button"
              onClick={() => navigate("/stok-barang")}
              className="w-full bg-slate-100 text-slate-700 font-semibold py-3 rounded-2xl hover:bg-slate-200 transition"
            >
              Cek Stok Barang
            </button>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}

export default Dashboard