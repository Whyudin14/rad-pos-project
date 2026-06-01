import { useState } from "react"

import { ModalWrapper, ModalHeader } from "./StockOpnameModalLayout"

import { EmptyModalState } from "./StockOpnameShared"

import OpnameHistoryTable from "./OpnameHistoryTable"
import UncheckedTargetTable from "./UncheckedTargetTable"

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

  const totalSesuai = countByStatus(sessionItems, "Sesuai")
  const totalLebih = countByStatus(sessionItems, "Lebih")
  const totalKurang = countByStatus(sessionItems, "Kurang")

  return (
    <ModalWrapper maxWidth="max-w-7xl" tall>
      <ModalHeader
        eyebrow="Sesi Aktif"
        title="Hasil SO Sesi Ini"
        description="Pantau progress pengecekan stok, item yang sudah dicek, dan item yang masih belum dicek."
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

            <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <CompactResultPill
                    label="Sesuai"
                    value={totalSesuai}
                    color="emerald"
                  />

                  <CompactResultPill
                    label="Lebih"
                    value={totalLebih}
                    color="blue"
                  />

                  <CompactResultPill
                    label="Kurang"
                    value={totalKurang}
                    color="red"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <div className="flex rounded-2xl bg-slate-100 p-1">
                    <button
                      onClick={() => setResultTab("Sudah Dicek")}
                      className={`rounded-xl px-4 py-2 text-xs font-black transition ${
                        resultTab === "Sudah Dicek"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-500 hover:bg-white"
                      }`}
                    >
                      Sudah Dicek
                    </button>

                    <button
                      onClick={() => setResultTab("Belum Dicek")}
                      className={`rounded-xl px-4 py-2 text-xs font-black transition ${
                        resultTab === "Belum Dicek"
                          ? "bg-amber-500 text-white shadow-sm"
                          : "text-slate-500 hover:bg-white"
                      }`}
                    >
                      Belum Dicek
                    </button>
                  </div>

                  <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="h-10 min-w-[170px] rounded-2xl border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  >
                    {brandFilters.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-bold leading-relaxed text-slate-500">
                  Menampilkan{" "}
                  <span className="font-black text-slate-900">
                    {displayedItems.length}
                  </span>{" "}
                  item dari tab{" "}
                  <span className="font-black text-slate-900">
                    {resultTab}
                  </span>
                  {brandFilter !== "Semua Brand" && (
                    <>
                      {" "}
                      untuk brand{" "}
                      <span className="font-black text-slate-900">
                        {brandFilter}
                      </span>
                    </>
                  )}
                  .
                </p>

                <p className="text-xs font-bold text-slate-400">
                  Fokus utama: cek item, selisih, status, dan catatan SO.
                </p>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
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
            </div>
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
            {activeStockOpnameSession.scheduleDay} •{" "}
            {activeStockOpnameSession.type} • Mulai:{" "}
            {formatDateTime(activeStockOpnameSession.createdAt)}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-4 xl:min-w-[520px]">
          <CompactProgressStat
            label="Target"
            value={activeSessionProgress.targetTotal}
          />

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
            Progress Pengecekan
          </p>

          <p className="text-[11px] font-black text-emerald-600">
            {activeSessionProgress.checkedTotal} /{" "}
            {activeSessionProgress.targetTotal} item
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

function CompactResultPill({ label, value, color = "slate" }) {
  const style = {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-600",
    blue: "border-blue-100 bg-blue-50 text-blue-600",
    red: "border-red-100 bg-red-50 text-red-600",
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-2xl border px-3 py-2 ${style[color]}`}
    >
      <span className="text-[11px] font-black uppercase tracking-wide">
        {label}
      </span>

      <span className="text-lg font-black leading-none">{value}</span>
    </div>
  )
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

function countByStatus(items, status) {
  return items.filter((item) => item.status === status).length
}

export default ActiveSessionResultModal