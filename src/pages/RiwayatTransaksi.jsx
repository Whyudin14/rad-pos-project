import { useEffect, useState } from "react"
import MainLayout from "../layouts/MainLayout"
import {
  getTransactions,
  voidTransaction,
} from "../utils/transactionStorage"
import PrintReceipt from "../components/PrintReceipt"

function RiwayatTransaksi() {
  const [transactions, setTransactions] = useState([])
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [printTransaction, setPrintTransaction] = useState(null)

  const loadTransactions = () => {
    const savedTransactions = getTransactions()
    setTransactions(savedTransactions)
  }

  useEffect(() => {
    loadTransactions()
  }, [])

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

  const isVoidTransaction = (transaction) => {
    return transaction?.status === "Void"
  }

  const getTotalItems = (transaction) => {
    if (transaction?.totalItems) return transaction.totalItems

    return (
      transaction?.items?.reduce((total, item) => {
        return total + Number(item.qty || 0)
      }, 0) || 0
    )
  }

  const handleVoidTransaction = (transaction) => {
    if (!transaction) return

    if (isVoidTransaction(transaction)) {
      alert("Transaksi ini sudah di-void sebelumnya.")
      return
    }

    const reason = window.prompt(
      `Alasan void transaksi ${transaction.invoiceNumber}:`
    )

    if (!reason || !reason.trim()) {
      alert("Void dibatalkan. Alasan wajib diisi.")
      return
    }

    const isConfirmed = window.confirm(
      `Yakin mau void transaksi ${transaction.invoiceNumber}?\n\nTransaksi tidak akan dihapus, hanya ditandai sebagai Void dan stok akan dikembalikan.`
    )

    if (!isConfirmed) return

    const updatedTransactions = voidTransaction({
      transactionId: transaction.id || transaction.invoiceNumber,
      reason: reason.trim(),
      voidedBy: "Admin",
    })

    setTransactions(updatedTransactions)

    const updatedSelectedTransaction = updatedTransactions.find((item) => {
      return (
        item.id === transaction.id ||
        item.invoiceNumber === transaction.invoiceNumber
      )
    })

    setSelectedTransaction(updatedSelectedTransaction || null)
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
    if (isVoidTransaction(transaction)) {
      alert("Transaksi Void tidak bisa dicetak ulang.")
      return
    }

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
      <div className="min-h-screen bg-slate-50 px-4 py-5 md:px-6">
        <div className="no-print mx-auto w-full max-w-[1500px]">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                RAD Sport POS
              </p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">
                Riwayat Transaksi
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Pantau transaksi penjualan, cetak ulang struk, dan lakukan void
                transaksi jika terjadi kesalahan input.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Total Transaksi
                </p>
                <p className="mt-1 text-xl font-black text-slate-900">
                  {transactions.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Lunas
                </p>
                <p className="mt-1 text-xl font-black text-emerald-600">
                  {
                    transactions.filter(
                      (transaction) => !isVoidTransaction(transaction)
                    ).length
                  }
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Void
                </p>
                <p className="mt-1 text-xl font-black text-red-600">
                  {
                    transactions.filter((transaction) =>
                      isVoidTransaction(transaction)
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="rounded-[26px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <p className="text-sm font-bold text-slate-700">
                Belum ada transaksi.
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Transaksi akan muncul setelah pembayaran berhasil.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
              <div className="hidden grid-cols-[1.45fr_1.15fr_1fr_0.8fr_0.65fr_1.1fr] border-b border-slate-200 bg-slate-100 px-5 py-3 text-xs font-black uppercase tracking-wide text-slate-500 xl:grid">
                <div>Invoice</div>
                <div>Tanggal</div>
                <div>Total</div>
                <div>Metode</div>
                <div>Item</div>
                <div className="text-right">Aksi</div>
              </div>

              <div className="divide-y divide-slate-100">
                {transactions.map((transaction, index) => {
                  const isVoid = isVoidTransaction(transaction)

                  return (
                    <div
                      key={transaction.id || transaction.invoiceNumber || index}
                      className={`grid gap-4 px-5 py-4 text-sm xl:grid-cols-[1.45fr_1.15fr_1fr_0.8fr_0.65fr_1.1fr] xl:items-center ${
                        isVoid ? "bg-red-50/50" : "bg-white"
                      }`}
                    >
                      <div className="min-w-0">
                        <p
                          className={`break-words text-base font-black leading-snug ${
                            isVoid
                              ? "text-slate-400 line-through"
                              : "text-slate-900"
                          }`}
                        >
                          {transaction.invoiceNumber}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                              isVoid
                                ? "bg-red-100 text-red-600"
                                : "bg-emerald-50 text-emerald-600"
                            }`}
                          >
                            {transaction.status || "Lunas"}
                          </span>

                          {transaction.stockRestored && (
                            <span className="w-fit rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-600">
                              Stok kembali
                            </span>
                          )}

                          <p className="text-xs font-semibold text-slate-400 xl:hidden">
                            {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>

                      <div className="hidden font-semibold text-slate-600 xl:block">
                        {formatDate(transaction.date)}
                      </div>

                      <div
                        className={`text-base font-black ${
                          isVoid
                            ? "text-slate-400 line-through"
                            : "text-slate-900"
                        }`}
                      >
                        {formatRupiah(transaction.total)}
                      </div>

                      <div>
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                          {transaction.paymentMethod || "-"}
                        </span>
                      </div>

                      <div className="font-bold text-slate-600">
                        {getTotalItems(transaction)} item
                      </div>

                      <div className="flex justify-start gap-2 xl:justify-end">
                        <button
                          onClick={() => setSelectedTransaction(transaction)}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 transition hover:bg-slate-50"
                        >
                          Detail
                        </button>

                        <button
                          onClick={() => handlePrintReceipt(transaction)}
                          disabled={isVoid}
                          className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                        >
                          Cetak
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {selectedTransaction && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[26px] bg-white p-5 shadow-2xl">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                      Detail Transaksi
                    </p>
                    <h2 className="mt-1 text-xl font-black text-slate-900">
                      {selectedTransaction.invoiceNumber}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {formatDate(selectedTransaction.date)}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-black text-slate-600 hover:bg-slate-200"
                  >
                    X
                  </button>
                </div>

                <div
                  className={`mb-4 rounded-[20px] p-4 text-sm ${
                    isVoidTransaction(selectedTransaction)
                      ? "bg-red-50"
                      : "bg-slate-50"
                  }`}
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Metode
                      </p>
                      <p className="mt-1 font-black text-slate-900">
                        {selectedTransaction.paymentMethod || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Status
                      </p>
                      <p
                        className={`mt-1 font-black ${
                          isVoidTransaction(selectedTransaction)
                            ? "text-red-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {selectedTransaction.status || "Lunas"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Item
                      </p>
                      <p className="mt-1 font-black text-slate-900">
                        {getTotalItems(selectedTransaction)} item
                      </p>
                    </div>
                  </div>

                  {isVoidTransaction(selectedTransaction) && (
                    <div className="mt-4 rounded-2xl border border-red-100 bg-white/70 p-3">
                      <div className="mb-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-red-400">
                          Alasan Void
                        </p>
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm font-bold leading-relaxed text-red-600">
                          {selectedTransaction.voidReason || "-"}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Waktu Void
                          </p>
                          <p className="mt-1 font-bold text-slate-800">
                            {selectedTransaction.voidedAt
                              ? formatDate(selectedTransaction.voidedAt)
                              : "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Void Oleh
                          </p>
                          <p className="mt-1 font-bold text-slate-800">
                            {selectedTransaction.voidedBy || "-"}
                          </p>
                        </div>
                      </div>

                      {selectedTransaction.stockRestored && (
                        <p className="mt-3 w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">
                          Stok otomatis sudah dikembalikan
                        </p>
                      )}
                    </div>
                  )}
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
                        className={`rounded-[20px] border p-4 ${
                          isVoidTransaction(selectedTransaction)
                            ? "border-red-100 bg-red-50/40"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p
                              title={item.name}
                              className={`line-clamp-2 font-black uppercase leading-snug ${
                                isVoidTransaction(selectedTransaction)
                                  ? "text-slate-400 line-through"
                                  : "text-slate-900"
                              }`}
                            >
                              {productName}
                            </p>

                            {productColor && (
                              <p
                                title={productColor}
                                className="mt-1 line-clamp-2 text-xs font-black uppercase leading-tight text-blue-600"
                              >
                                {productColor}
                              </p>
                            )}

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {variantValue && (
                                <span className="w-fit rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                                  Ukuran: {variantValue}
                                </span>
                              )}

                              <span className="w-fit rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
                                Qty: {qty}
                              </span>
                            </div>

                            {(sku || barcode) && (
                              <p className="mt-2 break-words text-[11px] font-semibold text-slate-400">
                                {sku && `SKU: ${sku}`}
                                {sku && barcode && " • "}
                                {barcode && `Barcode: ${barcode}`}
                              </p>
                            )}

                            <p className="mt-2 text-xs font-semibold text-slate-500">
                              {qty} x {formatRupiah(price)}
                            </p>

                            {item.note && (
                              <p className="mt-1 text-xs text-slate-400">
                                Catatan: {item.note}
                              </p>
                            )}
                          </div>

                          <p
                            className={`shrink-0 text-right font-black ${
                              isVoidTransaction(selectedTransaction)
                                ? "text-slate-400 line-through"
                                : "text-slate-900"
                            }`}
                          >
                            {formatRupiah(finalTotal)}
                          </p>
                        </div>

                        {discount > 0 && (
                          <p className="mt-3 text-xs font-bold text-red-500">
                            Diskon {discount}% - {formatRupiah(discountAmount)}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">
                        Total Diskon Produk
                      </span>
                      <span className="font-bold text-slate-900">
                        - {formatRupiah(selectedTransaction.totalDiscount)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Diskon Member</span>
                      <span className="font-bold text-slate-900">
                        - {formatRupiah(selectedTransaction.memberDiscount)}
                      </span>
                    </div>

                    <div
                      className={`flex justify-between gap-4 border-t border-slate-200 pt-3 text-lg font-black ${
                        isVoidTransaction(selectedTransaction)
                          ? "text-slate-400 line-through"
                          : "text-slate-900"
                      }`}
                    >
                      <span>Total</span>
                      <span>{formatRupiah(selectedTransaction.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handlePrintReceipt(selectedTransaction)}
                    disabled={isVoidTransaction(selectedTransaction)}
                    className="rounded-2xl bg-slate-900 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    Cetak
                  </button>

                  <button
                    onClick={() => handleVoidTransaction(selectedTransaction)}
                    disabled={isVoidTransaction(selectedTransaction)}
                    className="rounded-2xl bg-red-600 py-3 text-sm font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-100 disabled:text-red-300"
                  >
                    Void
                  </button>

                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="rounded-2xl border border-slate-200 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
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