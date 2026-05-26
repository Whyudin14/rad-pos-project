import { useState } from "react"

import {
  ModalWrapper,
  ModalHeader,
} from "./StockOpnameModalLayout"

import {
  MiniSummary,
  FilterGroup,
  EmptyModalState,
  SessionTableText,
} from "./StockOpnameShared"

import OpnameHistoryTable from "./OpnameHistoryTable"

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

              <SessionTableText
                label="Dicek"
                value={session.totalChecked}
                strong
              />

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
              {selectedSessionSummary.scheduleDay} •{" "}
              {selectedSessionSummary.type} • {selectedSessionSummary.status}
            </p>

            <p className="mt-1 text-xs font-bold text-slate-400">
              Mulai: {formatDateTime(selectedSessionSummary.createdAt)} •
              Selesai: {formatDateTime(selectedSessionSummary.finishedAt)}
            </p>

            {selectedSessionSummary.note && (
              <p className="mt-1 line-clamp-1 text-xs font-semibold leading-relaxed text-slate-500">
                Catatan: {selectedSessionSummary.note}
              </p>
            )}
          </div>

          <div className="w-full xl:max-w-2xl">
            <div className="grid gap-2 sm:grid-cols-4">
              <CompactProgressStat
                label="Ditampilkan"
                value={filteredItems.length}
              />

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
                Menampilkan {filteredItems.length} dari{" "}
                {selectedSessionSummary.items.length} item.
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

export default SessionHistoryModal