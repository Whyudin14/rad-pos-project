function PrintReceipt({ transaction }) {
  if (!transaction) return null

  const formatRupiah = (number) => {
    return `Rp ${Number(number || 0).toLocaleString("id-ID")}`
  }

  const totalQty = transaction.items.reduce((sum, item) => sum + item.qty, 0)

  const totalSaved =
    Number(transaction.totalDiscount || 0) +
    Number(transaction.memberDiscount || 0)

  return (
    <div className="print-receipt">
      <div className="receipt-header">
        <div className="receipt-logo">LOGO</div>
        <h2>RAD SPORT KARAWANG</h2>
        <p>Jl. Galuh Mas Raya Sebelum Bundaran RSUD Karawang</p>
        <p>Teluk Jambe Timur, Karawang 41361</p>
        <p>Telp/WA: 0858-1006-9982</p>
      </div>

      <div className="line" />

      <div className="receipt-info">
        <div>
          <p>No. {transaction.invoiceNumber}</p>
          <p>{transaction.date}</p>
        </div>

        <div className="right">
          <p>Kasir : ADMIN 1</p>
          <p>{transaction.paymentMethod}</p>
        </div>
      </div>

      <div className="line" />

      <div className="receipt-items">
        {transaction.items.map((item, index) => {
          const hasDiscount = Number(item.discountPercent || 0) > 0

          const itemPriceAfterDiscount =
            Number(item.priceAfterDiscount || 0) > 0
              ? item.priceAfterDiscount
              : Number(item.customPrice || item.originalPrice || 0)

          return (
            <div key={`${item.id}-${index}`} className="receipt-item">
              <p className="item-name">
                {index + 1}. {item.name}
              </p>

              <div className="row">
                <span>
                    {item.qty} x {formatRupiah(item.customPrice)}
                </span>
                <span>{formatRupiah(Number(item.customPrice || 0) * Number(item.qty || 0))}</span>
                </div>

                {hasDiscount && (
                <>
                    <div className="row small">
                    <span>Diskon ({item.discountPercent}%)</span>
                    <span>
                        - {formatRupiah(
                        ((Number(item.customPrice || 0) * Number(item.discountPercent || 0)) /
                            100) *
                            Number(item.qty || 0)
                        )}
                    </span>
                    </div>
                </>
                )}

              {hasDiscount && (
                <div className="row small">
                  <span>Total Item</span>
                  <span>{formatRupiah(itemPriceAfterDiscount)}</span>
                </div>
              )}

              {item.note && <p className="note">Catatan: {item.note}</p>}
            </div>
          )
        })}
      </div>

      <div className="line" />

      <div className="summary">
        <div className="row">
          <span>Total QTY</span>
          <span>{totalQty}</span>
        </div>

        <div className="row">
          <span>Sub Total</span>
          <span>{formatRupiah(transaction.subtotalBeforeMember)}</span>
        </div>

        {Number(transaction.totalDiscount || 0) > 0 && (
          <div className="row">
            <span>Diskon Reguler</span>
            <span>- {formatRupiah(transaction.totalDiscount)}</span>
          </div>
        )}

        {Number(transaction.memberDiscount || 0) > 0 && (
          <div className="row">
            <span>Diskon Member</span>
            <span>- {formatRupiah(transaction.memberDiscount)}</span>
          </div>
        )}
      </div>

      <div className="line" />

      <div className="payment">
        <div className="row total">
          <span>Total</span>
          <span>{formatRupiah(transaction.total)}</span>
        </div>

        <div className="row">
          <span>Bayar ({transaction.paymentMethod})</span>
          <span>{formatRupiah(transaction.paidAmount)}</span>
        </div>

        <div className="row">
          <span>Kembali</span>
          <span>{formatRupiah(transaction.change)}</span>
        </div>

        {totalSaved > 0 && (
          <div className="row">
            <span>Anda Hemat</span>
            <span>{formatRupiah(totalSaved)}</span>
          </div>
        )}
      </div>

      <div className="line" />

      <div className="receipt-footer">
        <p>You are happy i'm happy 🙌</p>
        <p>Terima kasih atas kunjungannya!</p>
      </div>
    </div>
  )
}

export default PrintReceipt