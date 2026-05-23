const transactions = [
  {
    invoice: "TRX-001",
    product: "Sepatu Running Mills",
    time: "10:24 WIB",
    payment: "QRIS",
    total: "Rp 549.000",
  },
  {
    invoice: "TRX-002",
    product: "Kaos Kaki Sport",
    time: "11:05 WIB",
    payment: "Cash",
    total: "Rp 35.000",
  },
  {
    invoice: "TRX-003",
    product: "Jersey Training",
    time: "12:18 WIB",
    payment: "Debit",
    total: "Rp 179.000",
  },
]

function TransactionTable() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Transaksi Terbaru</h3>
          <p className="text-sm text-slate-400">Aktivitas penjualan hari ini</p>
        </div>

        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          Lihat semua
        </button>
      </div>

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
          {transactions.map((item) => (
            <tr key={item.invoice} className="border-b border-slate-100 last:border-0">
              <td className="py-4 font-medium text-slate-700">{item.invoice}</td>
              <td className="py-4 text-slate-600">{item.product}</td>
              <td className="py-4 text-slate-500">{item.time}</td>
              <td className="py-4">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  {item.payment}
                </span>
              </td>
              <td className="py-4 text-right font-bold text-blue-600">{item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TransactionTable