function ReceiptModal({ isOpen, onClose, transaction }) {
  if (!isOpen || !transaction) return null

  const formatRupiah = (number) => {
    return `Rp ${Number(number || 0).toLocaleString("id-ID")}`
  }

  const formatNumber = (number) => {
    return Number(number || 0).toLocaleString("id-ID")
  }

  const totalQty = transaction.items.reduce((total, item) => total + item.qty, 0)

  const totalSaved =
    Number(transaction.totalDiscount || 0) +
    Number(transaction.memberDiscount || 0)

  const isCompact = transaction.items.length >= 2
  const isWide = transaction.items.length >= 3

  const separator = (
    <div
      className={`border-t border-dashed border-slate-300 ${
        isCompact ? "my-2.5" : "my-3"
      }`}
    />
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3">
      <div
        className={`w-full rounded-[26px] bg-white p-4 shadow-2xl ${
          isWide ? "max-w-[680px]" : "max-w-[520px]"
        }`}
      >
        <div className="rounded-[22px] bg-white px-5 py-3">
          {/* Header Store */}
          <div className="text-center">
            <div
              className={`mx-auto flex items-center justify-center rounded-2xl bg-slate-900 text-white ${
                isCompact ? "mb-2 h-11 w-11 text-lg" : "mb-2.5 h-12 w-12 text-xl"
              }`}
            >
              🏬
            </div>

            <h2
              className={`font-black tracking-wide text-slate-950 ${
                isCompact ? "text-base" : "text-lg"
              }`}
            >
              RAD SPORT KARAWANG
            </h2>

            <div className="mt-0.5 text-xs font-medium leading-tight text-slate-500">
              <p>Jl. Galuh Mas Raya Sebelum Bundaran RSUD Karawang,</p>
              <p>Teluk Jambe Timur, Karawang 41361</p>
            </div>

            <p className="text-xs font-medium text-slate-500">
              187303620260523193620
            </p>
          </div>

          {separator}

          {/* Transaction Info */}
          <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
            <div className="space-y-0.5">
              <p>No. {transaction.invoiceNumber}</p>
              <p>{transaction.date}</p>
            </div>

            <div className="space-y-0.5 text-right">
              <p>Kasir : ADMIN 1</p>
              <p>{transaction.paymentMethod}</p>
            </div>
          </div>

          {separator}

          {/* Items */}
          <div
            className={
              isWide
                ? "grid grid-cols-2 gap-x-5 gap-y-2.5"
                : isCompact
                ? "space-y-2"
                : "space-y-2.5"
            }
          >
            {transaction.items.map((item, index) => {
              const itemPrice =
                Number(item.priceAfterDiscount || 0) > 0
                  ? item.priceAfterDiscount
                  : Number(item.customPrice || item.originalPrice || 0)

              const hasDiscount = Number(item.discountPercent || 0) > 0

              return (
                <div
                  key={`${item.id}-${index}`}
                  className={`text-sm ${
                    isWide ? "rounded-xl bg-slate-50 px-3 py-2" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-bold leading-tight text-slate-900 ${
                          isCompact ? "text-sm" : "text-[15px]"
                        }`}
                      >
                        {index + 1}. {item.name}
                      </p>

                      <p className="mt-0.5 text-xs font-semibold leading-tight text-slate-600">
                        {item.qty} x {formatRupiah(item.customPrice)}
                      </p>

                      {hasDiscount && (
                        <p className="mt-0.5 text-xs font-bold leading-tight text-emerald-600">
                          Diskon ({formatNumber(item.discountPercent)}%) →{" "}
                          {formatRupiah(itemPrice)}
                        </p>
                      )}

                      {item.note && (
                        <p className="mt-0.5 text-xs italic leading-tight text-slate-400">
                          Catatan: {item.note}
                        </p>
                      )}
                    </div>

                    <p
                      className={`shrink-0 font-bold text-slate-900 ${
                        isCompact ? "text-sm" : "text-[15px]"
                      }`}
                    >
                      {formatRupiah(item.total)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {separator}

          {/* Summary + Payment */}
          <div className={isWide ? "grid grid-cols-2 gap-5" : "space-y-0"}>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-600">Total QTY</span>
                <span className="font-bold text-slate-900">{totalQty}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-semibold text-slate-600">Sub Total</span>
                <span className="font-bold text-slate-900">
                  {formatRupiah(transaction.subtotalBeforeMember)}
                </span>
              </div>

              {Number(transaction.totalDiscount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="font-semibold">Diskon Reguler</span>
                  <span className="font-bold">
                    - {formatRupiah(transaction.totalDiscount)}
                  </span>
                </div>
              )}

              {Number(transaction.memberDiscount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="font-semibold">Diskon Member</span>
                  <span className="font-bold">
                    - {formatRupiah(transaction.memberDiscount)}
                  </span>
                </div>
              )}
            </div>

            {!isWide && separator}

            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900">Total</span>
                <span className="text-lg font-black text-slate-950">
                  {formatRupiah(transaction.total)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-semibold text-slate-600">
                  Bayar ({transaction.paymentMethod})
                </span>
                <span className="font-bold text-slate-900">
                  {formatRupiah(transaction.paidAmount)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-semibold text-slate-600">Kembali</span>
                <span className="font-bold text-slate-900">
                  {formatRupiah(transaction.change)}
                </span>
              </div>

              {totalSaved > 0 && (
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600">Anda Hemat</span>
                  <span className="font-bold text-emerald-600">
                    {formatRupiah(totalSaved)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {separator}

          {/* Footer Note */}
          <div className="text-center">
            <p className="text-sm font-bold leading-tight text-slate-700">
              You are happy i'm happy 🙌
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">
              Terima kasih atas kunjungannya!
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-3 w-full rounded-2xl bg-blue-600 py-3 text-sm font-black text-white transition hover:bg-blue-700"
        >
          Selesai
        </button>
      </div>
    </div>
  )
}

export default ReceiptModal