import { useMemo, useState } from "react"
import MainLayout from "../layouts/MainLayout"
import { getTransactions } from "../utils/transactionStorage"

function Settlement() {
  const today = new Date().toISOString().slice(0, 10)
  const [selectedDate, setSelectedDate] = useState(today)

  const transactions = getTransactions()

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

  const isSameDate = (date, targetDate) => {
    if (!date || !targetDate) return false
    return new Date(date).toISOString().slice(0, 10) === targetDate
  }

  const settlementData = useMemo(() => {
    const dailyTransactions = transactions.filter((transaction) => {
      return isSameDate(transaction.date, selectedDate)
    })

    const paidTransactions = dailyTransactions.filter((transaction) => {
      return transaction.status !== "Void"
    })

    const voidTransactions = dailyTransactions.filter((transaction) => {
      return transaction.status === "Void"
    })

    const totalSales = paidTransactions.reduce((sum, transaction) => {
      return sum + Number(transaction.total || 0)
    }, 0)

    const totalDiscount = paidTransactions.reduce((sum, transaction) => {
      return (
        sum +
        Number(transaction.totalDiscount || 0) +
        Number(transaction.memberDiscount || 0)
      )
    }, 0)

    const totalItems = paidTransactions.reduce((sum, transaction) => {
      const itemQty =
        transaction.items?.reduce((itemSum, item) => {
          return itemSum + Number(item.qty || 0)
        }, 0) || 0

      return sum + itemQty
    }, 0)

    const paymentSummary = paidTransactions.reduce(
      (summary, transaction) => {
        const method = transaction.paymentMethod || "Lainnya"
        const total = Number(transaction.total || 0)

        return {
          ...summary,
          [method]: Number(summary[method] || 0) + total,
        }
      },
      {
        Cash: 0,
        QRIS: 0,
        Transfer: 0,
        Debit: 0,
      }
    )

    return {
      dailyTransactions,
      paidTransactions,
      voidTransactions,
      totalSales,
      totalDiscount,
      totalItems,
      paymentSummary,
    }
  }, [transactions, selectedDate])

  const {
    dailyTransactions,
    paidTransactions,
    voidTransactions,
    totalSales,
    totalDiscount,
    totalItems,
    paymentSummary,
  } = settlementData

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50 px-4 py-5 md:px-6">
        <div className="mx-auto w-full max-w-[1500px]">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                RAD Sport POS
              </p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">
                Settlement
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Rekap transaksi harian berdasarkan data penjualan yang sudah
                tersimpan.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-400">
                Tanggal Rekap
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Total Penjualan
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {formatRupiah(totalSales)}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Tidak termasuk transaksi Void
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Transaksi Lunas
              </p>
              <p className="mt-2 text-2xl font-black text-emerald-600">
                {paidTransactions.length}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Transaksi berhasil
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Transaksi Void
              </p>
              <p className="mt-2 text-2xl font-black text-red-600">
                {voidTransactions.length}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Transaksi dibatalkan
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Item Terjual
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {totalItems}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Total qty dari transaksi lunas
              </p>
            </div>
          </div>

          <div className="mb-5 grid gap-4 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-black text-slate-900">
                  Rekap Metode Pembayaran
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Total penjualan lunas berdasarkan metode pembayaran.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {["Cash", "QRIS", "Transfer", "Debit"].map((method) => (
                  <div
                    key={method}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      {method}
                    </p>
                    <p className="mt-2 text-xl font-black text-slate-900">
                      {formatRupiah(paymentSummary[method])}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-black text-slate-900">
                  Ringkasan Diskon
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Total potongan dari transaksi lunas.
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-5">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-600">
                  Total Diskon
                </p>
                <p className="mt-2 text-2xl font-black text-emerald-700">
                  {formatRupiah(totalDiscount)}
                </p>
                <p className="mt-1 text-xs font-semibold text-emerald-600">
                  Termasuk diskon item dan diskon member
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-100 px-5 py-4">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Transaksi Tanggal Ini
                  </h2>
                  <p className="text-sm font-medium text-slate-500">
                    Menampilkan {dailyTransactions.length} transaksi pada
                    tanggal terpilih.
                  </p>
                </div>
              </div>
            </div>

            {dailyTransactions.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm font-bold text-slate-700">
                  Belum ada transaksi di tanggal ini.
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Coba pilih tanggal lain.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {dailyTransactions.map((transaction, index) => {
                  const isVoid = transaction.status === "Void"

                  return (
                    <div
                      key={transaction.id || transaction.invoiceNumber || index}
                      className={`grid gap-4 px-5 py-4 text-sm xl:grid-cols-[1.5fr_1.1fr_1fr_0.8fr_0.8fr] xl:items-center ${
                        isVoid ? "bg-red-50/50" : "bg-white"
                      }`}
                    >
                      <div>
                        <p
                          className={`font-black ${
                            isVoid
                              ? "text-slate-400 line-through"
                              : "text-slate-900"
                          }`}
                        >
                          {transaction.invoiceNumber}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                              isVoid
                                ? "bg-red-100 text-red-600"
                                : "bg-emerald-50 text-emerald-600"
                            }`}
                          >
                            {transaction.status || "Lunas"}
                          </span>

                          {transaction.stockRestored && (
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase text-blue-600">
                              Stok kembali
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="font-semibold text-slate-600">
                        {formatDateTime(transaction.date)}
                      </div>

                      <div
                        className={`font-black ${
                          isVoid
                            ? "text-slate-400 line-through"
                            : "text-slate-900"
                        }`}
                      >
                        {formatRupiah(transaction.total)}
                      </div>

                      <div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                          {transaction.paymentMethod || "-"}
                        </span>
                      </div>

                      <div className="font-bold text-slate-600">
                        {transaction.items?.length || 0} item
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Settlement