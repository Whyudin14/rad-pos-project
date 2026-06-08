import {
  ModalWrapper,
  ModalHeader,
} from "./StockOpnameModalLayout"

import {
  MiniSummary,
  FilterGroup,
  EmptyModalState,
} from "./StockOpnameShared"

import OpnameHistoryTable from "./OpnameHistoryTable"

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
  const statusFilters = [
    "Semua",
    "Sesuai",
    "Stok Bermasalah",
    "Lebih",
    "Kurang",
  ]

  const isStockProblem = (item) => {
    return (
      item.status === "Lebih" ||
      item.status === "Kurang" ||
      item.investigationStatus === "pending"
    )
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

  const totalStockProblem = stockOpnameHistory.filter((item) => {
    return isStockProblem(item)
  }).length

  const displayedItems = stockOpnameHistory.filter((item) => {
    const keyword = opnameHistorySearch.toLowerCase().trim()

    const matchStatus =
      opnameHistoryFilter === "Semua" ||
      item.status === opnameHistoryFilter ||
      (opnameHistoryFilter === "Stok Bermasalah" && isStockProblem(item))

    const matchSession =
      opnameHistorySessionFilter === "Semua Sesi" ||
      item.sessionType === opnameHistorySessionFilter ||
      (opnameHistorySessionFilter === "Tanpa Sesi" &&
        isHistoryWithoutSession(item))

    const searchableText = [
      item.productName,
      item.brand,
      item.category,
      item.variantValue,
      item.sku,
      item.barcode,
      item.rackLocation,
      item.note,
      item.status,
      item.sessionName,
      item.sessionType,
      item.sessionScheduleDay,
      item.investigationStatus,
      item.investigationNote,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    const matchSearch = !keyword || searchableText.includes(keyword)

    return matchStatus && matchSession && matchSearch
  })

  return (
    <ModalWrapper maxWidth="max-w-7xl" tall>
      <div className="flex max-h-[92vh] min-h-0 flex-col overflow-hidden">
        <ModalHeader
          eyebrow="Detail Item"
          title="Detail Item SO"
          description="Cek riwayat item SO berdasarkan sesi, status, barang, ukuran, SKU, rak, catatan, dan stok yang bermasalah."
          color="blue"
          onClose={onClose}
        />

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4 sm:px-6">
          <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <CompactSummary
              label="Total SO"
              value={totalOpnameHistory}
              color="slate"
            />

            <CompactSummary
              label="Sesuai"
              value={totalOpnameSesuai}
              color="emerald"
            />

            <CompactSummary
              label="Stok Bermasalah"
              value={totalStockProblem}
              color="amber"
            />

            <CompactSummary
              label="Lebih"
              value={totalOpnameLebih}
              color="blue"
            />

            <CompactSummary
              label="Kurang"
              value={totalOpnameKurang}
              color="red"
            />
          </div>

          <div className="mb-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="grid gap-3 xl:grid-cols-[1.25fr_0.9fr_1.25fr] xl:items-end">
              <div>
                <FilterGroup
                  label="Status"
                  filters={statusFilters}
                  value={opnameHistoryFilter}
                  onChange={setOpnameHistoryFilter}
                  activeClass="bg-slate-900 text-white"
                  inactiveClass="bg-slate-50 text-slate-500 hover:bg-slate-100"
                />
              </div>

              <div>
                <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
                  Jenis Sesi
                </p>

                <select
                  value={opnameHistorySessionFilter}
                  onChange={(e) =>
                    setOpnameHistorySessionFilter(e.target.value)
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                >
                  {opnameHistorySessionFilters.map((filter) => (
                    <option key={filter} value={filter}>
                      {filter}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                    Pencarian
                  </p>

                  <p className="hidden text-xs font-bold text-blue-600 sm:block">
                    {displayedItems.length} dari {stockOpnameHistory.length} item
                  </p>
                </div>

                <input
                  type="text"
                  value={opnameHistorySearch}
                  onChange={(e) => setOpnameHistorySearch(e.target.value)}
                  placeholder="Cari barang, SKU, rak, catatan..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />

                <p className="mt-2 text-xs font-bold text-blue-600 sm:hidden">
                  {displayedItems.length} dari {stockOpnameHistory.length} detail
                  item SO ditampilkan.
                </p>
              </div>
            </div>
          </div>

          {totalStockProblem > 0 && (
            <div className="mb-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-bold leading-relaxed text-amber-700">
              Ada {totalStockProblem} item SO dengan stok bermasalah. Status{" "}
              <span className="font-black">Lebih</span> dan{" "}
              <span className="font-black">Kurang</span> sama-sama perlu
              investigasi karena bisa jadi barang tertukar ukuran, salah rak,
              belum dicek di gudang, hilang, retur belum tercatat, atau transaksi
              sebelumnya belum sesuai.
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            {stockOpnameHistory.length === 0 ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <EmptyModalState text="Belum ada detail item stok opname" />
              </div>
            ) : displayedItems.length === 0 ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <EmptyModalState text="Detail item SO tidak ditemukan" />
              </div>
            ) : (
              <OpnameHistoryTable
                items={displayedItems}
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
        </div>
      </div>
    </ModalWrapper>
  )
}

function CompactSummary({ label, value, color }) {
  const colorClass = {
    slate: {
      wrapper: "border-slate-200 bg-white",
      label: "text-slate-400",
      value: "text-slate-900",
    },
    emerald: {
      wrapper: "border-emerald-100 bg-emerald-50",
      label: "text-emerald-600",
      value: "text-emerald-700",
    },
    amber: {
      wrapper: "border-amber-100 bg-amber-50",
      label: "text-amber-600",
      value: "text-amber-700",
    },
    blue: {
      wrapper: "border-blue-100 bg-blue-50",
      label: "text-blue-600",
      value: "text-blue-700",
    },
    red: {
      wrapper: "border-red-100 bg-red-50",
      label: "text-red-600",
      value: "text-red-700",
    },
  }

  const selectedColor = colorClass[color] || colorClass.slate

  return (
    <div
      className={`rounded-2xl border px-4 py-3 shadow-sm ${selectedColor.wrapper}`}
    >
      <p
        className={`text-[10px] font-black uppercase tracking-wide ${selectedColor.label}`}
      >
        {label}
      </p>
      <p className={`mt-1 text-2xl font-black ${selectedColor.value}`}>
        {value}
      </p>
    </div>
  )
}

export default OpnameHistoryModal