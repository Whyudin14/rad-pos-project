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

export default OpnameHistoryModal