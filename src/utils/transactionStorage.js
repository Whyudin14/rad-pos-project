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

export const generateInvoiceNumber = () => {
  const now = new Date()

  const date = now.toISOString().slice(0, 10).replaceAll("-", "")
  const time = now.getTime().toString().slice(-5)

  return `RAD-${date}-${time}`
}