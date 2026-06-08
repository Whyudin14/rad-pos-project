import { useEffect, useMemo, useState } from "react"
import MainLayout from "../layouts/MainLayout"
import {
  approveVoidTransaction,
  getTransactions,
  rejectVoidTransaction,
  requestVoidTransaction,
} from "../utils/transactionStorage"
import PrintReceipt from "../components/PrintReceipt"

function RiwayatTransaksi() {
  const [transactions, setTransactions] = useState([])
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [printTransaction, setPrintTransaction] = useState(null)

  const [searchKeyword, setSearchKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState("Semua")
  const [paymentFilter, setPaymentFilter] = useState("Semua")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

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
    return transaction?.status === "Void" || transaction?.voidStatus === "approved"
  }

  const isVoidPendingTransaction = (transaction) => {
    return (
      transaction?.status === "Void Pending" ||
      transaction?.voidStatus === "pending"
    )
  }

  const isVoidRejectedTransaction = (transaction) => {
    return transaction?.voidStatus === "rejected"
  }

  const isTransactionLocked = (transaction) => {
    return isVoidTransaction(transaction) || isVoidPendingTransaction(transaction)
  }

  const getTransactionStatus = (transaction) => {
    if (isVoidTransaction(transaction)) return "Void"
    if (isVoidPendingTransaction(transaction)) return "Menunggu Void"
    return transaction?.status || "Lunas"
  }

  const getStatusBadgeClass = (transaction) => {
    if (isVoidTransaction(transaction)) {
      return "bg-red-100 text-red-600"
    }

    if (isVoidPendingTransaction(transaction)) {
      return "bg-amber-100 text-amber-700"
    }

    if (isVoidRejectedTransaction(transaction)) {
      return "bg-blue-50 text-blue-600"
    }

    return "bg-emerald-50 text-emerald-600"
  }

  const getTotalItems = (transaction) => {
    if (transaction?.totalItems) return transaction.totalItems

    return (
      transaction?.items?.reduce((total, item) => {
        return total + Number(item.qty || 0)
      }, 0) || 0
    )
  }

  const transactionSummary = useMemo(() => {
    return transactions.reduce(
      (summary, transaction) => {
        if (isVoidTransaction(transaction)) {
          return {
            ...summary,
            void: summary.void + 1,
          }
        }

        if (isVoidPendingTransaction(transaction)) {
          return {
            ...summary,
            pending: summary.pending + 1,
          }
        }

        return {
          ...summary,
          paid: summary.paid + 1,
        }
      },
      {
        total: transactions.length,
        paid: 0,
        pending: 0,
        void: 0,
      }
    )
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase()

    return transactions.filter((transaction) => {
      const invoice = String(transaction.invoiceNumber || "").toLowerCase()
      const paymentMethod = transaction.paymentMethod || ""
      const status = getTransactionStatus(transaction)

      const transactionDate = transaction.date ? new Date(transaction.date) : null

      const matchKeyword = !keyword || invoice.includes(keyword)

      const matchStatus =
        statusFilter === "Semua" ||
        status === statusFilter ||
        (statusFilter === "Lunas" &&
          !isVoidTransaction(transaction) &&
          !isVoidPendingTransaction(transaction))

      const matchPayment =
        paymentFilter === "Semua" || paymentMethod === paymentFilter

      let matchStartDate = true
      let matchEndDate = true

      if (startDate && transactionDate) {
        const start = new Date(`${startDate}T00:00:00`)
        matchStartDate = transactionDate >= start
      }

      if (endDate && transactionDate) {
        const end = new Date(`${endDate}T23:59:59`)
        matchEndDate = transactionDate <= end
      }

      return (
        matchKeyword &&
        matchStatus &&
        matchPayment &&
        matchStartDate &&
        matchEndDate
      )
    })
  }, [transactions, searchKeyword, statusFilter, paymentFilter, startDate, endDate])

  const resetFilters = () => {
    setSearchKeyword("")
    setStatusFilter("Semua")
    setPaymentFilter("Semua")
    setStartDate("")
    setEndDate("")
  }

  const syncSelectedTransaction = (updatedTransactions, oldTransaction) => {
    const updatedSelectedTransaction = updatedTransactions.find((item) => {
      return (
        item.id === oldTransaction.id ||
        item.invoiceNumber === oldTransaction.invoiceNumber
      )
    })

    setTransactions(updatedTransactions)
    setSelectedTransaction(updatedSelectedTransaction || null)
  }

  const handleRequestVoidTransaction = (transaction) => {
    if (!transaction) return

    if (isVoidTransaction(transaction)) {
      alert("Transaksi ini sudah di-void sebelumnya.")
      return
    }

    if (isVoidPendingTransaction(transaction)) {
      alert("Transaksi ini sudah menunggu persetujuan void.")
      return
    }

    const reason = window.prompt(
      `Alasan ajukan void transaksi ${transaction.invoiceNumber}:`
    )

    if (!reason || !reason.trim()) {
      alert("Pengajuan void dibatalkan. Alasan wajib diisi.")
      return
    }

    const isConfirmed = window.confirm(
      `Ajukan void transaksi ${transaction.invoiceNumber}?\n\nStok belum dikembalikan. Stok baru kembali setelah Admin/Owner menyetujui pengajuan void ini.`
    )

    if (!isConfirmed) return

    const updatedTransactions = requestVoidTransaction({
      transactionId: transaction.id || transaction.invoiceNumber,
      reason: reason.trim(),
      requestedBy: "Kasir",
    })

    syncSelectedTransaction(updatedTransactions, transaction)
  }

  const handleApproveVoidTransaction = (transaction) => {
    if (!transaction) return

    if (!isVoidPendingTransaction(transaction)) {
      alert("Transaksi ini belum menunggu persetujuan void.")
      return
    }

    const isConfirmed = window.confirm(
      `Setujui void transaksi ${transaction.invoiceNumber}?\n\nSetelah disetujui, transaksi menjadi Void dan stok barang dari transaksi ini akan dikembalikan otomatis.`
    )

    if (!isConfirmed) return

    const updatedTransactions = approveVoidTransaction({
      transactionId: transaction.id || transaction.invoiceNumber,
      approvedBy: "Admin/Owner",
    })

    syncSelectedTransaction(updatedTransactions, transaction)
  }

  const handleRejectVoidTransaction = (transaction) => {
    if (!transaction) return

    if (!isVoidPendingTransaction(transaction)) {
      alert("Transaksi ini belum menunggu persetujuan void.")
      return
    }

    const rejectReason = window.prompt(
      `Alasan menolak void transaksi ${transaction.invoiceNumber}:`
    )

    if (!rejectReason || !rejectReason.trim()) {
      alert("Tolak void dibatalkan. Alasan wajib diisi.")
      return
    }

    const isConfirmed = window.confirm(
      `Tolak pengajuan void transaksi ${transaction.invoiceNumber}?\n\nTransaksi tetap Lunas dan stok tidak berubah.`
    )

    if (!isConfirmed) return

    const updatedTransactions = rejectVoidTransaction({
      transactionId: transaction.id || transaction.invoiceNumber,
      rejectedBy: "Admin/Owner",
      rejectReason: rejectReason.trim(),
    })

    syncSelectedTransaction(updatedTransactions, transaction)
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

    if (isVoidPendingTransaction(transaction)) {
      alert("Transaksi yang sedang menunggu void sebaiknya tidak dicetak ulang.")
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
                Pantau transaksi, cetak ulang struk, ajukan void, dan proses
                persetujuan void tanpa langsung mengembalikan stok.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-4 lg:w-auto">
              <SummaryCard
                label="Total Transaksi"
                value={transactionSummary.total}
                color="slate"
              />

              <SummaryCard
                label="Lunas"
                value={transactionSummary.paid}
                color="emerald"
              />

              <SummaryCard
                label="Menunggu Void"
                value={transactionSummary.pending}
                color="amber"
              />

              <SummaryCard
                label="Void"
                value={transactionSummary.void}
                color="red"
              />
            </div>
          </div>

          <div className="mb-5 rounded-[26px] border border-amber-100 bg-amber-50 p-4 shadow-sm">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-black text-amber-800">
                  Alur void sekarang pakai persetujuan.
                </p>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-amber-700">
                  Kasir hanya mengajukan void. Stok tidak langsung kembali.
                  Stok baru kembali setelah Admin/Owner menyetujui pengajuan
                  void.
                </p>
              </div>

              <div className="rounded-2xl bg-white px-4 py-2 text-xs font-black text-amber-700 shadow-sm">
                Pending void: {transactionSummary.pending}
              </div>
            </div>
          </div>

          <div className="mb-5 rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.8fr_auto]">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">
                  Cari Invoice
                </label>
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder="Contoh: RAD-20260527"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
                >
                  <option value="Semua">Semua</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Menunggu Void">Menunggu Void</option>
                  <option value="Void">Void</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">
                  Metode
                </label>
                <select
                  value={paymentFilter}
                  onChange={(event) => setPaymentFilter(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
                >
                  <option value="Semua">Semua</option>
                  <option value="Cash">Cash</option>
                  <option value="QRIS">QRIS</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Debit">Debit</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50 lg:w-auto"
                >
                  Reset
                </button>
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
          ) : filteredTransactions.length === 0 ? (
            <div className="rounded-[26px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <p className="text-sm font-bold text-slate-700">
                Transaksi tidak ditemukan.
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Coba ubah keyword, status, metode, atau tanggal filter.
              </p>

              <button
                onClick={resetFilters}
                className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
              >
                Reset Filter
              </button>
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
                {filteredTransactions.map((transaction, index) => {
                  const isVoid = isVoidTransaction(transaction)
                  const isPending = isVoidPendingTransaction(transaction)
                  const isLocked = isTransactionLocked(transaction)

                  return (
                    <div
                      key={transaction.id || transaction.invoiceNumber || index}
                      className={`grid gap-4 px-5 py-4 text-sm xl:grid-cols-[1.45fr_1.15fr_1fr_0.8fr_0.65fr_1.1fr] xl:items-center ${
                        isVoid
                          ? "bg-red-50/50"
                          : isPending
                          ? "bg-amber-50/60"
                          : "bg-white"
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
                            className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${getStatusBadgeClass(
                              transaction
                            )}`}
                          >
                            {getTransactionStatus(transaction)}
                          </span>

                          {transaction.stockRestored && (
                            <span className="w-fit rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-600">
                              Stok kembali
                            </span>
                          )}

                          {isVoidRejectedTransaction(transaction) && (
                            <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                              Void pernah ditolak
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

                      <div className="flex flex-wrap justify-start gap-2 xl:justify-end">
                        <button
                          onClick={() => setSelectedTransaction(transaction)}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 transition hover:bg-slate-50"
                        >
                          Detail
                        </button>

                        <button
                          onClick={() => handlePrintReceipt(transaction)}
                          disabled={isLocked}
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
              <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[26px] bg-white p-5 shadow-2xl">
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
                      : isVoidPendingTransaction(selectedTransaction)
                      ? "bg-amber-50"
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
                            : isVoidPendingTransaction(selectedTransaction)
                            ? "text-amber-700"
                            : "text-emerald-600"
                        }`}
                      >
                        {getTransactionStatus(selectedTransaction)}
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

                  {isVoidPendingTransaction(selectedTransaction) && (
                    <VoidInfoBox
                      color="amber"
                      title="Pengajuan Void Menunggu Persetujuan"
                      reason={
                        selectedTransaction.voidRequestedReason ||
                        selectedTransaction.voidReason
                      }
                      rows={[
                        {
                          label: "Diajukan Pada",
                          value: selectedTransaction.voidRequestedAt
                            ? formatDate(selectedTransaction.voidRequestedAt)
                            : "-",
                        },
                        {
                          label: "Diajukan Oleh",
                          value: selectedTransaction.voidRequestedBy || "-",
                        },
                      ]}
                      footer="Stok belum dikembalikan. Transaksi masih dianggap aktif sampai Admin/Owner menyetujui void."
                    />
                  )}

                  {isVoidTransaction(selectedTransaction) && (
                    <VoidInfoBox
                      color="red"
                      title="Alasan Void"
                      reason={selectedTransaction.voidReason || "-"}
                      rows={[
                        {
                          label: "Waktu Void",
                          value: selectedTransaction.voidedAt
                            ? formatDate(selectedTransaction.voidedAt)
                            : "-",
                        },
                        {
                          label: "Void Oleh",
                          value: selectedTransaction.voidedBy || "-",
                        },
                      ]}
                      footer={
                        selectedTransaction.stockRestored
                          ? "Stok otomatis sudah dikembalikan"
                          : "Stok tidak dikembalikan otomatis"
                      }
                    />
                  )}

                  {isVoidRejectedTransaction(selectedTransaction) &&
                    !isVoidPendingTransaction(selectedTransaction) &&
                    !isVoidTransaction(selectedTransaction) && (
                      <VoidInfoBox
                        color="blue"
                        title="Riwayat Pengajuan Void Ditolak"
                        reason={
                          selectedTransaction.voidRequestedReason ||
                          selectedTransaction.voidReason ||
                          "-"
                        }
                        rows={[
                          {
                            label: "Ditolak Pada",
                            value: selectedTransaction.voidRejectedAt
                              ? formatDate(selectedTransaction.voidRejectedAt)
                              : "-",
                          },
                          {
                            label: "Ditolak Oleh",
                            value: selectedTransaction.voidRejectedBy || "-",
                          },
                        ]}
                        footer={`Alasan tolak: ${
                          selectedTransaction.voidRejectReason || "-"
                        }`}
                      />
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
                            : isVoidPendingTransaction(selectedTransaction)
                            ? "border-amber-100 bg-amber-50/40"
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

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <button
                    onClick={() => handlePrintReceipt(selectedTransaction)}
                    disabled={isTransactionLocked(selectedTransaction)}
                    className="rounded-2xl bg-slate-900 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    Cetak
                  </button>

                  {isVoidPendingTransaction(selectedTransaction) ? (
                    <>
                      <button
                        onClick={() =>
                          handleApproveVoidTransaction(selectedTransaction)
                        }
                        className="rounded-2xl bg-emerald-600 py-3 text-sm font-black text-white hover:bg-emerald-700"
                      >
                        Setujui Void
                      </button>

                      <button
                        onClick={() =>
                          handleRejectVoidTransaction(selectedTransaction)
                        }
                        className="rounded-2xl bg-red-600 py-3 text-sm font-black text-white hover:bg-red-700"
                      >
                        Tolak Void
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          handleRequestVoidTransaction(selectedTransaction)
                        }
                        disabled={isTransactionLocked(selectedTransaction)}
                        className="rounded-2xl bg-amber-500 py-3 text-sm font-black text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-100 disabled:text-amber-300"
                      >
                        Ajukan Void
                      </button>

                      <button
                        onClick={() => setSelectedTransaction(null)}
                        className="rounded-2xl border border-slate-200 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
                      >
                        Tutup
                      </button>
                    </>
                  )}
                </div>

                {isVoidPendingTransaction(selectedTransaction) && (
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="mt-3 w-full rounded-2xl border border-slate-200 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
                  >
                    Tutup
                  </button>
                )}
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

function SummaryCard({ label, value, color = "slate" }) {
  const colorClass = {
    slate: "text-slate-900",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    red: "text-red-600",
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-xl font-black ${colorClass[color]}`}>
        {value}
      </p>
    </div>
  )
}

function VoidInfoBox({ color = "red", title, reason, rows = [], footer }) {
  const colorClass = {
    red: {
      wrapper: "border-red-100 bg-white/70",
      title: "text-red-400",
      reason: "text-red-600",
      footer: "bg-blue-50 text-blue-600",
    },
    amber: {
      wrapper: "border-amber-100 bg-white/70",
      title: "text-amber-500",
      reason: "text-amber-700",
      footer: "bg-amber-100 text-amber-700",
    },
    blue: {
      wrapper: "border-blue-100 bg-white/70",
      title: "text-blue-500",
      reason: "text-blue-700",
      footer: "bg-blue-50 text-blue-600",
    },
  }

  const selectedColor = colorClass[color] || colorClass.red

  return (
    <div className={`mt-4 rounded-2xl border p-3 ${selectedColor.wrapper}`}>
      <div className="mb-3">
        <p
          className={`text-xs font-bold uppercase tracking-wide ${selectedColor.title}`}
        >
          {title}
        </p>
        <p
          className={`mt-1 whitespace-pre-wrap break-words text-sm font-bold leading-relaxed ${selectedColor.reason}`}
        >
          {reason || "-"}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              {row.label}
            </p>
            <p className="mt-1 font-bold text-slate-800">{row.value || "-"}</p>
          </div>
        ))}
      </div>

      {footer && (
        <p
          className={`mt-3 w-fit rounded-full px-3 py-1 text-xs font-black ${selectedColor.footer}`}
        >
          {footer}
        </p>
      )}
    </div>
  )
}

export default RiwayatTransaksi
