import { useEffect, useState } from "react"
import MainLayout from "../layouts/MainLayout"
import { getTransactions } from "../utils/transactionStorage"
import PrintReceipt from "../components/PrintReceipt"

function RiwayatTransaksi() {
  const [transactions, setTransactions] = useState([])
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [printTransaction, setPrintTransaction] = useState(null)

  useEffect(() => {
    const savedTransactions = getTransactions()
    setTransactions(savedTransactions)
  }, [])

  const formatRupiah = (number) => {
    return `Rp ${Number(number || 0).toLocaleString("id-ID")}`
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const splitProductNameAndColor = (rawName = "") => {
    const name = String(rawName || "").trim()

    if (!name.includes(" - ")) {
      return {
        displayName: name,
        color: "",
      }
    }

    const parts = name.split(" - ")
    const displayName = parts[0]?.trim() || name
    const color = parts.slice(1).join(" - ").trim()

    return {
      displayName,
      color,
    }
  }

  const getItemDisplayData = (item) => {
    const parsedProduct = splitProductNameAndColor(item.name)

    const productName =
      item.displayName ||
      item.productName ||
      parsedProduct.displayName ||
      item.name ||
      "-"

    const productColor =
      item.color || item.warna || item.productColor || parsedProduct.color || ""

    const variantValue =
      item.ukuran ||
      item.variantValue ||
      item.size ||
      item.value ||
      item.variant ||
      ""

    const sku = item.variantSku || item.sku || item.productSku || ""
    const barcode =
      item.variantBarcode || item.barcode || item.productBarcode || ""

    return {
      productName,
      productColor,
      variantValue,
      sku,
      barcode,
    }
  }

  const handlePrintReceipt = (transaction) => {
    setSelectedTransaction(null)
    setPrintTransaction(transaction)

    setTimeout(() => {
      window.print()
    }, 300)
  }

  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintTransaction(null)
    }

    window.addEventListener("afterprint", handleAfterPrint)

    return () => {
      window.removeEventListener("afterprint", handleAfterPrint)
    }
  }, [])

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="no-print">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Riwayat Transaksi
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Daftar transaksi yang tersimpan sementara di localStorage.
              </p>
            </div>

            <div className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
              Total transaksi:{" "}
              <span className="font-bold text-slate-900">
                {transactions.length}
              </span>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-700">
                Belum ada transaksi.
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Transaksi akan muncul setelah pembayaran berhasil.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="hidden grid-cols-6 border-b border-slate-200 bg-slate-100 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 md:grid">
                <div>Invoice</div>
                <div>Tanggal</div>
                <div>Total</div>
                <div>Metode</div>
                <div>Item</div>
                <div className="text-right">Aksi</div>
              </div>

              <div className="divide-y divide-slate-100">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="grid gap-3 px-4 py-4 text-sm md:grid-cols-6 md:items-center"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        {transaction.invoiceNumber}
                      </p>
                      <p className="mt-1 text-xs text-slate-400 md:hidden">
                        {formatDate(transaction.date)}
                      </p>
                    </div>

                    <div className="hidden text-slate-600 md:block">
                      {formatDate(transaction.date)}
                    </div>

                    <div className="font-bold text-slate-900">
                      {formatRupiah(transaction.total)}
                    </div>

                    <div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {transaction.paymentMethod}
                      </span>
                    </div>

                    <div className="text-slate-600">
                      {transaction.totalItems || transaction.items?.length || 0}{" "}
                      item
                    </div>

                    <div className="flex justify-start gap-2 md:justify-end">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        Detail
                      </button>

                      <button
                        onClick={() => handlePrintReceipt(transaction)}
                        className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                      >
                        Cetak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTransaction && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Detail Transaksi
                    </h2>
                    <p className="text-sm text-slate-500">
                      {selectedTransaction.invoiceNumber}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600 hover:bg-slate-200"
                  >
                    X
                  </button>
                </div>

                <div className="mb-4 rounded-xl bg-slate-50 p-4 text-sm">
                  <div className="flex justify-between gap-4 py-1">
                    <span className="text-slate-500">Tanggal</span>
                    <span className="text-right font-semibold text-slate-900">
                      {formatDate(selectedTransaction.date)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 py-1">
                    <span className="text-slate-500">Metode</span>
                    <span className="font-semibold text-slate-900">
                      {selectedTransaction.paymentMethod}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 py-1">
                    <span className="text-slate-500">Status</span>
                    <span className="font-bold text-green-600">
                      {selectedTransaction.status || "Lunas"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedTransaction.items?.map((item, index) => {
                    const price = Number(
                      item.customPrice || item.price || item.harga || 0
                    )
                    const qty = Number(item.qty || 0)
                    const discount = Number(
                      item.discountPercent || item.discount || 0
                    )

                    const normalTotal = price * qty
                    const discountAmount = normalTotal * (discount / 100)
                    const finalTotal = normalTotal - discountAmount

                    const {
                      productName,
                      productColor,
                      variantValue,
                      sku,
                      barcode,
                    } = getItemDisplayData(item)

                    return (
                      <div
                        key={`${item.cartId || item.id || index}-${index}`}
                        className="rounded-xl border border-slate-200 p-3"
                      >
                        <div className="flex justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p
                              title={item.name}
                              className="line-clamp-2 font-bold uppercase leading-snug text-slate-900"
                            >
                              {productName}
                            </p>

                            {productColor && (
                              <p
                                title={productColor}
                                className="mt-0.5 line-clamp-2 text-xs font-black uppercase leading-tight text-blue-600"
                              >
                                {productColor}
                              </p>
                            )}

                            {variantValue && (
                              <p className="mt-1 w-fit rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-black text-emerald-700">
                                Ukuran: {variantValue}
                              </p>
                            )}

                            {(sku || barcode) && (
                              <p className="mt-1 line-clamp-1 text-[11px] font-medium text-slate-400">
                                {sku && `SKU: ${sku}`}
                                {sku && barcode && " • "}
                                {barcode && `Barcode: ${barcode}`}
                              </p>
                            )}

                            <p className="mt-1 text-xs text-slate-500">
                              {qty} x {formatRupiah(price)}
                            </p>

                            {item.note && (
                              <p className="mt-1 text-xs text-slate-400">
                                Catatan: {item.note}
                              </p>
                            )}
                          </div>

                          <p className="shrink-0 text-right font-bold text-slate-900">
                            {formatRupiah(finalTotal)}
                          </p>
                        </div>

                        {discount > 0 && (
                          <p className="mt-2 text-xs font-semibold text-red-500">
                            Diskon {discount}% - {formatRupiah(discountAmount)}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Diskon Produk</span>
                    <span>
                      - {formatRupiah(selectedTransaction.totalDiscount)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Diskon Member</span>
                    <span>
                      - {formatRupiah(selectedTransaction.memberDiscount)}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold">
                    <span>Total</span>
                    <span>{formatRupiah(selectedTransaction.total)}</span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handlePrintReceipt(selectedTransaction)}
                    className="rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800"
                  >
                    Cetak Ulang
                  </button>

                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {printTransaction && (
          <div className="print-only">
            <div className="print-area">
              <PrintReceipt transaction={printTransaction} />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default RiwayatTransaksi