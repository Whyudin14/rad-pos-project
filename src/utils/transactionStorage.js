const TRANSACTION_KEY = "radSportTransactions"
const PRODUCT_KEY = "radProducts"
const STOCK_MUTATION_KEY = "radStockMutations"

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

export const getStockMutations = () => {
  try {
    const data = localStorage.getItem(STOCK_MUTATION_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Gagal membaca mutasi stok:", error)
    return []
  }
}

export const setStockMutations = (mutations) => {
  try {
    localStorage.setItem(STOCK_MUTATION_KEY, JSON.stringify(mutations))
    return mutations
  } catch (error) {
    console.error("Gagal menyimpan mutasi stok:", error)
    return []
  }
}

const addStockMutations = (newMutations = []) => {
  try {
    if (!Array.isArray(newMutations) || newMutations.length === 0) {
      return getStockMutations()
    }

    const mutations = getStockMutations()
    const updatedMutations = [...newMutations, ...mutations]

    localStorage.setItem(STOCK_MUTATION_KEY, JSON.stringify(updatedMutations))

    return updatedMutations
  } catch (error) {
    console.error("Gagal menambah mutasi stok:", error)
    return getStockMutations()
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

const getItemVariantValue = (item) => {
  return item.variantValue || item.ukuran || item.size || item.value || ""
}

const isSameProduct = (item, product) => {
  return (
    item.productId === product.id ||
    item.id === product.id ||
    item.productId === product.productId
  )
}

const isSameVariant = (item, product, variant) => {
  const itemVariantValue = getItemVariantValue(item)

  return (
    item.variantId === variant.id ||
    item.variantId === variant.variantId ||
    item.cartId === `${product.id}-${variant.id}` ||
    item.cartId === `${product.productId}-${variant.id}` ||
    itemVariantValue === variant.value ||
    itemVariantValue === variant.ukuran ||
    itemVariantValue === variant.size
  )
}

const createMutationId = () => {
  return `MUT-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const getTransactionReference = (transaction) => {
  return transaction.invoiceNumber || transaction.id || "-"
}

const createStockMutation = ({
  type,
  transaction,
  product,
  variant,
  item,
  qtyChange,
  stockBefore,
  stockAfter,
  note = "",
}) => {
  const now = new Date().toISOString()
  const variantValue =
    variant.value ||
    variant.ukuran ||
    variant.size ||
    item.variantValue ||
    item.ukuran ||
    item.size ||
    "-"

  return {
    id: createMutationId(),
    date: now,
    type,
    source: type === "SALE" ? "Transaksi POS" : "Void Transaksi",
    sourceId: transaction.id || "",
    invoiceNumber: transaction.invoiceNumber || "",
    reference: getTransactionReference(transaction),

    productId: product.id || product.productId || item.productId || "",
    productName: product.name || item.productName || item.name || "-",
    brand: product.brand || item.brand || "-",

    variantId: variant.id || variant.variantId || item.variantId || "",
    variantValue,
    sku: variant.sku || item.sku || product.sku || "-",
    rackLocation:
      variant.rackLocation ||
      variant.rak ||
      item.rackLocation ||
      product.rackLocation ||
      "-",

    qty: Math.abs(Number(qtyChange || 0)),
    qtyChange: Number(qtyChange || 0),
    stockBefore: Number(stockBefore || 0),
    stockAfter: Number(stockAfter || 0),

    note,
    createdAt: now,
  }
}

export const reduceStockFromTransaction = (transaction) => {
  try {
    if (!transaction?.items || transaction.items.length === 0) {
      return getProducts()
    }

    if (transaction.stockReduced) {
      return getProducts()
    }

    if (transaction.status === "Void") {
      return getProducts()
    }

    const products = getProducts()
    const stockMutations = []

    const reducedProducts = products.map((product) => {
      const matchedItems = transaction.items.filter((item) => {
        return isSameProduct(item, product)
      })

      if (matchedItems.length === 0) return product

      const updatedVariants = Array.isArray(product.variants)
        ? product.variants.map((variant) => {
            const matchedItem = matchedItems.find((item) => {
              return isSameVariant(item, product, variant)
            })

            if (!matchedItem) return variant

            const currentStock = Number(variant.stock || variant.stok || 0)
            const soldQty = Number(matchedItem.qty || 0)
            const newStock = Math.max(currentStock - soldQty, 0)

            if (soldQty > 0) {
              stockMutations.push(
                createStockMutation({
                  type: "SALE",
                  transaction,
                  product,
                  variant,
                  item: matchedItem,
                  qtyChange: -soldQty,
                  stockBefore: currentStock,
                  stockAfter: newStock,
                  note: `Stok berkurang karena transaksi ${getTransactionReference(
                    transaction
                  )}`,
                })
              )
            }

            return {
              ...variant,
              stock: newStock,
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

    saveProducts(reducedProducts)
    addStockMutations(stockMutations)

    return reducedProducts
  } catch (error) {
    console.error("Gagal mengurangi stok transaksi:", error)
    return getProducts()
  }
}

export const restoreStockFromTransaction = (transaction) => {
  try {
    if (!transaction?.items || transaction.items.length === 0) {
      return getProducts()
    }

    const products = getProducts()
    const stockMutations = []

    const restoredProducts = products.map((product) => {
      const matchedItems = transaction.items.filter((item) => {
        return isSameProduct(item, product)
      })

      if (matchedItems.length === 0) return product

      const updatedVariants = Array.isArray(product.variants)
        ? product.variants.map((variant) => {
            const matchedItem = matchedItems.find((item) => {
              return isSameVariant(item, product, variant)
            })

            if (!matchedItem) return variant

            const currentStock = Number(variant.stock || variant.stok || 0)
            const restoreQty = Number(matchedItem.qty || 0)
            const newStock = currentStock + restoreQty

            if (restoreQty > 0) {
              stockMutations.push(
                createStockMutation({
                  type: "VOID_RESTORE",
                  transaction,
                  product,
                  variant,
                  item: matchedItem,
                  qtyChange: restoreQty,
                  stockBefore: currentStock,
                  stockAfter: newStock,
                  note: `Stok dikembalikan karena void transaksi ${getTransactionReference(
                    transaction
                  )}`,
                })
              )
            }

            return {
              ...variant,
              stock: newStock,
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
    addStockMutations(stockMutations)

    return restoredProducts
  } catch (error) {
    console.error("Gagal restore stok transaksi:", error)
    return getProducts()
  }
}

export const saveTransaction = (transaction) => {
  try {
    const transactionWithStockInfo = {
      ...transaction,
      stockReduced: true,
      stockReducedAt: new Date().toISOString(),
    }

    reduceStockFromTransaction(transaction)

    const transactions = getTransactions()
    const updatedTransactions = [transactionWithStockInfo, ...transactions]

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

    if (restoreStock && targetTransaction.stockRestored) {
      alert("Stok transaksi ini sudah pernah dikembalikan")
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