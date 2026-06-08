const STOCK_MUTATION_KEY = "radStockMutations"

const safeParse = (value, fallback = []) => {
  try {
    return value ? JSON.parse(value) : fallback
  } catch (error) {
    console.error("Gagal membaca data mutasi stok:", error)
    return fallback
  }
}

const safeNumber = (value) => {
  if (typeof value === "number") return value

  if (typeof value === "string") {
    const cleanedValue = value.replace(/[^\d.-]/g, "")
    return Number(cleanedValue || 0)
  }

  return Number(value || 0)
}

const generateMutationId = () => {
  return `MUT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const getCurrentUserRoleSafe = () => {
  try {
    const currentUser = localStorage.getItem("currentUser")
    const parsedUser = currentUser ? JSON.parse(currentUser) : null

    return parsedUser?.role || localStorage.getItem("currentUserRole") || "-"
  } catch (error) {
    return localStorage.getItem("currentUserRole") || "-"
  }
}

export const getStockMutations = () => {
  const data = localStorage.getItem(STOCK_MUTATION_KEY)
  const mutations = safeParse(data, [])

  return Array.isArray(mutations) ? mutations : []
}

export const saveStockMutations = (mutations = []) => {
  const safeMutations = Array.isArray(mutations) ? mutations : []

  localStorage.setItem(STOCK_MUTATION_KEY, JSON.stringify(safeMutations))

  return safeMutations
}

export const createStockMutation = ({
  productId = "-",
  productName = "-",
  brand = "-",
  category = "-",
  sku = "-",
  variantId = "-",
  variantLabel = "-",
  type = "adjustment",
  source = "manual",
  qtyBefore = 0,
  qtyChange = 0,
  qtyAfter = 0,
  referenceId = "-",
  referenceType = "-",
  note = "",
  createdBy = "",
  createdByRole = "",
  createdAt = "",
} = {}) => {
  const normalizedQtyBefore = safeNumber(qtyBefore)
  const normalizedQtyChange = safeNumber(qtyChange)
  const normalizedQtyAfter = safeNumber(qtyAfter)

  return {
    id: generateMutationId(),
    productId,
    productName,
    brand,
    category,
    sku,
    variantId,
    variantLabel,
    type,
    source,
    qtyBefore: normalizedQtyBefore,
    qtyChange: normalizedQtyChange,
    qtyAfter: normalizedQtyAfter,
    referenceId,
    referenceType,
    note,
    createdBy,
    createdByRole: createdByRole || getCurrentUserRoleSafe(),
    createdAt: createdAt || new Date().toISOString(),
  }
}

export const saveStockMutation = (mutationData = {}) => {
  const currentMutations = getStockMutations()
  const newMutation = createStockMutation(mutationData)

  const updatedMutations = [newMutation, ...currentMutations]

  saveStockMutations(updatedMutations)

  return newMutation
}

export const saveBulkStockMutations = (mutationList = []) => {
  if (!Array.isArray(mutationList) || mutationList.length === 0) {
    return []
  }

  const currentMutations = getStockMutations()

  const newMutations = mutationList.map((mutationData) => {
    return createStockMutation(mutationData)
  })

  const updatedMutations = [...newMutations, ...currentMutations]

  saveStockMutations(updatedMutations)

  return newMutations
}

export const clearStockMutations = () => {
  localStorage.removeItem(STOCK_MUTATION_KEY)
}