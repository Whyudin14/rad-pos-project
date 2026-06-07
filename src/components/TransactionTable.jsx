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

const formatTime = (value) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "-"
  }

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

function TransactionTable({
  transactions = [],
  canViewFinance = true,
  onViewAll,
}) {
  const latestTransactions = transactions.slice(0, 5)

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Transaksi Terbaru
          </h3>
          <p className="text-sm text-slate-400">
            Aktivitas penjualan berdasarkan periode terpilih
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Lihat semua
        </button>
      </div>

      {latestTransactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <p className="font-semibold text-slate-700">Belum ada transaksi</p>
          <p className="text-sm text-slate-400 mt-1">
            Transaksi yang selesai akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="pb-3 font-medium">Invoice</th>
                <th className="pb-3 font-medium">Produk</th>
                <th className="pb-3 font-medium">Waktu</th>
                <th className="pb-3 font-medium">Metode</th>
                <th className="pb-3 font-medium text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {latestTransactions.map((transaction) => {
                const invoice = getTransactionInvoice(transaction)
                const date = getTransactionDate(transaction)
                const payment = getTransactionPayment(transaction)
                const productText = getTransactionProductText(transaction)
                const total = getTransactionTotal(transaction)

                return (
                  <tr
                    key={transaction.id || invoice}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-4 font-medium text-slate-700">
                      {invoice}
                    </td>

                    <td className="py-4 text-slate-600">{productText}</td>

                    <td className="py-4 text-slate-500">
                      {formatTime(date)}
                    </td>

                    <td className="py-4">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                        {payment}
                      </span>
                    </td>

                    <td className="py-4 text-right font-bold text-blue-600">
                      {canViewFinance ? formatRupiah(total) : "Terkunci"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default TransactionTable