const TRANSACTION_KEY = "radSportTransactions"

export const getTransactions = () => {
  try {
    const data = localStorage.getItem(TRANSACTION_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Gagal membaca transaksi:", error)
    return []
  }
}

export const setTransactions = (transactions) => {
  try {
    localStorage.setItem(TRANSACTION_KEY, JSON.stringify(transactions))
    return transactions
  } catch (error) {
    console.error("Gagal menyimpan daftar transaksi:", error)
    return []
  }
}

export const saveTransaction = (transaction) => {
  try {
    const transactions = getTransactions()
    const updatedTransactions = [transaction, ...transactions]

    localStorage.setItem(TRANSACTION_KEY, JSON.stringify(updatedTransactions))

    return updatedTransactions
  } catch (error) {
    console.error("Gagal menyimpan transaksi:", error)
    return []
  }
}

export const getTransactionById = (transactionId) => {
  const transactions = getTransactions()

  return transactions.find((transaction) => {
    return (
      transaction.id === transactionId ||
      transaction.invoiceNumber === transactionId
    )
  })
}

export const updateTransaction = (transactionId, updatedData) => {
  try {
    const transactions = getTransactions()

    const updatedTransactions = transactions.map((transaction) => {
      const isTargetTransaction =
        transaction.id === transactionId ||
        transaction.invoiceNumber === transactionId

      if (!isTargetTransaction) return transaction

      return {
        ...transaction,
        ...updatedData,
        updatedAt: new Date().toISOString(),
      }
    })

    localStorage.setItem(TRANSACTION_KEY, JSON.stringify(updatedTransactions))

    return updatedTransactions
  } catch (error) {
    console.error("Gagal update transaksi:", error)
    return getTransactions()
  }
}

export const voidTransaction = ({
  transactionId,
  reason = "",
  voidedBy = "Admin",
}) => {
  try {
    const transactions = getTransactions()

    const targetTransaction = transactions.find((transaction) => {
      return (
        transaction.id === transactionId ||
        transaction.invoiceNumber === transactionId
      )
    })

    if (!targetTransaction) {
      alert("Transaksi tidak ditemukan")
      return transactions
    }

    if (targetTransaction.status === "Void") {
      alert("Transaksi ini sudah di-void sebelumnya")
      return transactions
    }

    const updatedTransactions = transactions.map((transaction) => {
      const isTargetTransaction =
        transaction.id === transactionId ||
        transaction.invoiceNumber === transactionId

      if (!isTargetTransaction) return transaction

      return {
        ...transaction,
        status: "Void",
        voidReason: reason,
        voidedAt: new Date().toISOString(),
        voidedBy,
        updatedAt: new Date().toISOString(),
        items: transaction.items?.map((item) => ({
          ...item,
          status: "void",
        })),
      }
    })

    localStorage.setItem(TRANSACTION_KEY, JSON.stringify(updatedTransactions))

    return updatedTransactions
  } catch (error) {
    console.error("Gagal void transaksi:", error)
    return getTransactions()
  }
}

export const generateInvoiceNumber = () => {
  const now = new Date()

  const date = now.toISOString().slice(0, 10).replaceAll("-", "")
  const time = now.getTime().toString().slice(-5)

  return `RAD-${date}-${time}`
}