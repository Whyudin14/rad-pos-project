import { useState } from "react"

function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  total,
  totalDiscount,
  memberDiscount,
  isMember,
  onFinishTransaction,
}) {
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [paidAmount, setPaidAmount] = useState("")

  if (!isOpen) return null

  const numericPaid =
    paymentMethod === "Cash" ? Number(paidAmount || 0) : total

  const change = numericPaid - total
  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0)
  const subtotalBeforeMember = total + Number(memberDiscount || 0)

  const formatRupiah = (number) => {
    return `Rp ${Number(number || 0).toLocaleString("id-ID")}`
  }

  const roundedTotal = Math.ceil(total / 10000) * 10000

  const quickCashOptions = [
    total,
    roundedTotal,
    roundedTotal + 50000,
    roundedTotal + 100000,
  ].filter((value, index, array) => array.indexOf(value) === index)

  const isCashNotEnough = paymentMethod === "Cash" && numericPaid < total
  const displayChange = change > 0 ? change : 0

  const handleFinishTransaction = () => {
    if (isCashNotEnough) {
      alert("Uang bayar kurang dari total belanja")
      return
    }

    const transaction = {
      invoiceNumber: `TRX-${Date.now()}`,
      date: new Date().toLocaleString("id-ID"),
      items: cartItems.map((item) => {
        const customPrice = Number(item.customPrice || 0)
        const discountPercent = Number(item.discountPercent || 0)

        const priceAfterDiscount =
          customPrice - (customPrice * discountPercent) / 100

        return {
          id: item.id,
          name: item.name,
          category: item.category,
          qty: item.qty,
          originalPrice: item.price,
          customPrice,
          discountPercent,
          priceAfterDiscount,
          note: item.note,
          total: priceAfterDiscount * item.qty,
        }
      }),
      subtotalBeforeMember,
      total,
      totalDiscount,
      memberDiscount: Number(memberDiscount || 0),
      isMember,
      paymentMethod,
      paidAmount: numericPaid,
      change: displayChange,
    }

    onFinishTransaction(transaction)
    setPaidAmount("")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="flex h-auto max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[26px] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-3.5">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-blue-600">
              Checkout
            </p>
            <h2 className="mt-0.5 text-2xl font-black leading-tight text-slate-900">
              Pembayaran
            </h2>
            <p className="mt-0.5 text-sm font-semibold text-slate-400">
              {cartItems.length} jenis produk • {totalItems} item
            </p>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-600 transition hover:bg-slate-200"
          >
            ← Kembali
          </button>
        </div>

        {/* Content */}
        <div className="grid flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[1.35fr_0.85fr]">
          {/* LEFT */}
          <div className="space-y-3 overflow-hidden">
            {/* Total Box */}
            <div className="rounded-[20px] bg-slate-950 p-4 text-white">
              <p className="text-xs font-semibold text-slate-300">
                Total Bayar
              </p>

              <h3 className="mt-0.5 text-3xl font-black tracking-tight">
                {formatRupiah(total)}
              </h3>

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl bg-white/10 px-3 py-2">
                  <p className="text-slate-400">Subtotal</p>
                  <p className="mt-0.5 font-black text-white">
                    {formatRupiah(subtotalBeforeMember)}
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 px-3 py-2">
                  <p className="text-slate-400">Diskon</p>
                  <p className="mt-0.5 font-black text-emerald-300">
                    {formatRupiah(totalDiscount)}
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 px-3 py-2">
                  <p className="text-slate-400">Member</p>
                  <p className="mt-0.5 font-black text-emerald-300">
                    {formatRupiah(memberDiscount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="mb-1.5 block text-sm font-black text-slate-700">
                Metode Pembayaran
              </label>

              <div className="grid grid-cols-4 gap-2">
                {["Cash", "QRIS", "Transfer", "Debit"].map((method) => {
                  const isActive = paymentMethod === method

                  return (
                    <button
                      key={method}
                      onClick={() => {
                        setPaymentMethod(method)
                        setPaidAmount("")
                      }}
                      className={`rounded-xl px-3 py-2.5 text-sm font-black transition ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {method}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Cash Section */}
            {paymentMethod === "Cash" && (
              <div className="rounded-[20px] bg-blue-50 p-3.5">
                <div className="mb-2.5">
                  <p className="text-sm font-black text-blue-700">
                    Pembayaran Cash
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-blue-600">
                    Masukkan nominal uang yang diterima.
                  </p>
                </div>

                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="Nominal cash"
                  className="h-11 w-full rounded-xl border border-blue-100 bg-white px-4 text-sm font-black text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400"
                />

                <div className="mt-2 grid grid-cols-4 gap-2">
                  {quickCashOptions.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setPaidAmount(String(amount))}
                      className="h-10 rounded-xl bg-white px-2 text-xs font-black leading-tight text-slate-700 transition hover:bg-blue-600 hover:text-white"
                    >
                      {amount === total ? "Uang Pas" : formatRupiah(amount)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Non Cash Section */}
            {paymentMethod !== "Cash" && (
              <div className="rounded-[20px] bg-blue-50 p-3.5">
                <p className="text-sm font-black text-blue-700">
                  Pembayaran {paymentMethod}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-blue-600">
                  Nominal otomatis dianggap pas sesuai total belanja.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="rounded-[20px] border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-black text-slate-800">
              Ringkasan Transaksi
            </p>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">
                  Total Item
                </span>
                <span className="font-black text-slate-900">
                  {totalItems} item
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Metode</span>
                <span className="font-black text-slate-900">
                  {paymentMethod}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Dibayar</span>
                <span className="font-black text-slate-900">
                  {formatRupiah(numericPaid)}
                </span>
              </div>

              <div className="border-t border-slate-100 pt-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">
                    Kembalian
                  </span>
                  <span
                    className={`text-base font-black ${
                      isCashNotEnough ? "text-red-500" : "text-emerald-600"
                    }`}
                  >
                    {isCashNotEnough
                      ? `- ${formatRupiah(Math.abs(change))}`
                      : formatRupiah(displayChange)}
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`mt-3 rounded-[16px] p-3 ${
                isCashNotEnough ? "bg-red-50" : "bg-emerald-50"
              }`}
            >
              <p
                className={`text-[10px] font-black uppercase tracking-wide ${
                  isCashNotEnough ? "text-red-600" : "text-emerald-700"
                }`}
              >
                Status
              </p>

              <p
                className={`mt-0.5 text-lg font-black ${
                  isCashNotEnough ? "text-red-700" : "text-emerald-700"
                }`}
              >
                {isCashNotEnough ? "Uang Kurang" : "Siap Diproses"}
              </p>

              <p className="mt-0.5 text-xs font-semibold text-slate-500">
                {isCashNotEnough
                  ? "Nominal cash belum mencukupi total belanja."
                  : "Transaksi bisa diselesaikan sekarang."}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 gap-3 border-t border-slate-200 bg-white p-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 py-3 text-sm font-black text-slate-500 transition hover:bg-slate-50"
          >
            Batal
          </button>

          <button
            onClick={handleFinishTransaction}
            disabled={isCashNotEnough}
            className="rounded-xl bg-blue-600 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            Bayar Sekarang
          </button>
        </div>
      </div>
    </div>
  )
}

export default CheckoutModal