const TRANSACTION_KEY = "radSportTransactions"
const PRODUCT_KEY = "radProducts"

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

const getProducts = () => {
  try {
    const data = localStorage.getItem(PRODUCT_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Gagal membaca produk:", error)
    return []
  }
}

const saveProducts = (products) => {
  try {
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(products))
    return products
  } catch (error) {
    console.error("Gagal menyimpan produk:", error)
    return []
  }
}

export const restoreStockFromTransaction = (transaction) => {
  try {
    if (!transaction?.items || transaction.items.length === 0) {
      return getProducts()
    }

    const products = getProducts()

    const restoredProducts = products.map((product) => {
      const matchedItems = transaction.items.filter((item) => {
        return (
          item.productId === product.id ||
          item.id === product.id ||
          item.productId === product.productId
        )
      })

      if (matchedItems.length === 0) return product

      const updatedVariants = Array.isArray(product.variants)
        ? product.variants.map((variant) => {
            const matchedItem = matchedItems.find((item) => {
              const itemVariantValue =
                item.variantValue || item.ukuran || item.size || ""

              return (
                item.variantId === variant.id ||
                item.variantId === variant.variantId ||
                item.cartId === `${product.id}-${variant.id}` ||
                itemVariantValue === variant.value ||
                itemVariantValue === variant.ukuran ||
                itemVariantValue === variant.size
              )
            })

            if (!matchedItem) return variant

            const currentStock = Number(variant.stock || variant.stok || 0)
            const restoreQty = Number(matchedItem.qty || 0)

            return {
              ...variant,
              stock: currentStock + restoreQty,
            }
          })
        : []

      const totalStock = updatedVariants.reduce((sum, variant) => {
        return sum + Number(variant.stock || variant.stok || 0)
      }, 0)

      return {
        ...product,
        stock: totalStock,
        variants: updatedVariants,
        updatedAt: new Date().toISOString(),
      }
    })

    saveProducts(restoredProducts)

    return restoredProducts
  } catch (error) {
    console.error("Gagal restore stok transaksi:", error)
    return getProducts()
  }
}

export const voidTransaction = ({
  transactionId,
  reason = "",
  voidedBy = "Admin",
  restoreStock = true,
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

    if (restoreStock) {
      restoreStockFromTransaction(targetTransaction)
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
        stockRestored: restoreStock,
        stockRestoredAt: restoreStock ? new Date().toISOString() : null,
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