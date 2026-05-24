function PrintReceipt({ transaction }) {
  if (!transaction) return null

  const formatRupiah = (number) => {
    return `Rp ${Number(number || 0).toLocaleString("id-ID")}`
  }

  const formatDate = (date) => {
    if (!date) return "-"

    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const items = transaction.items || []

  const totalQty = items.reduce((sum, item) => {
    return sum + Number(item.qty || 0)
  }, 0)

  const totalSaved =
    Number(transaction.totalDiscount || 0) +
    Number(transaction.memberDiscount || 0)

  const getItemPrice = (item) => {
    return Number(item.customPrice || item.price || item.originalPrice || 0)
  }

  const getItemDiscountPercent = (item) => {
    return Number(item.discountPercent || item.discount || 0)
  }

  const getItemNormalTotal = (item) => {
    const price = getItemPrice(item)
    const qty = Number(item.qty || 0)

    return price * qty
  }

  const getItemDiscountAmount = (item) => {
    const normalTotal = getItemNormalTotal(item)
    const discountPercent = getItemDiscountPercent(item)

    return normalTotal * (discountPercent / 100)
  }

  const getItemFinalTotal = (item) => {
    const normalTotal = getItemNormalTotal(item)
    const discountAmount = getItemDiscountAmount(item)

    return normalTotal - discountAmount
  }

  const subtotalBeforeMember =
    Number(transaction.subtotalBeforeMember || 0) ||
    items.reduce((sum, item) => sum + getItemNormalTotal(item), 0)

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
          <p>No. {transaction.invoiceNumber || "-"}</p>
          <p>{formatDate(transaction.date)}</p>
        </div>

        <div className="right">
          <p>Kasir : ADMIN 1</p>
          <p>{transaction.paymentMethod || "-"}</p>
        </div>
      </div>

      <div className="line" />

      <div className="receipt-items">
        {items.map((item, index) => {
          const price = getItemPrice(item)
          const qty = Number(item.qty || 0)
          const discountPercent = getItemDiscountPercent(item)

          const normalTotal = getItemNormalTotal(item)
          const discountAmount = getItemDiscountAmount(item)
          const finalTotal = getItemFinalTotal(item)

          const hasDiscount = discountPercent > 0

          return (
            <div key={`${item.id}-${index}`} className="receipt-item">
              <p className="item-name">
                {index + 1}. {item.name}
              </p>

              <div className="row">
                <span>
                  {qty} x {formatRupiah(price)}
                </span>
                <span>{formatRupiah(normalTotal)}</span>
              </div>

              {hasDiscount && (
                <>
                  <div className="row small">
                    <span>Diskon ({discountPercent}%)</span>
                    <span>- {formatRupiah(discountAmount)}</span>
                  </div>

                  <div className="row small">
                    <span>Total Item</span>
                    <span>{formatRupiah(finalTotal)}</span>
                  </div>
                </>
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
          <span>{formatRupiah(subtotalBeforeMember)}</span>
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
          <span>Bayar ({transaction.paymentMethod || "-"})</span>
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