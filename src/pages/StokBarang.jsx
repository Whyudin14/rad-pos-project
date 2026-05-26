import { useEffect, useMemo, useState } from "react"
import MainLayout from "../layouts/MainLayout"
import { products } from "../data/dummyProducts"
import ActiveStockOpnameSessionCard from "../components/stock-opname/ActiveStockOpnameSessionCard"
import {
  ModalWrapper,
  ModalHeader,
  ModalFooter,
} from "../components/stock-opname/StockOpnameModalLayout"

function StokBarang() {
  const [searchTerm, setSearchTerm] = useState("")
  const [stockFilter, setStockFilter] = useState("Semua")
  const [productViewMode, setProductViewMode] = useState("Semua")
  const [expandedProductId, setExpandedProductId] = useState(null)
  const [showComingSoon, setShowComingSoon] = useState(false)

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

  const totalProducts = products.length

  const totalVariants = products.reduce((total, product) => {
    return total + Number(product.variants?.length || 0)
  }, 0)

  const totalStock = products.reduce((total, product) => {
    return total + getTotalStock(product)
  }, 0)

  const totalNeedCheck = products.filter((product) => {
    const stock = getTotalStock(product)
    const minimumStock = getMinimumStock(product)
    const status = getStockStatus(stock, minimumStock)

    return status.label === "Menipis" || status.label === "Kosong"
  }).length

  const sessionProductsCount = activeStockOpnameSession
    ? products.filter((product) => isProductMatchActiveSession(product)).length
    : 0

  const filteredProducts = products.filter((product) => {
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

  const activeSessionCheckedItems = activeStockOpnameSession
    ? stockOpnameHistory.filter((item) => {
        return item.sessionId === activeStockOpnameSession.id
      }).length
    : 0

  const activeSessionSummary = activeStockOpnameSession
    ? getSessionSummary(activeStockOpnameSession)
    : null

  const activeSessionProgress = activeStockOpnameSession
    ? getSessionProgressData(activeStockOpnameSession, stockOpnameHistory)
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
              onClick={() => setShowComingSoon(true)}
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
          <CreateSessionModal
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
          <StockOpnameModal
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

        {showComingSoon && (
          <InfoModal onClose={() => setShowComingSoon(false)} />
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

function getBrandFilters(items) {
  return [
    "Semua Brand",
    ...Array.from(new Set(items.map((item) => item.brand).filter(Boolean))),
  ]
}

function filterItemsByBrand(items, brandFilter) {
  if (brandFilter === "Semua Brand") return items
  return items.filter((item) => item.brand === brandFilter)
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

function getSessionProgressData(session, historyItems) {
  if (!session) return getEmptySessionProgress()

  const targetItems = products.flatMap((product) => {
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

function CreateSessionModal({
  stockOpnameTypes,
  selectedSessionType,
  setSelectedSessionType,
  sessionNote,
  setSessionNote,
  onClose,
  onSubmit,
}) {
  return (
    <ModalWrapper maxWidth="max-w-4xl">
      <ModalHeader
        eyebrow="Sesi Stok Opname"
        title="Buat Sesi SO"
        description="Pilih jenis SO sesuai jadwal mingguan RAD Sport."
        color="emerald"
        onClose={onClose}
      />

      <div className="overflow-y-auto px-5 py-4 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {stockOpnameTypes.map((item) => {
            const isActive = selectedSessionType === item.type

            return (
              <button
                key={item.type}
                onClick={() => setSelectedSessionType(item.type)}
                className={`rounded-2xl border p-4 text-left transition ${
                  isActive
                    ? "border-emerald-300 bg-emerald-50 ring-4 ring-emerald-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <p
                  className={`text-xl font-black ${
                    isActive ? "text-emerald-700" : "text-slate-900"
                  }`}
                >
                  {item.type}
                </p>

                <p className="mt-1 text-sm font-black text-slate-500">
                  Jadwal: {item.scheduleDay}
                </p>

                <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-400">
                  Kategori: {item.categories.join(", ")}
                </p>
              </button>
            )
          })}
        </div>

        <div className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-xs font-bold leading-relaxed text-blue-600">
          Catatan: bola sepak fisik masuk ke Aksesoris. Sepatu bola pakai
          kategori Football dan Football Junior.
        </div>

        <div className="mt-4">
          <label className="text-xs font-black uppercase tracking-wide text-slate-400">
            Catatan Sesi
          </label>
          <textarea
            value={sessionNote}
            onChange={(e) => setSessionNote(e.target.value)}
            placeholder="Contoh: SO closing mingguan, cek rak display dan gudang..."
            className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
          />
        </div>
      </div>

      <ModalFooter>
        <button
          onClick={onClose}
          className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-200"
        >
          Batal
        </button>

        <button
          onClick={onSubmit}
          disabled={!selectedSessionType}
          className={`rounded-2xl px-5 py-3 text-sm font-black text-white transition ${
            !selectedSessionType
              ? "cursor-not-allowed bg-slate-300"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          Buat Sesi
        </button>
      </ModalFooter>
    </ModalWrapper>
  )
}

function StockOpnameModal({
  selectedStockOpname,
  physicalStock,
  setPhysicalStock,
  opnameNote,
  setOpnameNote,
  activeStockOpnameSession,
  selectedSystemStock,
  selectedDifference,
  showOpnameSuccess,
  onClose,
  onSubmit,
}) {
  return (
    <ModalWrapper maxWidth="max-w-3xl">
      <ModalHeader
        eyebrow="Stok Opname"
        title="Cek Stok Fisik"
        description="Input stok fisik sesuai hasil hitung barang di rak dan gudang."
        color="blue"
        onClose={onClose}
      />

      <div className="overflow-y-auto px-5 py-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-2xl font-black text-slate-900">
            {selectedStockOpname.productName}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem label="Ukuran" value={selectedStockOpname.variantValue} />
            <DetailItem
              label="Letak Rak"
              value={selectedStockOpname.rackLocation || "-"}
            />
            <DetailItem label="SKU" value={selectedStockOpname.sku || "-"} breakText />
            <DetailItem
              label="Barcode"
              value={selectedStockOpname.barcode || "-"}
              breakText
            />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-600">
            Sesi SO
          </p>
          <p className="mt-1 text-sm font-black text-emerald-700">
            {activeStockOpnameSession
              ? activeStockOpnameSession.name
              : "Tanpa sesi aktif"}
          </p>
          {!activeStockOpnameSession && (
            <p className="mt-1 text-xs font-bold text-emerald-600">
              Data tetap bisa disimpan, tapi sebaiknya buat sesi SO dulu agar
              riwayat lebih rapi.
            </p>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <StockNumberBox label="Stok Sistem" value={selectedSystemStock} />

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Stok Fisik
            </p>
            <input
              type="number"
              min="0"
              value={physicalStock}
              onChange={(e) => setPhysicalStock(e.target.value)}
              placeholder="0"
              className="mt-2 w-full bg-transparent text-3xl font-black text-slate-900 outline-none placeholder:text-slate-300"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Selisih
            </p>
            <p
              className={`mt-2 text-3xl font-black ${
                physicalStock === ""
                  ? "text-slate-300"
                  : selectedDifference === 0
                  ? "text-emerald-600"
                  : selectedDifference > 0
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
            >
              {physicalStock === ""
                ? "-"
                : selectedDifference > 0
                ? `+${selectedDifference}`
                : selectedDifference}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-black uppercase tracking-wide text-slate-400">
            Catatan
          </label>
          <textarea
            value={opnameNote}
            onChange={(e) => setOpnameNote(e.target.value)}
            placeholder="Contoh: barang ada di display, dus belum dicek, selisih karena retur, dll."
            className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          />
        </div>

        {showOpnameSuccess && (
          <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-600">
            Data stok opname berhasil disimpan.
          </div>
        )}
      </div>

      <ModalFooter>
        <button
          onClick={onClose}
          className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-200"
        >
          Batal
        </button>

        <button
          onClick={onSubmit}
          disabled={physicalStock === ""}
          className={`rounded-2xl px-5 py-3 text-sm font-black text-white transition ${
            physicalStock === ""
              ? "cursor-not-allowed bg-slate-300"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Simpan SO
        </button>
      </ModalFooter>
    </ModalWrapper>
  )
}

function StockNumberBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
    </div>
  )
}

function OpnameHistoryModal({
  stockOpnameHistory,
  filteredStockOpnameHistory,
  opnameHistoryFilters,
  opnameHistoryFilter,
  setOpnameHistoryFilter,
  opnameHistorySessionFilters,
  opnameHistorySessionFilter,
  setOpnameHistorySessionFilter,
  opnameHistorySearch,
  setOpnameHistorySearch,
  totalOpnameHistory,
  totalOpnameSesuai,
  totalOpnameLebih,
  totalOpnameKurang,
  formatDateTime,
  getOpnameStatusClass,
  getDifferenceClass,
  formatDifference,
  deleteStockOpnameHistory,
  openEditStockOpnameModal,
  onClose,
}) {
  return (
    <ModalWrapper maxWidth="max-w-7xl" tall>
      <ModalHeader
        eyebrow="Detail Item"
        title="Detail Item SO"
        description="Cek riwayat item SO secara global berdasarkan sesi, status, barang, ukuran, SKU, rak, dan catatan."
        color="blue"
        onClose={onClose}
      />

      <div className="flex flex-1 flex-col overflow-hidden px-5 py-4 sm:px-6">
        <div className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MiniSummary label="Total SO" value={totalOpnameHistory} color="slate" />
          <MiniSummary label="Sesuai" value={totalOpnameSesuai} color="emerald" />
          <MiniSummary label="Lebih" value={totalOpnameLebih} color="blue" />
          <MiniSummary label="Kurang" value={totalOpnameKurang} color="red" />
        </div>

        <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-1 flex-col gap-3">
              <FilterGroup
                label="Filter Status"
                filters={opnameHistoryFilters}
                value={opnameHistoryFilter}
                onChange={setOpnameHistoryFilter}
                activeClass="bg-slate-900 text-white"
                inactiveClass="bg-white text-slate-500 hover:bg-slate-100"
              />

              <FilterGroup
                label="Filter Jenis Sesi"
                filters={opnameHistorySessionFilters}
                value={opnameHistorySessionFilter}
                onChange={setOpnameHistorySessionFilter}
                activeClass="bg-emerald-600 text-white"
                inactiveClass="bg-white text-emerald-600 hover:bg-emerald-50"
              />
            </div>

            <div className="w-full xl:max-w-sm">
              <input
                type="text"
                value={opnameHistorySearch}
                onChange={(e) => setOpnameHistorySearch(e.target.value)}
                placeholder="Cari detail item SO..."
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              />

              <p className="mt-2 text-xs font-bold text-blue-600">
                Menampilkan {filteredStockOpnameHistory.length} dari{" "}
                {stockOpnameHistory.length} detail item SO.
              </p>
            </div>
          </div>
        </div>

        {stockOpnameHistory.length === 0 ? (
          <EmptyModalState text="Belum ada detail item stok opname" />
        ) : filteredStockOpnameHistory.length === 0 ? (
          <EmptyModalState text="Detail item SO tidak ditemukan" />
        ) : (
          <OpnameHistoryTable
            items={filteredStockOpnameHistory}
            formatDateTime={formatDateTime}
            getOpnameStatusClass={getOpnameStatusClass}
            getDifferenceClass={getDifferenceClass}
            formatDifference={formatDifference}
            deleteStockOpnameHistory={deleteStockOpnameHistory}
            openEditStockOpnameModal={openEditStockOpnameModal}
            showAction
          />
        )}
      </div>
    </ModalWrapper>
  )
}

function ActiveSessionResultModal({
  activeSessionSummary,
  activeStockOpnameSession,
  activeSessionProgress,
  formatDateTime,
  getOpnameStatusClass,
  getDifferenceClass,
  formatDifference,
  deleteStockOpnameHistory,
  openEditStockOpnameModal,
  openStockOpnameModal,
  onClose,
}) {
  const [brandFilter, setBrandFilter] = useState("Semua Brand")
  const [resultTab, setResultTab] = useState("Sudah Dicek")

  const sessionItems = activeSessionSummary?.items || []
  const targetItems = activeSessionProgress?.targetItems || []
  const uncheckedItems = activeSessionProgress?.uncheckedItems || []
  const brandFilters = getBrandFilters(targetItems)

  const checkedFilteredItems = filterItemsByBrand(sessionItems, brandFilter)
  const uncheckedFilteredItems = filterItemsByBrand(uncheckedItems, brandFilter)
  const displayedItems =
    resultTab === "Sudah Dicek" ? checkedFilteredItems : uncheckedFilteredItems

  return (
    <ModalWrapper maxWidth="max-w-7xl" tall>
      <ModalHeader
        eyebrow="Sesi Aktif"
        title="Hasil SO Sesi Ini"
        description="Dipakai staff gudang untuk melihat progress, item yang sudah dicek, dan item yang belum dicek pada sesi aktif."
        color="blue"
        onClose={onClose}
      />

      <div className="flex flex-1 flex-col overflow-hidden px-5 py-4 sm:px-6">
        {!activeStockOpnameSession ? (
          <EmptyModalState text="Belum ada sesi SO aktif. Buat sesi SO dulu untuk mulai pengecekan stok." />
        ) : (
          <>
            <SessionProgressHeader
              activeStockOpnameSession={activeStockOpnameSession}
              activeSessionProgress={activeSessionProgress}
              formatDateTime={formatDateTime}
            />

            <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
                    Status Cek
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setResultTab("Sudah Dicek")}
                      className={`rounded-xl px-4 py-2 text-xs font-black transition ${
                        resultTab === "Sudah Dicek"
                          ? "bg-emerald-600 text-white"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      Sudah Dicek
                    </button>

                    <button
                      onClick={() => setResultTab("Belum Dicek")}
                      className={`rounded-xl px-4 py-2 text-xs font-black transition ${
                        resultTab === "Belum Dicek"
                          ? "bg-amber-500 text-white"
                          : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                      }`}
                    >
                      Belum Dicek
                    </button>
                  </div>
                </div>

                <div className="xl:flex-1 xl:max-w-xl">
                  <FilterGroup
                    label="Filter Brand"
                    filters={brandFilters}
                    value={brandFilter}
                    onChange={setBrandFilter}
                    activeClass="bg-slate-900 text-white"
                    inactiveClass="bg-slate-100 text-slate-600 hover:bg-slate-200"
                  />
                </div>
              </div>

              <p className="mt-2 text-xs font-bold text-slate-500">
                Menampilkan {displayedItems.length} item dari tab {resultTab}.
              </p>
            </div>

            {resultTab === "Sudah Dicek" ? (
              sessionItems.length === 0 ? (
                <EmptyModalState text="Belum ada item yang dicek pada sesi aktif ini" />
              ) : checkedFilteredItems.length === 0 ? (
                <EmptyModalState text="Tidak ada item yang sudah dicek untuk brand yang dipilih" />
              ) : (
                <OpnameHistoryTable
                  items={checkedFilteredItems}
                  formatDateTime={formatDateTime}
                  getOpnameStatusClass={getOpnameStatusClass}
                  getDifferenceClass={getDifferenceClass}
                  formatDifference={formatDifference}
                  deleteStockOpnameHistory={deleteStockOpnameHistory}
                  openEditStockOpnameModal={openEditStockOpnameModal}
                  showAction
                />
              )
            ) : targetItems.length === 0 ? (
              <EmptyModalState text="Tidak ada target item pada sesi aktif ini" />
            ) : uncheckedFilteredItems.length === 0 ? (
              <EmptyModalState text="Semua item untuk brand yang dipilih sudah dicek" />
            ) : (
              <UncheckedTargetTable
                items={uncheckedFilteredItems}
                openStockOpnameModal={openStockOpnameModal}
              />
            )}
          </>
        )}
      </div>
    </ModalWrapper>
  )
}

function SessionProgressHeader({
  activeStockOpnameSession,
  activeSessionProgress,
  formatDateTime,
}) {
  return (
    <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-black uppercase tracking-wide text-blue-600">
              Sesi SO Aktif
            </p>

            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-600">
              {activeSessionProgress.progressPercent}% selesai
            </span>
          </div>

          <h4 className="mt-1 truncate text-xl font-black text-slate-900">
            {activeStockOpnameSession.name}
          </h4>

          <p className="mt-1 text-xs font-bold text-slate-500">
            {activeStockOpnameSession.scheduleDay} • {activeStockOpnameSession.type} • Mulai: {formatDateTime(activeStockOpnameSession.createdAt)}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-4 xl:min-w-[520px]">
          <CompactProgressStat label="Target" value={activeSessionProgress.targetTotal} />
          <CompactProgressStat
            label="Sudah"
            value={activeSessionProgress.checkedTotal}
            color="emerald"
          />
          <CompactProgressStat
            label="Belum"
            value={activeSessionProgress.uncheckedTotal}
            color="amber"
          />
          <CompactProgressStat
            label="Progress"
            value={`${activeSessionProgress.progressPercent}%`}
            color="blue"
          />
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between gap-3">
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
            Progress
          </p>
          <p className="text-[11px] font-black text-emerald-600">
            {activeSessionProgress.checkedTotal} / {activeSessionProgress.targetTotal} item
          </p>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${activeSessionProgress.progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function CompactProgressStat({ label, value, color = "slate" }) {
  const style = {
    slate: "border-slate-200 bg-white text-slate-900",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-600",
    amber: "border-amber-100 bg-amber-50 text-amber-600",
    blue: "border-blue-100 bg-blue-50 text-blue-600",
    red: "border-red-100 bg-red-50 text-red-600",
  }

  return (
    <div className={`rounded-xl border px-3 py-2 shadow-sm ${style[color]}`}>
      <p className="text-[10px] font-black uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-0.5 text-xl font-black">{value}</p>
    </div>
  )
}

function UncheckedTargetTable({ items, openStockOpnameModal }) {
  return (
    <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
      <div className="hidden grid-cols-[1.4fr_0.7fr_0.45fr_0.45fr_1fr_1fr_0.65fr_0.4fr] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-wide text-slate-400 xl:grid">
        <span>Barang</span>
        <span>Kategori</span>
        <span>Ukuran</span>
        <span>Sistem</span>
        <span>SKU</span>
        <span>Barcode</span>
        <span>Rak</span>
        <span className="text-right">Aksi</span>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid gap-3 px-4 py-3 text-sm font-bold text-slate-700 xl:grid-cols-[1.4fr_0.7fr_0.45fr_0.45fr_1fr_1fr_0.65fr_0.4fr] xl:items-start"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 xl:hidden">
                Barang
              </p>
              <p className="truncate text-sm font-black text-slate-900">
                {item.productName}
              </p>
              <p className="mt-0.5 truncate text-xs font-bold text-slate-500">
                Brand: {item.brand || "-"}
              </p>
            </div>

            <SessionTableText label="Kategori" value={item.category || "-"} />
            <SessionTableText label="Ukuran" value={item.variantValue || "-"} strong />
            <SessionTableText label="Sistem" value={item.systemStock} strong />
            <SessionTableText label="SKU" value={item.sku || "-"} small />
            <SessionTableText label="Barcode" value={item.barcode || "-"} small />
            <SessionTableText label="Rak" value={item.rackLocation || "-"} small />

            <div className="flex xl:justify-end">
              <button
                onClick={() => openStockOpnameModal(item.product, item.variant)}
                className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-black text-white transition hover:bg-slate-700"
              >
                SO
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SessionHistoryModal({
  stockOpnameSessionSummaries,
  filteredStockOpnameSessionSummaries,
  sessionHistoryStatusFilters,
  sessionHistoryStatusFilter,
  setSessionHistoryStatusFilter,
  sessionHistoryTypeFilters,
  sessionHistoryTypeFilter,
  setSessionHistoryTypeFilter,
  sessionHistorySearch,
  setSessionHistorySearch,
  totalOpnameSessions,
  totalActiveSessions,
  totalFinishedSessions,
  totalCheckedFromSessions,
  selectedSessionSummary,
  setSelectedSessionSummary,
  formatDateTime,
  getOpnameStatusClass,
  getDifferenceClass,
  formatDifference,
  deleteStockOpnameHistory,
  openEditStockOpnameModal,
  onClose,
}) {
  return (
    <ModalWrapper maxWidth="max-w-7xl" tall>
      <ModalHeader
        eyebrow="Ringkasan Sesi"
        title="Riwayat Sesi Stok Opname"
        description="Pantau rekap SO per sesi: total item dicek, sesuai, lebih, dan kurang."
        color="emerald"
        onClose={onClose}
      />

      <div className="flex flex-1 flex-col overflow-hidden px-5 py-4 sm:px-6">
        {!selectedSessionSummary ? (
          <>
            <div className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MiniSummary label="Total Sesi" value={totalOpnameSessions} />
              <MiniSummary
                label="Sesi Aktif"
                value={totalActiveSessions}
                color="emerald"
              />
              <MiniSummary
                label="Selesai"
                value={totalFinishedSessions}
                color="blue"
              />
              <MiniSummary
                label="Total Item Dicek"
                value={totalCheckedFromSessions}
                color="amber"
              />
            </div>

            <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div className="flex flex-1 flex-col gap-3">
                  <FilterGroup
                    label="Filter Status Sesi"
                    filters={sessionHistoryStatusFilters}
                    value={sessionHistoryStatusFilter}
                    onChange={setSessionHistoryStatusFilter}
                    activeClass="bg-slate-900 text-white"
                    inactiveClass="bg-white text-slate-500 hover:bg-slate-100"
                  />

                  <FilterGroup
                    label="Filter Jenis Sesi"
                    filters={sessionHistoryTypeFilters}
                    value={sessionHistoryTypeFilter}
                    onChange={setSessionHistoryTypeFilter}
                    activeClass="bg-emerald-600 text-white"
                    inactiveClass="bg-white text-emerald-600 hover:bg-emerald-50"
                  />
                </div>

                <div className="w-full xl:max-w-sm">
                  <input
                    type="text"
                    value={sessionHistorySearch}
                    onChange={(e) => setSessionHistorySearch(e.target.value)}
                    placeholder="Cari sesi SO..."
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                  />

                  <p className="mt-2 text-xs font-bold text-emerald-600">
                    Menampilkan {filteredStockOpnameSessionSummaries.length}{" "}
                    dari {stockOpnameSessionSummaries.length} sesi SO.
                  </p>
                </div>
              </div>
            </div>

            {stockOpnameSessionSummaries.length === 0 ? (
              <EmptyModalState text="Belum ada riwayat sesi stok opname" />
            ) : filteredStockOpnameSessionSummaries.length === 0 ? (
              <EmptyModalState text="Sesi SO tidak ditemukan" />
            ) : (
              <SessionListTable
                sessions={filteredStockOpnameSessionSummaries}
                formatDateTime={formatDateTime}
                setSelectedSessionSummary={setSelectedSessionSummary}
              />
            )}
          </>
        ) : (
          <SessionDetail
            selectedSessionSummary={selectedSessionSummary}
            setSelectedSessionSummary={setSelectedSessionSummary}
            formatDateTime={formatDateTime}
            getOpnameStatusClass={getOpnameStatusClass}
            getDifferenceClass={getDifferenceClass}
            formatDifference={formatDifference}
            deleteStockOpnameHistory={deleteStockOpnameHistory}
            openEditStockOpnameModal={openEditStockOpnameModal}
          />
        )}
      </div>
    </ModalWrapper>
  )
}

function SessionListTable({
  sessions,
  formatDateTime,
  setSelectedSessionSummary,
}) {
  return (
    <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
      <div className="hidden grid-cols-[1.45fr_0.6fr_0.55fr_0.5fr_0.45fr_0.45fr_0.45fr_0.65fr_0.45fr] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-wide text-slate-400 xl:grid">
        <span>Sesi</span>
        <span>Jadwal</span>
        <span>Status</span>
        <span>Dicek</span>
        <span>Sesuai</span>
        <span>Lebih</span>
        <span>Kurang</span>
        <span>Mulai</span>
        <span className="text-right">Aksi</span>
      </div>

      <div className="divide-y divide-slate-100">
        {sessions.map((session) => {
          const isActiveSession = session.status === "Aktif"

          return (
            <div
              key={session.id}
              className="grid gap-3 px-4 py-3 text-sm font-bold text-slate-700 xl:grid-cols-[1.45fr_0.6fr_0.55fr_0.5fr_0.45fr_0.45fr_0.45fr_0.65fr_0.45fr] xl:items-start"
            >
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 xl:hidden">
                  Sesi
                </p>

                <p className="truncate text-sm font-black text-slate-900">
                  {session.name}
                </p>

                <p className="mt-0.5 text-xs font-bold text-slate-400">
                  {session.type} • {session.categories?.join(", ")}
                </p>

                {session.note && (
                  <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-400">
                    Catatan: {session.note}
                  </p>
                )}
              </div>

              <SessionTableText label="Jadwal" value={session.scheduleDay} />

              <div>
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 xl:hidden">
                  Status
                </p>
                <span
                  className={`inline-flex rounded-full border px-2 py-1 text-xs font-black ${
                    isActiveSession
                      ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                      : "border-blue-100 bg-blue-50 text-blue-600"
                  }`}
                >
                  {session.status}
                </span>
              </div>

              <SessionTableText label="Dicek" value={session.totalChecked} strong />
              <SessionTableText
                label="Sesuai"
                value={session.totalSesuai}
                color="text-emerald-600"
                strong
              />
              <SessionTableText
                label="Lebih"
                value={session.totalLebih}
                color="text-blue-600"
                strong
              />
              <SessionTableText
                label="Kurang"
                value={session.totalKurang}
                color="text-red-600"
                strong
              />

              <SessionTableText
                label="Mulai"
                value={formatDateTime(session.createdAt)}
                small
              />

              <div className="flex xl:justify-end">
                <button
                  onClick={() => setSelectedSessionSummary(session)}
                  className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-black text-white transition hover:bg-slate-700"
                >
                  Detail
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SessionDetail({
  selectedSessionSummary,
  setSelectedSessionSummary,
  formatDateTime,
  getOpnameStatusClass,
  getDifferenceClass,
  formatDifference,
  deleteStockOpnameHistory,
  openEditStockOpnameModal,
}) {
  const [brandFilter, setBrandFilter] = useState("Semua Brand")
  const brandFilters = getBrandFilters(selectedSessionSummary.items)
  const filteredItems = filterItemsByBrand(
    selectedSessionSummary.items,
    brandFilter
  )

  return (
    <>
      <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <button
              onClick={() => setSelectedSessionSummary(null)}
              className="mb-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100"
            >
              ← Kembali ke daftar sesi
            </button>

            <p className="text-xs font-black uppercase tracking-wide text-emerald-600">
              Detail Sesi SO
            </p>

            <h4 className="mt-1 truncate text-xl font-black text-slate-900">
              {selectedSessionSummary.name}
            </h4>

            <p className="mt-1 text-xs font-bold text-slate-500">
              {selectedSessionSummary.scheduleDay} • {selectedSessionSummary.type} • {selectedSessionSummary.status}
            </p>

            <p className="mt-1 text-xs font-bold text-slate-400">
              Mulai: {formatDateTime(selectedSessionSummary.createdAt)} • Selesai: {formatDateTime(selectedSessionSummary.finishedAt)}
            </p>

            {selectedSessionSummary.note && (
              <p className="mt-1 line-clamp-1 text-xs font-semibold leading-relaxed text-slate-500">
                Catatan: {selectedSessionSummary.note}
              </p>
            )}
          </div>

          <div className="w-full xl:max-w-2xl">
            <div className="grid gap-2 sm:grid-cols-4">
              <CompactProgressStat label="Ditampilkan" value={filteredItems.length} />
              <CompactProgressStat
                label="Sesuai"
                value={countByStatus(filteredItems, "Sesuai")}
                color="emerald"
              />
              <CompactProgressStat
                label="Lebih"
                value={countByStatus(filteredItems, "Lebih")}
                color="blue"
              />
              <CompactProgressStat
                label="Kurang"
                value={countByStatus(filteredItems, "Kurang")}
                color="red"
              />
            </div>

            <div className="mt-2 rounded-xl border border-slate-200 bg-white p-2">
              <FilterGroup
                label="Filter Brand"
                filters={brandFilters}
                value={brandFilter}
                onChange={setBrandFilter}
                activeClass="bg-slate-900 text-white"
                inactiveClass="bg-slate-100 text-slate-600 hover:bg-slate-200"
              />

              <p className="mt-1 text-[11px] font-bold text-slate-400">
                Menampilkan {filteredItems.length} dari {selectedSessionSummary.items.length} item.
              </p>
            </div>
          </div>
        </div>
      </div>

      {selectedSessionSummary.items.length === 0 ? (
        <EmptyModalState text="Belum ada item yang dicek pada sesi ini" />
      ) : filteredItems.length === 0 ? (
        <EmptyModalState text="Tidak ada item untuk brand yang dipilih" />
      ) : (
        <OpnameHistoryTable
          items={filteredItems}
          formatDateTime={formatDateTime}
          getOpnameStatusClass={getOpnameStatusClass}
          getDifferenceClass={getDifferenceClass}
          formatDifference={formatDifference}
          deleteStockOpnameHistory={deleteStockOpnameHistory}
          openEditStockOpnameModal={openEditStockOpnameModal}
          showAction
        />
      )}
    </>
  )
}

function SessionDetailHeader({ eyebrow, title, subtitle, timeText, note, items }) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-blue-600">
          {eyebrow}
        </p>

        <h4 className="mt-1 text-2xl font-black text-slate-900">{title}</h4>

        <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>

        <p className="mt-1 text-xs font-bold text-slate-400">{timeText}</p>

        {note && (
          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
            Catatan: {note}
          </p>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-4 lg:min-w-[460px]">
        <MiniSummary label="Ditampilkan" value={items.length} />
        <MiniSummary
          label="Sesuai"
          value={countByStatus(items, "Sesuai")}
          color="emerald"
        />
        <MiniSummary
          label="Lebih"
          value={countByStatus(items, "Lebih")}
          color="blue"
        />
        <MiniSummary
          label="Kurang"
          value={countByStatus(items, "Kurang")}
          color="red"
        />
      </div>
    </div>
  )
}

function BrandFilterPanel({
  brandFilters,
  brandFilter,
  setBrandFilter,
  shownCount,
  totalCount,
  color,
}) {
  const colorStyle =
    color === "blue"
      ? {
          activeClass: "bg-blue-600 text-white",
          inactiveClass: "bg-blue-50 text-blue-600 hover:bg-blue-100",
          textClass: "text-blue-600",
        }
      : {
          activeClass: "bg-slate-900 text-white",
          inactiveClass: "bg-slate-100 text-slate-600 hover:bg-slate-200",
          textClass: "text-slate-500",
        }

  return (
    <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-3">
      <FilterGroup
        label="Filter Brand"
        filters={brandFilters}
        value={brandFilter}
        onChange={setBrandFilter}
        activeClass={colorStyle.activeClass}
        inactiveClass={colorStyle.inactiveClass}
      />

      <p className={`mt-2 text-xs font-bold ${colorStyle.textClass}`}>
        Menampilkan {shownCount} dari {totalCount} item.
      </p>
    </div>
  )
}

function OpnameHistoryTable({
  items,
  formatDateTime,
  getOpnameStatusClass,
  getDifferenceClass,
  formatDifference,
  deleteStockOpnameHistory,
  openEditStockOpnameModal,
  showAction = false,
}) {
  return (
    <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
      <div
        className={`hidden gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-wide text-slate-400 xl:grid ${
          showAction
            ? "grid-cols-[0.95fr_1.45fr_0.45fr_0.45fr_0.45fr_0.5fr_0.6fr_1fr_0.35fr]"
            : "grid-cols-[0.95fr_1.45fr_0.45fr_0.45fr_0.45fr_0.5fr_0.6fr_1fr]"
        }`}
      >
        <span>Tanggal</span>
        <span>Barang</span>
        <span>Ukuran</span>
        <span>Sistem</span>
        <span>Fisik</span>
        <span>Selisih</span>
        <span>Status</span>
        <span>Catatan</span>
        {showAction && <span className="text-right">Aksi</span>}
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item) => {
          return (
            <div
              key={item.id}
              className={`grid gap-3 px-4 py-3 text-sm font-bold text-slate-700 xl:items-start ${
                showAction
                  ? "xl:grid-cols-[0.95fr_1.45fr_0.45fr_0.45fr_0.45fr_0.5fr_0.6fr_1fr_0.35fr]"
                  : "xl:grid-cols-[0.95fr_1.45fr_0.45fr_0.45fr_0.45fr_0.5fr_0.6fr_1fr]"
              }`}
            >
              <HistoryCell label="Tanggal">
                <p className="text-xs font-bold text-slate-500">
                  {formatDateTime(item.date)}
                </p>
              </HistoryCell>

              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 xl:hidden">
                  Barang
                </p>

                <p className="truncate text-sm font-black text-slate-900">
                  {item.productName}
                </p>

                <p className="mt-0.5 truncate text-xs font-bold text-slate-500">
                  Brand: {item.brand || "-"}
                </p>

                <p className="mt-0.5 truncate text-xs font-bold text-slate-400">
                  {item.sku || "-"}
                </p>

                <p className="mt-0.5 truncate text-xs font-bold text-slate-400">
                  Rak: {item.rackLocation || "-"}
                </p>

                <p className="mt-1 truncate text-xs font-black text-emerald-600">
                  {item.sessionName || "Tanpa Sesi"}
                </p>
              </div>

              <HistoryCell label="Ukuran">
                <p className="font-black text-slate-900">{item.variantValue}</p>
              </HistoryCell>

              <HistoryCell label="Sistem">
                <p>{item.systemStock}</p>
              </HistoryCell>

              <HistoryCell label="Fisik">
                <p>{item.physicalStock}</p>
              </HistoryCell>

              <HistoryCell label="Selisih">
                <p className={`font-black ${getDifferenceClass(item.difference)}`}>
                  {formatDifference(item.difference)}
                </p>
              </HistoryCell>

              <HistoryCell label="Status">
                <span
                  className={`inline-flex rounded-full border px-2 py-1 text-xs font-black ${getOpnameStatusClass(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
              </HistoryCell>

              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 xl:hidden">
                  Catatan
                </p>
                <p className="line-clamp-2 text-xs font-semibold leading-relaxed text-slate-500">
                  {item.note || "-"}
                </p>
              </div>

              {showAction && (
                <div className="flex gap-2 xl:justify-end">
                  <EditButton onClick={() => openEditStockOpnameModal(item)} />
                  <TrashButton onClick={() => deleteStockOpnameHistory(item.id)} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function HistoryCell({ label, children }) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 xl:hidden">
        {label}
      </p>
      {children}
    </div>
  )
}

function SessionTableText({
  label,
  value,
  color = "text-slate-700",
  strong = false,
  small = false,
}) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 xl:hidden">
        {label}
      </p>
      <p
        className={`${color} ${
          strong ? "font-black" : "font-bold"
        } ${small ? "text-xs text-slate-500" : ""}`}
      >
        {value}
      </p>
    </div>
  )
}

function MiniSummary({ label, value, color = "slate" }) {
  const style = {
    slate: "border-slate-200 bg-white text-slate-900",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-600",
    blue: "border-blue-100 bg-blue-50 text-blue-600",
    amber: "border-amber-100 bg-amber-50 text-amber-600",
    red: "border-red-100 bg-red-50 text-red-600",
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-sm ${style[color]}`}>
      <p className="text-[11px] font-black uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  )
}

function FilterGroup({
  label,
  filters,
  value,
  onChange,
  activeClass,
  inactiveClass,
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = value === filter

          return (
            <button
              key={filter}
              onClick={() => onChange(filter)}
              className={`rounded-xl px-3 py-2 text-xs font-black transition ${
                isActive ? activeClass : inactiveClass
              }`}
            >
              {filter}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function EmptyModalState({ text }) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-400">
      {text}
    </div>
  )
}


function EditStockOpnameModal({
  selectedEditOpname,
  editPhysicalStock,
  setEditPhysicalStock,
  editOpnameNote,
  setEditOpnameNote,
  onClose,
  onSubmit,
}) {
  const systemStock = Number(selectedEditOpname?.systemStock || 0)
  const numericPhysicalStock = Number(editPhysicalStock || 0)
  const difference = editPhysicalStock === "" ? 0 : numericPhysicalStock - systemStock

  return (
    <ModalWrapper maxWidth="max-w-3xl">
      <ModalHeader
        eyebrow="Edit SO"
        title="Edit Hasil Stok Opname"
        description="Perbaiki angka stok fisik atau catatan jika ada typo saat input SO."
        color="blue"
        onClose={onClose}
      />

      <div className="overflow-y-auto px-5 py-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-2xl font-black text-slate-900">
            {selectedEditOpname.productName}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem label="Brand" value={selectedEditOpname.brand || "-"} />
            <DetailItem label="Ukuran" value={selectedEditOpname.variantValue || "-"} />
            <DetailItem label="Rak" value={selectedEditOpname.rackLocation || "-"} />
            <DetailItem label="SKU" value={selectedEditOpname.sku || "-"} breakText />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-blue-600">
            Sesi SO
          </p>
          <p className="mt-1 text-sm font-black text-blue-700">
            {selectedEditOpname.sessionName || "Tanpa Sesi"}
          </p>
          <p className="mt-1 text-xs font-bold text-blue-600">
            Edit ini akan memperbarui ringkasan sesuai/lebih/kurang pada sesi terkait.
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <StockNumberBox label="Stok Sistem" value={systemStock} />

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Stok Fisik Baru
            </p>
            <input
              type="number"
              min="0"
              value={editPhysicalStock}
              onChange={(e) => setEditPhysicalStock(e.target.value)}
              placeholder="0"
              className="mt-2 w-full bg-transparent text-3xl font-black text-slate-900 outline-none placeholder:text-slate-300"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Selisih Baru
            </p>
            <p
              className={`mt-2 text-3xl font-black ${
                editPhysicalStock === ""
                  ? "text-slate-300"
                  : difference === 0
                  ? "text-emerald-600"
                  : difference > 0
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
            >
              {editPhysicalStock === "" ? "-" : difference > 0 ? `+${difference}` : difference}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-black uppercase tracking-wide text-slate-400">
            Catatan
          </label>
          <textarea
            value={editOpnameNote}
            onChange={(e) => setEditOpnameNote(e.target.value)}
            placeholder="Perbaiki catatan SO..."
            className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </div>

      <ModalFooter>
        <button
          onClick={onClose}
          className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-200"
        >
          Batal
        </button>

        <button
          onClick={onSubmit}
          disabled={editPhysicalStock === ""}
          className={`rounded-2xl px-5 py-3 text-sm font-black text-white transition ${
            editPhysicalStock === ""
              ? "cursor-not-allowed bg-slate-300"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Simpan Perubahan
        </button>
      </ModalFooter>
    </ModalWrapper>
  )
}

function EditButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Edit"
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100 hover:text-blue-700"
    >
      <EditIcon />
      <span className="sr-only">Edit</span>
    </button>
  )
}

function EditIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function TrashButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Hapus"
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700"
    >
      <TrashIcon />
      <span className="sr-only">Hapus</span>
    </button>
  )
}

function TrashIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  )
}

function InfoModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-blue-600">
              Info
            </p>

            <h3 className="mt-1 text-2xl font-black text-slate-900">
              Tambah Produk
            </h3>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        <p className="text-sm font-semibold leading-relaxed text-slate-500">
          Fitur tambah produk belum diaktifkan di tahap ini. Sekarang kita fokus
          dulu ke tampilan data barang dan stok agar aman sebelum masuk ke form
          tambah/edit produk.
        </p>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-blue-600 py-3 text-sm font-black text-white transition hover:bg-blue-700"
        >
          Oke, Paham
        </button>
      </div>
    </div>
  )
}

export default StokBarang
