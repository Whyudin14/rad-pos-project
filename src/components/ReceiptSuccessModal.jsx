function ReceiptSuccessModal({
  isOpen,
  onClose,
  transaction,
  onPrintReceipt,
}) {
  if (!isOpen || !transaction) return null

  const formatRupiah = (number) => {
    return `Rp ${Number(number || 0).toLocaleString("id-ID")}`
  }

  const totalItems = transaction.items.reduce((sum, item) => sum + item.qty, 0)

  const totalDiscount =
    Number(transaction.totalDiscount || 0) +
    Number(transaction.memberDiscount || 0)

  const isCash = transaction.paymentMethod === "Cash"

  const actionItems = [
    {
      title: "Cetak Struk",
      desc: "Cetak struk transaksi untuk pelanggan",
      icon: "🧾",
      onClick: onPrintReceipt,
    },
    {
      title: "Kirim WhatsApp",
      desc: "Kirim struk digital ke pelanggan",
      icon: "💬",
      onClick: () => alert("Fitur kirim WhatsApp akan dibuat nanti."),
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[500px] overflow-hidden rounded-[24px] bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-b from-emerald-50 to-white px-6 pt-6 pb-4 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-3xl font-black text-white shadow-lg shadow-emerald-500/25">
            ✓
          </div>

          <h2 className="text-2xl font-black text-slate-900">
            Transaksi Berhasil
          </h2>

          <p className="mt-1 text-sm font-bold text-slate-400">
            {transaction.invoiceNumber}
          </p>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-6">
          {/* Payment Status / Change Box */}
          <div className="rounded-[14px] border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-bold text-emerald-700">
              {isCash ? "Kembalian" : "Status Pembayaran"}
            </p>

            <div className="mt-1 flex items-end justify-between gap-3">
              <h3 className="text-[26px] font-bold leading-none text-emerald-700">
                {isCash ? formatRupiah(transaction.change) : "Lunas"}
              </h3>

              <span className="rounded-[8px] bg-white px-3 py-1 text-xs font-bold text-emerald-700">
                {transaction.paymentMethod}
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-3 rounded-[14px] border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-black text-slate-800">Ringkasan</p>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">
                {totalItems} item
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-slate-500">Tanggal</span>
                <span className="text-right font-semibold text-slate-900">
                  {transaction.date}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Total Bayar</span>
                <span className="font-semibold text-slate-900">
                  {formatRupiah(transaction.total)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Diskon</span>
                <span className="font-semibold text-emerald-600">
                  - {formatRupiah(totalDiscount)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3 grid gap-3">
            {actionItems.map((item) => (
              <button
                key={item.title}
                onClick={item.onClick}
                className="flex items-center justify-between rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-lg">
                    {item.icon}
                  </div>

                  <div>
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <span className="text-2xl font-light text-slate-400">›</span>
              </button>
            ))}
          </div>

          {/* Finish Button */}
          <button
            onClick={onClose}
            className="mt-4 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReceiptSuccessModal