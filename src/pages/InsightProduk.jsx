import { useMemo, useState } from "react"

import MainLayout from "../layouts/MainLayout"
import StatCard from "../components/StatCard"
import { getTransactions } from "../utils/transactionStorage"
import {
  canViewFinancialData,
  getCurrentUserRole,
  getCurrentUserRoleLabel,
} from "../utils/accessControl"

const PRODUCT_KEY = "radProducts"

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

const getProducts = () => {
  try {
    const data = localStorage.getItem(PRODUCT_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Gagal membaca produk:", error)
    return []
  }
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

const getItemQty = (item) => {
  return safeNumber(item.qty || item.quantity || 0)
}

const getItemPrice = (item) => {
  return safeNumber(
    item.finalPrice ||
      item.priceAfterDiscount ||
      item.sellingPrice ||
      item.customPrice ||
      item.price ||
      item.hargaJual ||
      0
  )
}

const getItemTotal = (item) => {
  const explicitTotal = safeNumber(item.total || item.subtotal || item.itemTotal)

  if (explicitTotal > 0) return explicitTotal

  return getItemPrice(item) * getItemQty(item)
}

const getProductIdFromItem = (item) => {
  return item.productId || item.id || item.productID || "-"
}

const getProductNameFromItem = (item) => {
  return item.productName || item.name || item.product || "-"
}

const getBrandFromItem = (item) => {
  return item.brand || item.merk || "-"
}

const getVariantTextFromItem = (item) => {
  return item.variantValue || item.ukuran || item.size || item.value || "-"
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
  customStartDate,
  customEndDate,
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

  if (reportMode === "custom") {
    const startDate = parseInputDate(customStartDate)
    const endDate = parseInputDate(customEndDate, true)

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
  customStartDate,
  customEndDate,
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

  if (reportMode === "custom") {
    if (customStartDate && customEndDate) {
      return `${formatDate(`${customStartDate}T00:00:00`)} - ${formatDate(
        `${customEndDate}T00:00:00`
      )}`
    }

    if (customStartDate) {
      return `Mulai ${formatDate(`${customStartDate}T00:00:00`)}`
    }

    if (customEndDate) {
      return `Sampai ${formatDate(`${customEndDate}T00:00:00`)}`
    }

    return "Semua Tanggal"
  }

  return "Periode"
}

const getProductStock = (product) => {
  const variants = Array.isArray(product.variants) ? product.variants : []

  if (variants.length > 0) {
    return variants.reduce((sum, variant) => {
      return sum + safeNumber(variant.stock || variant.stok || 0)
    }, 0)
  }

  return safeNumber(product.stock || product.stok || 0)
}

const getProductStockInDate = (product) => {
  return product.stockInDate || ""
}

const getProductAgeStatus = (product) => {
  return product.stockAgeStatus || "unknown"
}

const getProductAgeNote = (product) => {
  return product.stockAgeNote || ""
}

const getProductAgeDays = (product) => {
  const stockInDate = getProductStockInDate(product)

  if (!stockInDate) return null

  const date = new Date(stockInDate)

  if (Number.isNaN(date.getTime())) return null

  const today = new Date()
  const diffTime = today.getTime() - date.getTime()

  return Math.max(Math.floor(diffTime / (1000 * 60 * 60 * 24)), 0)
}

const getAgeStatusLabel = (status) => {
  const labels = {
    accurate: "Akurat",
    estimated: "Estimasi",
    unknown: "Tidak diketahui",
  }

  return labels[status] || "Tidak diketahui"
}

const getAgeDisplay = (row) => {
  if (row.ageStatus === "unknown" || row.ageDays === null) {
    return "Tidak diketahui"
  }

  if (row.ageStatus === "estimated") {
    return `±${row.ageDays} hari`
  }

  return `${row.ageDays} hari`
}

const getStockInDateDisplay = (row) => {
  if (!row.stockInDate) return "-"

  return formatDate(row.stockInDate)
}

const getProductKey = (product) => {
  return product.id || product.productId || product.sku || product.name || "-"
}

const getProductName = (product) => {
  return product.name || product.productName || product.namaProduk || "-"
}

const getProductBrand = (product) => {
  return product.brand || product.merk || "-"
}

const getProductCategory = (product) => {
  return product.category || product.kategori || product.categoryName || "-"
}

const buildSalesMap = (transactions) => {
  const salesMap = new Map()

  transactions.forEach((transaction) => {
    if (!Array.isArray(transaction.items)) return

    transaction.items.forEach((item) => {
      const productId = getProductIdFromItem(item)
      const productName = getProductNameFromItem(item)
      const brand = getBrandFromItem(item)
      const qty = getItemQty(item)
      const itemRevenue = getItemTotal(item)
      const variantText = getVariantTextFromItem(item)
      const transactionDate = getTransactionDate(transaction)

      const key = productId || productName

      if (!salesMap.has(key)) {
        salesMap.set(key, {
          productId,
          productName,
          brand,
          qtySold: 0,
          revenue: 0,
          transactionCount: 0,
          variants: new Set(),
          lastSoldAt: "",
        })
      }

      const current = salesMap.get(key)

      current.qtySold += qty
      current.revenue += itemRevenue
      current.transactionCount += 1

      if (variantText && variantText !== "-") {
        current.variants.add(variantText)
      }

      const currentLastSold = new Date(current.lastSoldAt)
      const newSoldDate = new Date(transactionDate)

      if (
        !current.lastSoldAt ||
        (!Number.isNaN(newSoldDate.getTime()) &&
          (Number.isNaN(currentLastSold.getTime()) ||
            newSoldDate > currentLastSold))
      ) {
        current.lastSoldAt = transactionDate
      }
    })
  })

  return salesMap
}

const getProductInsightRows = (products, salesMap) => {
  return products
    .filter((product) => product.isActive !== false)
    .map((product) => {
      const productKey = getProductKey(product)
      const productName = getProductName(product)
      const brand = getProductBrand(product)
      const category = getProductCategory(product)
      const stock = getProductStock(product)
      const ageDays = getProductAgeDays(product)
      const ageStatus = getProductAgeStatus(product)

      const salesData =
        salesMap.get(productKey) ||
        salesMap.get(product.id) ||
        salesMap.get(product.productId) ||
        salesMap.get(productName) ||
        {
          productId: productKey,
          productName,
          brand,
          qtySold: 0,
          revenue: 0,
          transactionCount: 0,
          variants: new Set(),
          lastSoldAt: "",
        }

      return {
        productId: productKey,
        productName,
        brand,
        category,
        stock,
        ageDays,
        ageStatus,
        ageStatusLabel: getAgeStatusLabel(ageStatus),
        ageNote: getProductAgeNote(product),
        stockInDate: getProductStockInDate(product),
        qtySold: safeNumber(salesData.qtySold),
        revenue: safeNumber(salesData.revenue),
        transactionCount: safeNumber(salesData.transactionCount),
        variantCount:
          salesData.variants instanceof Set ? salesData.variants.size : 0,
        lastSoldAt: salesData.lastSoldAt,
      }
    })
}

function InsightTable({
  title,
  description,
  rows = [],
  canViewFinance = true,
  emptyText = "Belum ada data",
}) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-400 mt-1">{description}</p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <p className="font-semibold text-slate-700">{emptyText}</p>
          <p className="text-sm text-slate-400 mt-1">
            Data akan muncul setelah ada transaksi dan data produk.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="pb-3 font-medium">Produk</th>
                <th className="pb-3 font-medium text-center">Stok</th>
                <th className="pb-3 font-medium text-center">Terjual</th>
                <th className="pb-3 font-medium text-center">Umur Barang</th>
                <th className="pb-3 font-medium">Terakhir Laku</th>
                <th className="pb-3 font-medium text-right">Omzet</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr
                  key={`${row.productId}-${row.productName}`}
                  className="border-b border-slate-100 last:border-0 align-top"
                >
                  <td className="py-4 pr-5">
                    <div className="max-w-md">
                      <p className="font-bold leading-snug text-slate-800">
                        {row.productName}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span>{row.brand}</span>
                        <span>•</span>
                        <span>{row.category}</span>
                        <span>•</span>
                        <span>
                          Tanggal masuk: {getStockInDateDisplay(row)}
                        </span>
                      </div>

                      {row.ageNote && (
                        <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
                          {row.ageNote}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="py-4 text-center">
                    <span className="inline-flex min-w-12 justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      {row.stock}
                    </span>
                  </td>

                  <td className="py-4 text-center">
                    <span className="inline-flex min-w-12 justify-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                      {row.qtySold}
                    </span>
                  </td>

                  <td className="py-4 text-center">
                    <div className="font-bold text-slate-700">
                      {getAgeDisplay(row)}
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-slate-400">
                      {row.ageStatusLabel}
                    </div>
                  </td>

                  <td className="py-4 text-slate-500">
                    {row.lastSoldAt ? formatDate(row.lastSoldAt) : "-"}
                  </td>

                  <td className="py-4 text-right font-bold text-blue-600">
                    {canViewFinance ? formatRupiah(row.revenue) : "Terkunci"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function InsightProduk() {
  const now = new Date()

  const [reportMode, setReportMode] = useState("month")
  const [selectedDate, setSelectedDate] = useState(getTodayInputValue())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [searchKeyword, setSearchKeyword] = useState("")

  const currentUserRole = getCurrentUserRole()
  const currentUserRoleLabel = getCurrentUserRoleLabel(currentUserRole)
  const userCanViewFinance = canViewFinancialData(currentUserRole)

  const insightData = useMemo(() => {
    const transactions = getTransactions()
    const products = getProducts()

    const validTransactions = transactions
      .filter((transaction) => !isVoidTransaction(transaction))
      .filter((transaction) => {
        return isInReportPeriod({
          transaction,
          reportMode,
          selectedDate,
          selectedMonth,
          selectedYear,
          customStartDate,
          customEndDate,
        })
      })

    const salesMap = buildSalesMap(validTransactions)
    const productRows = getProductInsightRows(products, salesMap)

    const keyword = searchKeyword.toLowerCase().trim()

    const filteredRows = productRows.filter((row) => {
      if (!keyword) return true

      return `${row.productName} ${row.brand} ${row.category}`
        .toLowerCase()
        .includes(keyword)
    })

    const topSellingProducts = [...filteredRows]
      .filter((row) => row.qtySold > 0)
      .sort((a, b) => b.qtySold - a.qtySold)
      .slice(0, 10)

    const slowMovingProducts = [...filteredRows]
      .filter((row) => row.stock > 0 && row.qtySold > 0 && row.qtySold <= 2)
      .sort((a, b) => {
        if (a.qtySold !== b.qtySold) return a.qtySold - b.qtySold
        return b.stock - a.stock
      })
      .slice(0, 10)

    const deadStockProducts = [...filteredRows]
      .filter((row) => row.stock > 0 && row.qtySold === 0)
      .sort((a, b) => {
        const ageA = a.ageDays ?? -1
        const ageB = b.ageDays ?? -1

        if (ageA !== ageB) return ageB - ageA

        return b.stock - a.stock
      })
      .slice(0, 10)

    const oldestProducts = [...filteredRows]
      .filter((row) => row.stock > 0)
      .sort((a, b) => {
        const ageA = a.ageDays ?? -1
        const ageB = b.ageDays ?? -1

        if (ageA !== ageB) return ageB - ageA

        return b.stock - a.stock
      })
      .slice(0, 10)

    const unknownAgeProducts = [...filteredRows]
      .filter((row) => row.stock > 0 && row.ageDays === null)
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 10)

    const totalQtySold = filteredRows.reduce((sum, row) => {
      return sum + row.qtySold
    }, 0)

    const totalRevenue = filteredRows.reduce((sum, row) => {
      return sum + row.revenue
    }, 0)

    return {
      rows: filteredRows,
      topSellingProducts,
      slowMovingProducts,
      deadStockProducts,
      oldestProducts,
      unknownAgeProducts,
      totalQtySold,
      totalRevenue,
      activeProductCount: filteredRows.length,
    }
  }, [
    reportMode,
    selectedDate,
    selectedMonth,
    selectedYear,
    customStartDate,
    customEndDate,
    searchKeyword,
  ])

  const reportLabel = getReportLabel({
    reportMode,
    selectedDate,
    selectedMonth,
    selectedYear,
    customStartDate,
    customEndDate,
  })

  return (
    <MainLayout>
      <header className="flex flex-col gap-5 mb-8 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600 mb-1">
            Insight Produk
          </p>
          <h2 className="text-3xl font-bold text-slate-900">
            Performa Barang
          </h2>
          <p className="text-slate-500 mt-1">
            Baca barang paling laku, slow moving, dead stock, dan umur barang.
          </p>
        </div>

        <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-400">Role Aktif</p>
          <p className="font-semibold text-sm">{currentUserRoleLabel}</p>
        </div>
      </header>

      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_auto] xl:items-start">
          <div>
            <label className="text-xs font-semibold text-slate-500">
              Cari Produk
            </label>
            <input
              type="text"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="Cari nama produk, brand, kategori..."
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500">
              Jenis Periode
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { key: "date", label: "Tanggal" },
                { key: "month", label: "Bulan" },
                { key: "year", label: "Tahun" },
                { key: "custom", label: "Custom" },
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

          {reportMode === "custom" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(event) => setCustomStartDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(event) => setCustomEndDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setCustomStartDate("")
                  setCustomEndDate("")
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
        <StatCard
          title="Total Item Terjual"
          value={`${insightData.totalQtySold} Item`}
          note={reportLabel}
          icon="👟"
        />

        <StatCard
          title="Produk Aktif Terbaca"
          value={insightData.activeProductCount}
          note="Produk aktif dari data barang"
          icon="📦"
        />

        <StatCard
          title="Dead Stock"
          value={`${insightData.deadStockProducts.length} Produk`}
          note="Stok ada, belum terjual"
          icon="🧊"
        />

        {userCanViewFinance ? (
          <StatCard
            title="Omzet Produk"
            value={formatRupiah(insightData.totalRevenue)}
            note={reportLabel}
            icon="💰"
          />
        ) : (
          <StatCard
            title="Omzet Produk"
            value="Terkunci"
            note="Hanya owner/admin"
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
                Akses nominal produk dibatasi
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                Role {currentUserRoleLabel} bisa melihat performa barang secara
                operasional seperti qty terjual, stok, dan umur barang. Nominal
                omzet produk hanya untuk owner/admin.
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="space-y-6">
        <InsightTable
          title="Barang Paling Laku"
          description={`Top produk berdasarkan qty terjual pada periode ${reportLabel}.`}
          rows={insightData.topSellingProducts}
          canViewFinance={userCanViewFinance}
          emptyText="Belum ada produk terjual di periode ini"
        />

        <InsightTable
          title="Slow Moving"
          description="Produk yang masih punya stok, sudah terjual, tapi pergerakannya rendah."
          rows={insightData.slowMovingProducts}
          canViewFinance={userCanViewFinance}
          emptyText="Belum ada produk slow moving"
        />

        <InsightTable
          title="Dead Stock"
          description="Produk yang masih punya stok tapi belum terjual di periode terpilih."
          rows={insightData.deadStockProducts}
          canViewFinance={userCanViewFinance}
          emptyText="Tidak ada dead stock di periode ini"
        />

        <InsightTable
          title="Umur Barang"
          description="Semua produk aktif yang masih punya stok, diurutkan dari umur paling lama berdasarkan tanggal masuk barang."
          rows={insightData.oldestProducts}
          canViewFinance={userCanViewFinance}
          emptyText="Belum ada data umur barang"
        />

        <InsightTable
          title="Umur Belum Diketahui"
          description="Produk aktif yang masih punya stok tapi belum punya tanggal masuk barang. Ini perlu dilengkapi supaya laporan umur barang lebih akurat."
          rows={insightData.unknownAgeProducts}
          canViewFinance={userCanViewFinance}
          emptyText="Semua produk stok aktif sudah punya data umur barang"
        />
      </div>
    </MainLayout>
  )
}

export default InsightProduk