import { useEffect, useMemo, useState } from "react"
import MainLayout from "../layouts/MainLayout"
import { products as dummyProducts } from "../data/dummyProducts"
import AddProductModal from "../components/stock-barang/AddProductModal"
import ActiveStockOpnameSessionCard from "../components/stock-opname/ActiveStockOpnameSessionCard"
import CreateStockOpnameSessionModal from "../components/stock-opname/CreateStockOpnameSessionModal"
import StockOpnameCheckModal from "../components/stock-opname/StockOpnameCheckModal"
import EditStockOpnameModal from "../components/stock-opname/EditStockOpnameModal"
import OpnameHistoryModal from "../components/stock-opname/OpnameHistoryModal"
import ActiveSessionResultModal from "../components/stock-opname/ActiveSessionResultModal"
import SessionHistoryModal from "../components/stock-opname/SessionHistoryModal"

function StokBarang() {
  const [searchTerm, setSearchTerm] = useState("")
  const [stockFilter, setStockFilter] = useState("Semua")
  const [productViewMode, setProductViewMode] = useState("Semua")
  const [expandedProductId, setExpandedProductId] = useState(null)
  const [productList, setProductList] = useState([])
  const [showAddProduct, setShowAddProduct] = useState(false)

  const [selectedStockOpname, setSelectedStockOpname] = useState(null)
  const [physicalStock, setPhysicalStock] = useState("")
  const [opnameNote, setOpnameNote] = useState("")
  const [showOpnameSuccess, setShowOpnameSuccess] = useState(false)
  const [selectedEditOpname, setSelectedEditOpname] = useState(null)
  const [editPhysicalStock, setEditPhysicalStock] = useState("")
  const [editOpnameNote, setEditOpnameNote] = useState("")

  const [showOpnameHistory, setShowOpnameHistory] = useState(false)
  const [stockOpnameHistory, setStockOpnameHistory] = useState([])
  const [opnameHistoryFilter, setOpnameHistoryFilter] = useState("Semua")
  const [opnameHistorySessionFilter, setOpnameHistorySessionFilter] =
    useState("Semua Sesi")
  const [opnameHistorySearch, setOpnameHistorySearch] = useState("")

  const [showCreateSession, setShowCreateSession] = useState(false)
  const [stockOpnameSessions, setStockOpnameSessions] = useState([])
  const [activeStockOpnameSession, setActiveStockOpnameSession] =
    useState(null)
  const [selectedSessionType, setSelectedSessionType] = useState("")
  const [sessionNote, setSessionNote] = useState("")

  const [showSessionHistory, setShowSessionHistory] = useState(false)
  const [showActiveSessionResult, setShowActiveSessionResult] = useState(false)
  const [sessionHistoryStatusFilter, setSessionHistoryStatusFilter] =
    useState("Semua")
  const [sessionHistoryTypeFilter, setSessionHistoryTypeFilter] =
    useState("Semua Sesi")
  const [sessionHistorySearch, setSessionHistorySearch] = useState("")
  const [selectedSessionSummary, setSelectedSessionSummary] = useState(null)

  const stockOpnameTypes = [
    {
      type: "Aksesoris",
      scheduleDay: "Senin",
      categories: ["Aksesoris", "Accessories"],
    },
    {
      type: "Running & Lifestyle",
      scheduleDay: "Selasa",
      categories: [
        "Running",
        "Running Junior",
        "Lifestyle",
        "Lifestyle Junior",
      ],
    },
    {
      type: "Football",
      scheduleDay: "Rabu",
      categories: ["Football", "Football Junior"],
    },
    {
      type: "Futsal",
      scheduleDay: "Kamis",
      categories: ["Futsal", "Futsal Junior"],
    },
  ]

  const stockFilters = ["Semua", "Aman", "Menipis", "Kosong"]
  const opnameHistoryFilters = ["Semua", "Sesuai", "Lebih", "Kurang"]

  const opnameHistorySessionFilters = [
    "Semua Sesi",
    "Aksesoris",
    "Running & Lifestyle",
    "Football",
    "Futsal",
    "Tanpa Sesi",
  ]

  const sessionHistoryStatusFilters = ["Semua", "Aktif", "Selesai"]

  const sessionHistoryTypeFilters = [
    "Semua Sesi",
    "Aksesoris",
    "Running & Lifestyle",
    "Football",
    "Futsal",
  ]

  useEffect(() => {
    const storedProducts = JSON.parse(
      localStorage.getItem("radProducts") || "null"
    )

    if (Array.isArray(storedProducts) && storedProducts.length > 0) {
      setProductList(storedProducts)
    } else {
      setProductList(dummyProducts)
      localStorage.setItem("radProducts", JSON.stringify(dummyProducts))
    }

    const storedHistory = JSON.parse(
      localStorage.getItem("stockOpnameHistory") || "[]"
    )

    const storedSessions = JSON.parse(
      localStorage.getItem("stockOpnameSessions") || "[]"
    )

    const storedActiveSession = JSON.parse(
      localStorage.getItem("activeStockOpnameSession") || "null"
    )

    setStockOpnameHistory(storedHistory)
    setStockOpnameSessions(storedSessions)
    setActiveStockOpnameSession(storedActiveSession)
  }, [])

  const formatRupiah = (number) => {
    return `Rp ${Number(number || 0).toLocaleString("id-ID")}`
  }

  const formatDateTime = (date) => {
    if (!date) return "-"

    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTotalStock = (product) => {
    if (!product.variants || product.variants.length === 0) {
      return Number(product.stock || 0)
    }

    return product.variants.reduce((total, variant) => {
      return total + Number(variant.stock || 0)
    }, 0)
  }

  const getMinimumStock = (product) => Number(product.minimumStock || 0)

  const getVariantMinimumStock = (product, variant) => {
    if (variant?.minimumStock !== undefined) {
      return Number(variant.minimumStock || 0)
    }

    return getMinimumStock(product)
  }

  const getStockStatus = (stock, minimumStock = 0) => {
    const numericStock = Number(stock || 0)
    const numericMinimumStock = Number(minimumStock || 0)

    if (numericStock <= 0) {
      return {
        label: "Kosong",
        badgeClass: "bg-red-50 text-red-600 border-red-100",
        textClass: "text-red-600",
      }
    }

    if (numericMinimumStock > 0 && numericStock <= numericMinimumStock) {
      return {
        label: "Menipis",
        badgeClass: "bg-amber-50 text-amber-600 border-amber-100",
        textClass: "text-amber-600",
      }
    }

    return {
      label: "Aman",
      badgeClass: "bg-emerald-50 text-emerald-600 border-emerald-100",
      textClass: "text-emerald-600",
    }
  }

  const getOpnameStatusClass = (status) => {
    if (status === "Sesuai") {
      return "bg-emerald-50 text-emerald-600 border-emerald-100"
    }

    if (status === "Lebih") {
      return "bg-blue-50 text-blue-600 border-blue-100"
    }

    return "bg-red-50 text-red-600 border-red-100"
  }

  const getDifferenceClass = (difference) => {
    const numericDifference = Number(difference || 0)

    if (numericDifference === 0) return "text-emerald-600"
    if (numericDifference > 0) return "text-blue-600"

    return "text-red-600"
  }

  const formatDifference = (difference) => {
    const numericDifference = Number(difference || 0)

    if (numericDifference > 0) return `+${numericDifference}`

    return numericDifference
  }

  const getSelectedSessionTypeData = () => {
    return stockOpnameTypes.find((item) => item.type === selectedSessionType)
  }

  const isProductMatchActiveSession = (product) => {
    if (!activeStockOpnameSession) return false

    return activeStockOpnameSession.categories?.includes(product.category)
  }

  const isHistoryWithoutSession = (item) => {
    return (
      !item.sessionId ||
      item.sessionId === "null" ||
      item.sessionId === "undefined" ||
      !item.sessionName ||
      item.sessionName === "Tanpa Sesi" ||
      item.sessionName === "Tanpa sesi aktif" ||
      !item.sessionType ||
      item.sessionType === "-" ||
      item.sessionType === "Tanpa Sesi"
    )
  }

  const getSessionStatus = (session) => {
    if (activeStockOpnameSession?.id === session.id) return "Aktif"
    if (session.status === "Draft") return "Aktif"
    return session.status || "Aktif"
  }

  const getSessionSummary = (session) => {
    const sessionItems = stockOpnameHistory.filter((item) => {
      return item.sessionId === session.id
    })

    return buildSessionSummary(session, sessionItems, getSessionStatus(session))
  }

  const totalProducts = productList.length

  const totalVariants = productList.reduce((total, product) => {
    return total + Number(product.variants?.length || 0)
  }, 0)

  const totalStock = productList.reduce((total, product) => {
    return total + getTotalStock(product)
  }, 0)

  const totalNeedCheck = productList.filter((product) => {
    const stock = getTotalStock(product)
    const minimumStock = getMinimumStock(product)
    const status = getStockStatus(stock, minimumStock)

    return status.label === "Menipis" || status.label === "Kosong"
  }).length

  const sessionProductsCount = activeStockOpnameSession
    ? productList.filter((product) => isProductMatchActiveSession(product)).length
    : 0

  const filteredProducts = productList.filter((product) => {
    const keyword = searchTerm.toLowerCase()
    const productStock = getTotalStock(product)
    const minimumStock = getMinimumStock(product)
    const stockStatus = getStockStatus(productStock, minimumStock)

    const matchProduct =
      product.name?.toLowerCase().includes(keyword) ||
      product.brand?.toLowerCase().includes(keyword) ||
      product.category?.toLowerCase().includes(keyword) ||
      product.sku?.toLowerCase().includes(keyword) ||
      product.barcode?.includes(searchTerm) ||
      product.rackLocation?.toLowerCase().includes(keyword) ||
      product.description?.toLowerCase().includes(keyword)

    const matchVariant = product.variants?.some((variant) => {
      return (
        variant.value?.toString().toLowerCase().includes(keyword) ||
        variant.sku?.toLowerCase().includes(keyword) ||
        variant.barcode?.includes(searchTerm)
      )
    })

    const matchFilter =
      stockFilter === "Semua" || stockStatus.label === stockFilter

    const matchSessionMode =
      productViewMode === "Semua" || isProductMatchActiveSession(product)

    return (matchProduct || matchVariant) && matchFilter && matchSessionMode
  })

  const stockOpnameSessionSummaries = useMemo(() => {
    return stockOpnameSessions.map((session) => getSessionSummary(session))
  }, [stockOpnameSessions, stockOpnameHistory, activeStockOpnameSession])

  const filteredStockOpnameSessionSummaries =
    stockOpnameSessionSummaries.filter((session) => {
      const keyword = sessionHistorySearch.toLowerCase()

      const matchStatus =
        sessionHistoryStatusFilter === "Semua" ||
        session.status === sessionHistoryStatusFilter

      const matchType =
        sessionHistoryTypeFilter === "Semua Sesi" ||
        session.type === sessionHistoryTypeFilter

      const matchSearch =
        session.name?.toLowerCase().includes(keyword) ||
        session.type?.toLowerCase().includes(keyword) ||
        session.scheduleDay?.toLowerCase().includes(keyword) ||
        session.status?.toLowerCase().includes(keyword) ||
        session.note?.toLowerCase().includes(keyword) ||
        session.categories?.join(" ").toLowerCase().includes(keyword)

      return matchStatus && matchType && matchSearch
    })

  const filteredStockOpnameHistory = stockOpnameHistory.filter((item) => {
    const keyword = opnameHistorySearch.toLowerCase()

    const matchStatus =
      opnameHistoryFilter === "Semua" || item.status === opnameHistoryFilter

    const matchSession =
      opnameHistorySessionFilter === "Semua Sesi" ||
      item.sessionType === opnameHistorySessionFilter ||
      (opnameHistorySessionFilter === "Tanpa Sesi" &&
        isHistoryWithoutSession(item))

    const matchSearch =
      item.productName?.toLowerCase().includes(keyword) ||
      item.brand?.toLowerCase().includes(keyword) ||
      item.category?.toLowerCase().includes(keyword) ||
      item.variantValue?.toString().toLowerCase().includes(keyword) ||
      item.sku?.toLowerCase().includes(keyword) ||
      item.barcode?.toString().includes(opnameHistorySearch) ||
      item.rackLocation?.toLowerCase().includes(keyword) ||
      item.note?.toLowerCase().includes(keyword) ||
      item.status?.toLowerCase().includes(keyword) ||
      item.sessionName?.toLowerCase().includes(keyword) ||
      item.sessionType?.toLowerCase().includes(keyword) ||
      item.sessionScheduleDay?.toLowerCase().includes(keyword)

    return matchStatus && matchSession && matchSearch
  })

  const totalOpnameHistory = stockOpnameHistory.length
  const totalOpnameSesuai = countByStatus(stockOpnameHistory, "Sesuai")
  const totalOpnameLebih = countByStatus(stockOpnameHistory, "Lebih")
  const totalOpnameKurang = countByStatus(stockOpnameHistory, "Kurang")

  const totalOpnameSessions = stockOpnameSessionSummaries.length
  const totalActiveSessions = stockOpnameSessionSummaries.filter((session) => {
    return session.status === "Aktif"
  }).length
  const totalFinishedSessions = stockOpnameSessionSummaries.filter((session) => {
    return session.status === "Selesai"
  }).length
  const totalCheckedFromSessions = stockOpnameSessionSummaries.reduce(
    (total, session) => total + session.totalChecked,
    0
  )

  const activeSessionSummary = activeStockOpnameSession
    ? getSessionSummary(activeStockOpnameSession)
    : null

  const activeSessionProgress = activeStockOpnameSession
    ? getSessionProgressData(
        activeStockOpnameSession,
        stockOpnameHistory,
        productList
      )
    : getEmptySessionProgress()

  const selectedSystemStock = Number(selectedStockOpname?.systemStock || 0)
  const selectedPhysicalStock = Number(physicalStock || 0)
  const selectedDifference =
    physicalStock === "" ? 0 : selectedPhysicalStock - selectedSystemStock

  const createStockOpnameSession = () => {
    const selectedTypeData = getSelectedSessionTypeData()

    if (!selectedTypeData) return

    const newSession = {
      id: `SESSION-SO-${Date.now()}`,
      name: `SO ${selectedTypeData.type} - ${formatDateTime(
        new Date().toISOString()
      )}`,
      type: selectedTypeData.type,
      scheduleDay: selectedTypeData.scheduleDay,
      categories: selectedTypeData.categories,
      note: sessionNote,
      status: "Aktif",
      createdAt: new Date().toISOString(),
      finishedAt: null,
    }

    const updatedSessions = [newSession, ...stockOpnameSessions]

    localStorage.setItem("stockOpnameSessions", JSON.stringify(updatedSessions))
    localStorage.setItem(
      "activeStockOpnameSession",
      JSON.stringify(newSession)
    )

    setStockOpnameSessions(updatedSessions)
    setActiveStockOpnameSession(newSession)
    setProductViewMode("Sesuai Sesi")
    setSelectedSessionType("")
    setSessionNote("")
    setShowCreateSession(false)
  }

  const closeActiveStockOpnameSession = () => {
    if (!activeStockOpnameSession) return

    const confirmClose = window.confirm(
      "Akhiri sesi SO aktif ini? Sesi tetap tersimpan sebagai riwayat sesi."
    )

    if (!confirmClose) return

    const finishedSession = {
      ...activeStockOpnameSession,
      status: "Selesai",
      finishedAt: new Date().toISOString(),
    }

    const updatedSessions = stockOpnameSessions.map((session) => {
      return session.id === finishedSession.id ? finishedSession : session
    })

    localStorage.setItem("stockOpnameSessions", JSON.stringify(updatedSessions))
    localStorage.removeItem("activeStockOpnameSession")

    setStockOpnameSessions(updatedSessions)
    setActiveStockOpnameSession(null)
    setProductViewMode("Semua")
  }

  const toggleExpandProduct = (productId) => {
    setExpandedProductId((currentId) =>
      currentId === productId ? null : productId
    )
  }

  const openStockOpnameModal = (product, variant) => {
    setSelectedStockOpname({
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      category: product.category,
      rackLocation: product.rackLocation,
      variantId: variant.id,
      variantValue: variant.value,
      sku: variant.sku,
      barcode: variant.barcode,
      systemStock: Number(variant.stock || 0),
    })

    setPhysicalStock("")
    setOpnameNote("")
    setShowOpnameSuccess(false)
  }

  const closeStockOpnameModal = () => {
    setSelectedStockOpname(null)
    setPhysicalStock("")
    setOpnameNote("")
    setShowOpnameSuccess(false)
  }

  const openEditStockOpnameModal = (item) => {
    setSelectedEditOpname(item)
    setEditPhysicalStock(String(item.physicalStock ?? ""))
    setEditOpnameNote(item.note || "")
  }

  const closeEditStockOpnameModal = () => {
    setSelectedEditOpname(null)
    setEditPhysicalStock("")
    setEditOpnameNote("")
  }

  const saveEditStockOpname = () => {
    if (!selectedEditOpname) return

    const numericPhysicalStock = Number(editPhysicalStock)

    if (editPhysicalStock === "" || Number.isNaN(numericPhysicalStock)) return

    const systemStock = Number(selectedEditOpname.systemStock || 0)
    const difference = numericPhysicalStock - systemStock

    const updatedHistory = stockOpnameHistory.map((item) => {
      if (item.id !== selectedEditOpname.id) return item

      return {
        ...item,
        physicalStock: numericPhysicalStock,
        difference,
        note: editOpnameNote,
        status:
          difference === 0 ? "Sesuai" : difference > 0 ? "Lebih" : "Kurang",
        updatedAt: new Date().toISOString(),
      }
    })

    localStorage.setItem("stockOpnameHistory", JSON.stringify(updatedHistory))
    setStockOpnameHistory(updatedHistory)

    if (selectedSessionSummary) {
      const updatedSelectedItems = updatedHistory.filter((item) => {
        return item.sessionId === selectedSessionSummary.id
      })

      setSelectedSessionSummary(
        buildSessionSummary(
          selectedSessionSummary,
          updatedSelectedItems,
          selectedSessionSummary.status
        )
      )
    }

    closeEditStockOpnameModal()
  }

  const saveStockOpname = () => {
    if (!selectedStockOpname) return

    const numericPhysicalStock = Number(physicalStock)

    if (physicalStock === "" || Number.isNaN(numericPhysicalStock)) return

    const difference =
      numericPhysicalStock - Number(selectedStockOpname.systemStock || 0)

    const opnameData = {
      id: `SO-${Date.now()}`,
      date: new Date().toISOString(),
      sessionId: activeStockOpnameSession?.id || null,
      sessionName: activeStockOpnameSession?.name || "Tanpa Sesi",
      sessionType: activeStockOpnameSession?.type || "-",
      sessionScheduleDay: activeStockOpnameSession?.scheduleDay || "-",
      productId: selectedStockOpname.productId,
      productName: selectedStockOpname.productName,
      brand: selectedStockOpname.brand,
      category: selectedStockOpname.category,
      rackLocation: selectedStockOpname.rackLocation,
      variantId: selectedStockOpname.variantId,
      variantValue: selectedStockOpname.variantValue,
      sku: selectedStockOpname.sku,
      barcode: selectedStockOpname.barcode,
      systemStock: Number(selectedStockOpname.systemStock || 0),
      physicalStock: numericPhysicalStock,
      difference,
      note: opnameNote,
      status:
        difference === 0 ? "Sesuai" : difference > 0 ? "Lebih" : "Kurang",
    }

    const existingHistory = JSON.parse(
      localStorage.getItem("stockOpnameHistory") || "[]"
    )

    const updatedHistory = [opnameData, ...existingHistory]

    localStorage.setItem("stockOpnameHistory", JSON.stringify(updatedHistory))
    setStockOpnameHistory(updatedHistory)
    setShowOpnameSuccess(true)

    setTimeout(() => {
      closeStockOpnameModal()
    }, 900)
  }

  const deleteStockOpnameHistory = (historyId) => {
    const confirmDelete = window.confirm(
      "Hapus riwayat stok opname ini? Data yang sudah dihapus tidak bisa dikembalikan."
    )

    if (!confirmDelete) return

    const updatedHistory = stockOpnameHistory.filter((item) => {
      return item.id !== historyId
    })

    localStorage.setItem("stockOpnameHistory", JSON.stringify(updatedHistory))
    setStockOpnameHistory(updatedHistory)

    if (selectedSessionSummary) {
      const updatedSelectedItems = selectedSessionSummary.items.filter((item) => {
        return item.id !== historyId
      })

      setSelectedSessionSummary(
        buildSessionSummary(
          selectedSessionSummary,
          updatedSelectedItems,
          selectedSessionSummary.status
        )
      )
    }
  }

  const closeSessionHistoryModal = () => {
    setShowSessionHistory(false)
    setSelectedSessionSummary(null)
  }

  const saveNewProduct = (newProduct) => {
    const updatedProducts = [newProduct, ...productList]

    localStorage.setItem("radProducts", JSON.stringify(updatedProducts))
    setProductList(updatedProducts)
    setShowAddProduct(false)
  }

  return (
    <MainLayout>
      <div className="min-h-screen">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-1 text-sm font-black uppercase tracking-wide text-blue-600">
              Manajemen Barang
            </p>

            <h1 className="text-3xl font-black text-slate-900">
              Stok Barang
            </h1>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Cek stok produk, ukuran, SKU, barcode, dan lokasi rak dengan cepat.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            <button
              onClick={() => setShowCreateSession(true)}
              className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"
            >
              + Buat Sesi SO
            </button>

            <button
              onClick={() => setShowActiveSessionResult(true)}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
            >
              Hasil SO Sesi Ini
            </button>

            <button
              onClick={() => setShowSessionHistory(true)}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-slate-700"
            >
              Riwayat Sesi SO
            </button>

            <button
              onClick={() => setShowOpnameHistory(true)}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              Detail Item SO
            </button>

            <button
              onClick={() => setShowAddProduct(true)}
              className="rounded-2xl bg-blue-50 px-5 py-3 text-sm font-black text-blue-600 shadow-sm transition hover:bg-blue-100"
            >
              + Tambah Produk
            </button>
          </div>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-4">
          <SummaryCard label="Produk" value={totalProducts} color="slate" />
          <SummaryCard label="Varian" value={totalVariants} color="blue" />
          <SummaryCard label="Total Stok" value={totalStock} color="emerald" />
          <SummaryCard label="Perlu Dicek" value={totalNeedCheck} color="amber" />
        </div>

        <ActiveStockOpnameSessionCard
          activeStockOpnameSession={activeStockOpnameSession}
          activeSessionProgress={activeSessionProgress}
          onCreateSession={() => setShowCreateSession(true)}
          onCloseActiveSession={closeActiveStockOpnameSession}
          onOpenActiveSessionResult={() => setShowActiveSessionResult(true)}
          onOpenSessionHistory={() => setShowSessionHistory(true)}
        />

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Data Barang
              </h2>

              <p className="mt-1 text-sm font-semibold text-slate-400">
                Klik detail untuk melihat informasi barang dan stok per ukuran.
              </p>
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama barang, SKU, barcode, ukuran, rak..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 xl:max-w-lg"
            />
          </div>

          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {stockFilters.map((filter) => {
                const isActive = stockFilter === filter

                return (
                  <button
                    key={filter}
                    onClick={() => setStockFilter(filter)}
                    className={`rounded-2xl px-4 py-2 text-sm font-black transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {filter}
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setProductViewMode("Semua")}
                className={`rounded-2xl px-4 py-2 text-sm font-black transition ${
                  productViewMode === "Semua"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
              >
                Semua Produk
              </button>

              <button
                onClick={() => {
                  if (activeStockOpnameSession) {
                    setProductViewMode("Sesuai Sesi")
                  }
                }}
                disabled={!activeStockOpnameSession}
                className={`rounded-2xl px-4 py-2 text-sm font-black transition ${
                  !activeStockOpnameSession
                    ? "cursor-not-allowed bg-slate-100 text-slate-300"
                    : productViewMode === "Sesuai Sesi"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                }`}
              >
                Sesuai Sesi Aktif
              </button>
            </div>
          </div>

          {productViewMode === "Sesuai Sesi" && activeStockOpnameSession && (
            <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-bold leading-relaxed text-emerald-700">
              Mode sesuai sesi aktif sedang digunakan. Menampilkan{" "}
              {sessionProductsCount} produk kategori{" "}
              {activeStockOpnameSession.categories?.join(", ")} untuk sesi{" "}
              {activeStockOpnameSession.type}.
            </div>
          )}

          {!activeStockOpnameSession && (
            <div className="mb-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs font-bold leading-relaxed text-slate-500">
              Buat sesi SO aktif untuk mengaktifkan mode filter produk sesuai
              jadwal SO mingguan.
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <EmptyState text="Produk tidak ditemukan" />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="hidden grid-cols-[1.5fr_0.8fr_0.7fr_0.7fr_0.7fr_auto] gap-4 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-400 xl:grid">
                <span>Barang</span>
                <span>Kategori</span>
                <span>Harga</span>
                <span>Varian</span>
                <span>Stok</span>
                <span>Aksi</span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredProducts.map((product) => {
                  const isExpanded = expandedProductId === product.id
                  const productStock = getTotalStock(product)
                  const minimumStock = getMinimumStock(product)
                  const stockStatus = getStockStatus(
                    productStock,
                    minimumStock
                  )

                  return (
                    <div key={product.id} className="bg-white">
                      <div className="grid gap-4 px-4 py-4 xl:grid-cols-[1.5fr_0.8fr_0.7fr_0.7fr_0.7fr_auto] xl:items-center">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-base font-black text-slate-900">
                              {product.name}
                            </h3>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-black ${stockStatus.badgeClass}`}
                            >
                              {stockStatus.label}
                            </span>
                          </div>

                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {product.brand || "-"}
                          </p>

                          <p className="mt-1 text-xs font-bold text-slate-400">
                            SKU: {product.sku || "-"}
                          </p>

                          <p className="mt-0.5 text-xs font-bold text-slate-400">
                            Barcode: {product.barcode || "-"}
                          </p>

                          <p className="mt-0.5 text-xs font-bold text-slate-400">
                            Rak: {product.rackLocation || "-"}
                          </p>
                        </div>

                        <TableInfo label="Kategori" value={product.category || "-"} />

                        <TableInfo
                          label="Harga"
                          value={formatRupiah(product.price)}
                          strong
                        />

                        <TableInfo
                          label="Varian"
                          value={`${product.variants?.length || 0} ${
                            product.variantType || ""
                          }`}
                        />

                        <div>
                          <p className="text-xs font-bold text-slate-400 xl:hidden">
                            Total Stok
                          </p>
                          <p
                            className={`text-lg font-black ${stockStatus.textClass}`}
                          >
                            {productStock}
                          </p>

                          <p className="text-xs font-bold text-slate-400">
                            Min: {minimumStock || "-"}
                          </p>
                        </div>

                        <button
                          onClick={() => toggleExpandProduct(product.id)}
                          className={`w-full rounded-2xl px-4 py-2.5 text-sm font-black transition xl:w-auto ${
                            isExpanded
                              ? "bg-slate-900 text-white"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {isExpanded ? "Tutup" : "Detail"}
                        </button>
                      </div>

                      {isExpanded && (
                        <ProductDetail
                          product={product}
                          productStock={productStock}
                          minimumStock={minimumStock}
                          stockStatus={stockStatus}
                          formatRupiah={formatRupiah}
                          getVariantMinimumStock={getVariantMinimumStock}
                          getStockStatus={getStockStatus}
                          openStockOpnameModal={openStockOpnameModal}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {showCreateSession && (
          <CreateStockOpnameSessionModal
            stockOpnameTypes={stockOpnameTypes}
            selectedSessionType={selectedSessionType}
            setSelectedSessionType={setSelectedSessionType}
            sessionNote={sessionNote}
            setSessionNote={setSessionNote}
            onClose={() => setShowCreateSession(false)}
            onSubmit={createStockOpnameSession}
          />
        )}

        {selectedStockOpname && (
          <StockOpnameCheckModal
            selectedStockOpname={selectedStockOpname}
            physicalStock={physicalStock}
            setPhysicalStock={setPhysicalStock}
            opnameNote={opnameNote}
            setOpnameNote={setOpnameNote}
            activeStockOpnameSession={activeStockOpnameSession}
            selectedSystemStock={selectedSystemStock}
            selectedDifference={selectedDifference}
            showOpnameSuccess={showOpnameSuccess}
            onClose={closeStockOpnameModal}
            onSubmit={saveStockOpname}
          />
        )}

        {showOpnameHistory && (
          <OpnameHistoryModal
            stockOpnameHistory={stockOpnameHistory}
            filteredStockOpnameHistory={filteredStockOpnameHistory}
            opnameHistoryFilters={opnameHistoryFilters}
            opnameHistoryFilter={opnameHistoryFilter}
            setOpnameHistoryFilter={setOpnameHistoryFilter}
            opnameHistorySessionFilters={opnameHistorySessionFilters}
            opnameHistorySessionFilter={opnameHistorySessionFilter}
            setOpnameHistorySessionFilter={setOpnameHistorySessionFilter}
            opnameHistorySearch={opnameHistorySearch}
            setOpnameHistorySearch={setOpnameHistorySearch}
            totalOpnameHistory={totalOpnameHistory}
            totalOpnameSesuai={totalOpnameSesuai}
            totalOpnameLebih={totalOpnameLebih}
            totalOpnameKurang={totalOpnameKurang}
            formatDateTime={formatDateTime}
            getOpnameStatusClass={getOpnameStatusClass}
            getDifferenceClass={getDifferenceClass}
            formatDifference={formatDifference}
            deleteStockOpnameHistory={deleteStockOpnameHistory}
            openEditStockOpnameModal={openEditStockOpnameModal}
            onClose={() => setShowOpnameHistory(false)}
          />
        )}

        {showActiveSessionResult && (
          <ActiveSessionResultModal
            activeSessionSummary={activeSessionSummary}
            activeStockOpnameSession={activeStockOpnameSession}
            activeSessionProgress={activeSessionProgress}
            formatDateTime={formatDateTime}
            getOpnameStatusClass={getOpnameStatusClass}
            getDifferenceClass={getDifferenceClass}
            formatDifference={formatDifference}
            deleteStockOpnameHistory={deleteStockOpnameHistory}
            openEditStockOpnameModal={openEditStockOpnameModal}
            openStockOpnameModal={openStockOpnameModal}
            onClose={() => setShowActiveSessionResult(false)}
          />
        )}

        {showSessionHistory && (
          <SessionHistoryModal
            stockOpnameSessionSummaries={stockOpnameSessionSummaries}
            filteredStockOpnameSessionSummaries={
              filteredStockOpnameSessionSummaries
            }
            sessionHistoryStatusFilters={sessionHistoryStatusFilters}
            sessionHistoryStatusFilter={sessionHistoryStatusFilter}
            setSessionHistoryStatusFilter={setSessionHistoryStatusFilter}
            sessionHistoryTypeFilters={sessionHistoryTypeFilters}
            sessionHistoryTypeFilter={sessionHistoryTypeFilter}
            setSessionHistoryTypeFilter={setSessionHistoryTypeFilter}
            sessionHistorySearch={sessionHistorySearch}
            setSessionHistorySearch={setSessionHistorySearch}
            totalOpnameSessions={totalOpnameSessions}
            totalActiveSessions={totalActiveSessions}
            totalFinishedSessions={totalFinishedSessions}
            totalCheckedFromSessions={totalCheckedFromSessions}
            selectedSessionSummary={selectedSessionSummary}
            setSelectedSessionSummary={setSelectedSessionSummary}
            formatDateTime={formatDateTime}
            getOpnameStatusClass={getOpnameStatusClass}
            getDifferenceClass={getDifferenceClass}
            formatDifference={formatDifference}
            deleteStockOpnameHistory={deleteStockOpnameHistory}
            openEditStockOpnameModal={openEditStockOpnameModal}
            onClose={closeSessionHistoryModal}
          />
        )}

        {selectedEditOpname && (
          <EditStockOpnameModal
            selectedEditOpname={selectedEditOpname}
            editPhysicalStock={editPhysicalStock}
            setEditPhysicalStock={setEditPhysicalStock}
            editOpnameNote={editOpnameNote}
            setEditOpnameNote={setEditOpnameNote}
            onClose={closeEditStockOpnameModal}
            onSubmit={saveEditStockOpname}
          />
        )}

        {showAddProduct && (
          <AddProductModal
            onClose={() => setShowAddProduct(false)}
            onSave={saveNewProduct}
          />
        )}
      </div>
    </MainLayout>
  )
}

function buildSessionSummary(session, items, status) {
  return {
    ...session,
    status,
    items,
    totalChecked: items.length,
    totalSesuai: countByStatus(items, "Sesuai"),
    totalLebih: countByStatus(items, "Lebih"),
    totalKurang: countByStatus(items, "Kurang"),
  }
}

function countByStatus(items, status) {
  return items.filter((item) => item.status === status).length
}

function getEmptySessionProgress() {
  return {
    targetItems: [],
    checkedItems: [],
    uncheckedItems: [],
    targetTotal: 0,
    checkedTotal: 0,
    uncheckedTotal: 0,
    progressPercent: 0,
  }
}

function getSessionProgressData(session, historyItems, productsData = []) {
  if (!session) return getEmptySessionProgress()

  const targetItems = productsData.flatMap((product) => {
    if (!session.categories?.includes(product.category)) return []

    const variants = product.variants?.length
      ? product.variants
      : [
          {
            id: `${product.id}-default`,
            value: "-",
            sku: product.sku,
            barcode: product.barcode,
            stock: product.stock,
            price: product.price,
          },
        ]

    return variants.map((variant) => ({
      id: getOpnameItemKey({
        productId: product.id,
        variantId: variant.id,
        variantValue: variant.value,
        sku: variant.sku,
        barcode: variant.barcode,
      }),
      product,
      variant,
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      category: product.category,
      rackLocation: product.rackLocation,
      variantId: variant.id,
      variantValue: variant.value,
      sku: variant.sku,
      barcode: variant.barcode,
      systemStock: Number(variant.stock || 0),
    }))
  })

  const checkedItems = historyItems.filter((item) => item.sessionId === session.id)
  const checkedKeys = new Set(checkedItems.map((item) => getOpnameItemKey(item)))
  const checkedTargetItems = targetItems.filter((item) => checkedKeys.has(item.id))
  const uncheckedItems = targetItems.filter((item) => !checkedKeys.has(item.id))
  const targetTotal = targetItems.length
  const checkedTotal = checkedTargetItems.length
  const uncheckedTotal = uncheckedItems.length
  const progressPercent = targetTotal
    ? Math.round((checkedTotal / targetTotal) * 100)
    : 0

  return {
    targetItems,
    checkedItems,
    uncheckedItems,
    targetTotal,
    checkedTotal,
    uncheckedTotal,
    progressPercent,
  }
}

function getOpnameItemKey(item) {
  return [
    item.productId || "-",
    item.variantId || item.variantValue || item.sku || item.barcode || "-",
  ].join("::")
}

function SummaryCard({ label, value, color }) {
  const colorClass = {
    slate: "text-slate-900",
    blue: "text-blue-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    red: "text-red-600",
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-black ${colorClass[color]}`}>
        {value}
      </p>
    </div>
  )
}

function TableInfo({ label, value, strong = false }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 xl:hidden">{label}</p>
      <p
        className={`text-sm ${
          strong ? "font-black text-slate-900" : "font-black text-slate-700"
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-400">
      {text}
    </div>
  )
}

function ProductDetail({
  product,
  productStock,
  minimumStock,
  stockStatus,
  formatRupiah,
  getVariantMinimumStock,
  getStockStatus,
  openStockOpnameModal,
}) {
  return (
    <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
      <div className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Harga Jual" value={formatRupiah(product.price)} />
        <DetailItem label="SKU Barang" value={product.sku || "-"} breakText />
        <DetailItem
          label="Barcode Barang"
          value={product.barcode || "-"}
          breakText
        />
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            Total Stok
          </p>
          <p className={`mt-1 text-lg font-black ${stockStatus.textClass}`}>
            {productStock}
          </p>
        </div>
        <DetailItem label="Brand" value={product.brand || "-"} />
        <DetailItem label="Kategori" value={product.category || "-"} />
        <DetailItem label="Stok Minimum" value={minimumStock || "-"} />
        <DetailItem label="Letak Rak" value={product.rackLocation || "-"} />
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
          Keterangan
        </p>
        <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-600">
          {product.description || "-"}
        </p>
      </div>

      <div className="mb-3">
        <p className="text-sm font-black text-slate-800">
          Stok Per {product.variantType || "Varian"}
        </p>
        <p className="text-xs font-semibold text-slate-400">
          Fokus utama tabel ini adalah stok fisik per ukuran untuk membantu
          proses stok opname.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[0.45fr_0.45fr_0.65fr_1.15fr_1.15fr_0.75fr_0.45fr] gap-3 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-400">
            <span>Ukuran</span>
            <span>Stok</span>
            <span>Status</span>
            <span>SKU</span>
            <span>Barcode</span>
            <span className="text-right">Harga</span>
            <span className="text-right">Aksi</span>
          </div>

          <div className="divide-y divide-slate-100">
            {product.variants?.map((variant) => {
              const variantStock = Number(variant.stock || 0)
              const variantMinimumStock = getVariantMinimumStock(
                product,
                variant
              )
              const variantStatus = getStockStatus(
                variantStock,
                variantMinimumStock
              )

              return (
                <div
                  key={variant.id || variant.value}
                  className="grid grid-cols-[0.45fr_0.45fr_0.65fr_1.15fr_1.15fr_0.75fr_0.45fr] gap-3 px-4 py-3 text-sm font-bold text-slate-700"
                >
                  <span className="font-black text-slate-900">
                    {variant.value}
                  </span>

                  <span className={`font-black ${variantStatus.textClass}`}>
                    {variantStock}
                  </span>

                  <span>
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-xs font-black ${variantStatus.badgeClass}`}
                    >
                      {variantStatus.label}
                    </span>
                  </span>

                  <span className="break-all text-xs text-slate-500">
                    {variant.sku || "-"}
                  </span>

                  <span className="break-all text-xs text-slate-500">
                    {variant.barcode || "-"}
                  </span>

                  <span className="text-right text-xs font-black text-slate-900">
                    {formatRupiah(variant.price)}
                  </span>

                  <span className="text-right">
                    <button
                      onClick={() => openStockOpnameModal(product, variant)}
                      className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-black text-white transition hover:bg-slate-700"
                    >
                      SO
                    </button>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-blue-50 px-4 py-3 text-xs font-bold text-blue-600">
        Catatan: warna dan status stok tetap dihitung dari stok minimum
        masing-masing ukuran, tapi angka minimum tidak ditampilkan di tabel agar
        staff gudang fokus pada stok fisik saat stok opname.
      </div>
    </div>
  )
}

function DetailItem({ label, value, breakText = false }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-black text-slate-900 ${
          breakText ? "break-all" : ""
        }`}
      >
        {value}
      </p>
    </div>
  )
}

export default StokBarang