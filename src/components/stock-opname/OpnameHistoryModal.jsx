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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-4 sm:px-6">
        <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <MiniSummary label="Total SO" value={totalOpnameHistory} color="slate" />
          <MiniSummary label="Sesuai" value={totalOpnameSesuai} color="emerald" />
          <MiniSummary label="Lebih" value={totalOpnameLebih} color="blue" />
          <MiniSummary label="Kurang" value={totalOpnameKurang} color="red" />
        </div>

        <div className="mb-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="grid gap-3 xl:grid-cols-[1fr_1fr_1.35fr] xl:items-end">
            <div>
              <FilterGroup
                label="Status"
                filters={opnameHistoryFilters}
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
                onChange={(e) => setOpnameHistorySessionFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
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
                  {filteredStockOpnameHistory.length} dari{" "}
                  {stockOpnameHistory.length} item
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
                {filteredStockOpnameHistory.length} dari{" "}
                {stockOpnameHistory.length} detail item SO ditampilkan.
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1">
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
      </div>
    </ModalWrapper>
  )
}

export default OpnameHistoryModal