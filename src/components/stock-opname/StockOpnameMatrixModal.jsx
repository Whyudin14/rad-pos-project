import { useEffect, useMemo, useState } from "react"

function StockOpnameMatrixModal({
  activeStockOpnameSession,
  activeSessionProgress,
  onClose,
  onSubmit,
}) {
  const [brandFilter, setBrandFilter] = useState("Semua Brand")
  const [categoryFilter, setCategoryFilter] = useState("Semua Kategori")
  const [matrixValues, setMatrixValues] = useState({})
  const [matrixNotes, setMatrixNotes] = useState({})
  const [saveMessage, setSaveMessage] = useState("")

  const targetItems = activeSessionProgress?.targetItems || []
  const checkedItems = activeSessionProgress?.checkedItems || []

  const checkedValueMap = useMemo(() => {
    return checkedItems.reduce((result, item) => {
      result[item.id] = String(item.physicalStock ?? "")
      return result
    }, {})
  }, [checkedItems])

  const checkedNoteMap = useMemo(() => {
    return checkedItems.reduce((result, item) => {
      result[getMatrixRowId(item)] = item.note || ""
      return result
    }, {})
  }, [checkedItems])

  useEffect(() => {
    setMatrixValues(checkedValueMap)
    setMatrixNotes(checkedNoteMap)
  }, [checkedValueMap, checkedNoteMap])

  const brandFilters = useMemo(() => {
    return [
      "Semua Brand",
      ...Array.from(
        new Set(targetItems.map((item) => item.brand).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b)),
    ]
  }, [targetItems])

  const categoryFilters = useMemo(() => {
    return [
      "Semua Kategori",
      ...Array.from(
        new Set(targetItems.map((item) => item.category).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b)),
    ]
  }, [targetItems])

  const filteredItems = targetItems.filter((item) => {
    const matchBrand = brandFilter === "Semua Brand" || item.brand === brandFilter
    const matchCategory =
      categoryFilter === "Semua Kategori" || item.category === categoryFilter

    return matchBrand && matchCategory
  })

  const sizeColumns = getSizeColumns(filteredItems)
  const matrixRows = buildMatrixRows(filteredItems, sizeColumns)

  const filledItems = filteredItems.filter((item) => {
    const value = matrixValues[item.id]
    return value !== undefined && value !== ""
  })

  const uncheckedItems = filteredItems.filter((item) => {
    const value = matrixValues[item.id]
    return value === undefined || value === ""
  })

  const checkedZeroItems = filledItems.filter((item) => {
    return Number(matrixValues[item.id] || 0) === 0
  })

  const problemItems = filledItems.filter((item) => {
    const physicalStock = Number(matrixValues[item.id] || 0)
    const systemStock = Number(item.systemStock || 0)

    return physicalStock - systemStock !== 0
  })

  const handleValueChange = (itemId, value) => {
    setSaveMessage("")

    if (value === "") {
      setMatrixValues((current) => ({
        ...current,
        [itemId]: "",
      }))
      return
    }

    const numericValue = Number(value)

    if (Number.isNaN(numericValue)) return

    if (numericValue < 0) {
      setMatrixValues((current) => ({
        ...current,
        [itemId]: "0",
      }))
      return
    }

    setMatrixValues((current) => ({
      ...current,
      [itemId]: value,
    }))
  }

  const handleNoteChange = (rowId, value) => {
    setMatrixNotes((current) => ({
      ...current,
      [rowId]: value,
    }))
  }

  const clearFilteredInputs = () => {
    const confirmClear = window.confirm(
      "Kosongkan input pada tampilan matrix saat ini? Data SO yang sudah tersimpan sebelumnya tidak akan terhapus sampai tombol Simpan Matrix SO ditekan."
    )

    if (!confirmClear) return

    setMatrixValues((current) => {
      const updatedValues = { ...current }

      filteredItems.forEach((item) => {
        updatedValues[item.id] = ""
      })

      return updatedValues
    })

    setSaveMessage("")
  }

  const fillEmptySystemStockWithZero = () => {
    setMatrixValues((current) => {
      const updatedValues = { ...current }

      filteredItems.forEach((item) => {
        const currentValue = updatedValues[item.id]
        const systemStock = Number(item.systemStock || 0)

        if (
          (currentValue === undefined || currentValue === "") &&
          systemStock === 0
        ) {
          updatedValues[item.id] = "0"
        }
      })

      return updatedValues
    })

    setSaveMessage("")
  }

  const submitMatrix = () => {
    const filledMatrixItems = filteredItems
      .filter((item) => {
        const value = matrixValues[item.id]
        return value !== undefined && value !== ""
      })
      .map((item) => {
        const rowId = getMatrixRowId(item)

        return {
          ...item,
          physicalStock: matrixValues[item.id],
          note: matrixNotes[rowId] || "Input cepat SO / Matrix SO",
        }
      })

    if (filledMatrixItems.length === 0) {
      setSaveMessage("Belum ada angka yang diisi. Kosong berarti belum dicek.")
      return
    }

    onSubmit(filledMatrixItems)
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black/45 p-2 sm:p-3">
      <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="shrink-0 border-b border-slate-100 px-4 py-3 sm:px-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-600">
                Input Cepat SO
              </p>

              <h3 className="mt-0.5 text-xl font-black text-slate-900 sm:text-2xl">
                Matrix Stock Opname
              </h3>

              <p className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
                Kosong = belum dicek, 0 = fisik kosong tapi sudah dicek, angka
                lebih dari 0 = stok fisik.
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            >
              ✕
            </button>
          </div>
        </div>

        {!activeStockOpnameSession ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="rounded-3xl border-2 border-dashed border-slate-200 px-6 py-10 text-center">
              <p className="text-lg font-black text-slate-800">
                Belum ada sesi SO aktif
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Buat sesi SO aktif dulu sebelum memakai Input Cepat SO.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="shrink-0 border-b border-slate-100 bg-slate-50 px-4 py-3 sm:px-5">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[760px]">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-wide text-emerald-600">
                      Sesi Aktif
                    </p>

                    <p className="mt-1 truncate text-base font-black text-slate-900">
                      {activeStockOpnameSession.name}
                    </p>

                    <p className="mt-1 text-[11px] font-bold text-emerald-700">
                      SO tidak mengubah stok sistem otomatis.
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                      Brand
                    </label>

                    <select
                      value={brandFilter}
                      onChange={(event) => setBrandFilter(event.target.value)}
                      className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                    >
                      {brandFilters.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                      Kategori
                    </label>

                    <select
                      value={categoryFilter}
                      onChange={(event) => setCategoryFilter(event.target.value)}
                      className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                    >
                      {categoryFilters.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-4 xl:min-w-[460px]">
                  <MatrixStat label="Target" value={filteredItems.length} />
                  <MatrixStat
                    label="Terisi"
                    value={filledItems.length}
                    color="emerald"
                  />
                  <MatrixStat
                    label="Belum"
                    value={uncheckedItems.length}
                    color="amber"
                  />
                  <MatrixStat
                    label="Masalah"
                    value={problemItems.length}
                    color="red"
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div className="rounded-2xl bg-white px-4 py-2 text-xs font-bold leading-relaxed text-slate-500">
                  <span className="font-black text-slate-900">Cara isi:</span>{" "}
                  klik kolom size lalu isi angka fisik. Kosong berarti belum
                  dicek. Saat disimpan, hasil lama item yang sama akan
                  diperbarui supaya tidak dobel.
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    onClick={fillEmptySystemStockWithZero}
                    className="rounded-2xl bg-white px-4 py-2.5 text-xs font-black text-slate-600 transition hover:bg-slate-100"
                  >
                    Isi 0 untuk Stok Sistem Kosong
                  </button>

                  <button
                    onClick={clearFilteredInputs}
                    className="rounded-2xl bg-red-50 px-4 py-2.5 text-xs font-black text-red-600 transition hover:bg-red-100"
                  >
                    Kosongkan Tampilan Ini
                  </button>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden bg-white p-3 sm:p-4">
              <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="shrink-0 border-b border-slate-100 bg-white px-4 py-2">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        Tabel Input Fisik
                      </p>
                      <p className="text-xs font-semibold text-slate-500">
                        Artikel per warna, input langsung per ukuran.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px] font-black">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">
                        Kosong: belum dicek
                      </span>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-600">
                        0: dicek kosong
                      </span>
                      <span className="rounded-full bg-red-50 px-3 py-1 text-red-600">
                        Merah: selisih
                      </span>
                    </div>
                  </div>
                </div>

                {matrixRows.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center text-center text-sm font-bold text-slate-400">
                    Tidak ada item SO untuk filter ini.
                  </div>
                ) : (
                  <div className="min-h-0 flex-1 overflow-auto">
                    <div
                      className="min-w-max"
                      style={{
                        width: `${650 + sizeColumns.length * 86}px`,
                      }}
                    >
                      <div
                        className="sticky top-0 z-30 grid border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-400"
                        style={{
                          gridTemplateColumns: `240px 130px ${sizeColumns
                            .map(() => "86px")
                            .join(" ")} 90px 190px`,
                        }}
                      >
                        <div className="sticky left-0 z-40 border-r border-slate-200 bg-slate-50 px-4 py-3">
                          Artikel
                        </div>

                        <div className="border-r border-slate-200 px-3 py-3">
                          Warna
                        </div>

                        {sizeColumns.map((size) => (
                          <div
                            key={size}
                            className="border-r border-slate-200 px-2 py-3 text-center"
                          >
                            {size}
                          </div>
                        ))}

                        <div className="border-r border-slate-200 px-3 py-3 text-center">
                          Total
                        </div>

                        <div className="px-3 py-3">Catatan</div>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {matrixRows.map((row) => {
                          const rowTotal = row.items.reduce((total, item) => {
                            const value = matrixValues[item.id]

                            if (value === undefined || value === "") {
                              return total
                            }

                            return total + Number(value || 0)
                          }, 0)

                          const rowSystemTotal = row.items.reduce(
                            (total, item) => {
                              return total + Number(item.systemStock || 0)
                            },
                            0
                          )

                          const rowFilled = row.items.filter((item) => {
                            const value = matrixValues[item.id]
                            return value !== undefined && value !== ""
                          }).length

                          const rowDifference =
                            rowFilled === 0 ? null : rowTotal - rowSystemTotal

                          return (
                            <div
                              key={row.id}
                              className="grid min-h-[74px] text-sm font-bold text-slate-700 hover:bg-slate-50/60"
                              style={{
                                gridTemplateColumns: `240px 130px ${sizeColumns
                                  .map(() => "86px")
                                  .join(" ")} 90px 190px`,
                              }}
                            >
                              <div className="sticky left-0 z-20 border-r border-slate-100 bg-white px-4 py-3">
                                <p className="line-clamp-2 text-sm font-black leading-snug text-slate-900">
                                  {row.productName}
                                </p>

                                <p className="mt-1 text-[11px] font-bold text-slate-400">
                                  {row.brand || "-"} • {row.category || "-"}
                                </p>

                                <p className="mt-1 text-[10px] font-black text-slate-400">
                                  Stok sistem: {rowSystemTotal}
                                </p>
                              </div>

                              <div className="border-r border-slate-100 px-3 py-3 text-xs font-black text-slate-600">
                                {row.color || "-"}
                              </div>

                              {sizeColumns.map((size) => {
                                const item = row.sizeMap[size]
                                const value = item
                                  ? matrixValues[item.id] ?? ""
                                  : ""
                                const systemStock = Number(item?.systemStock || 0)
                                const physicalStock =
                                  value === "" ? null : Number(value || 0)
                                const difference =
                                  physicalStock === null
                                    ? null
                                    : physicalStock - systemStock
                                const statusClass = getCellStatusClass(difference)

                                return (
                                  <div
                                    key={`${row.id}-${size}`}
                                    className={`border-r border-slate-100 px-2 py-2 ${statusClass.wrapper}`}
                                  >
                                    {item ? (
                                      <>
                                        <input
                                          type="number"
                                          min="0"
                                          value={value}
                                          onChange={(event) =>
                                            handleValueChange(
                                              item.id,
                                              event.target.value
                                            )
                                          }
                                          className={`h-10 w-full rounded-xl border px-2 text-center text-sm font-black outline-none transition ${statusClass.input}`}
                                        />

                                        <p className="mt-1 text-center text-[10px] font-black text-slate-400">
                                          Sys: {systemStock}
                                        </p>
                                      </>
                                    ) : (
                                      <div className="flex h-full min-h-[54px] items-center justify-center rounded-xl bg-slate-50 text-xs font-black text-slate-300">
                                        -
                                      </div>
                                    )}
                                  </div>
                                )
                              })}

                              <div className="border-r border-slate-100 px-3 py-3 text-center">
                                <p
                                  className={`text-lg font-black ${
                                    rowDifference === null
                                      ? "text-slate-400"
                                      : rowDifference === 0
                                      ? "text-emerald-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {rowFilled === 0 ? "-" : rowTotal}
                                </p>

                                <p className="text-[10px] font-black text-slate-400">
                                  {rowFilled}/{row.items.length} size
                                </p>

                                {rowDifference !== null && (
                                  <p
                                    className={`mt-1 text-[10px] font-black ${
                                      rowDifference === 0
                                        ? "text-emerald-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    Selisih: {formatDifference(rowDifference)}
                                  </p>
                                )}
                              </div>

                              <div className="px-3 py-2">
                                <textarea
                                  value={matrixNotes[row.id] || ""}
                                  onChange={(event) =>
                                    handleNoteChange(row.id, event.target.value)
                                  }
                                  placeholder="Opsional"
                                  className="h-14 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-3 sm:px-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-h-5">
                  {saveMessage && (
                    <p className="rounded-2xl bg-amber-50 px-4 py-2 text-sm font-black text-amber-700">
                      {saveMessage}
                    </p>
                  )}

                  {!saveMessage && (
                    <p className="text-xs font-semibold text-slate-500">
                      Data yang disimpan hanya hasil SO. Stok sistem tetap aman
                      dan tidak berubah otomatis.
                    </p>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    onClick={onClose}
                    className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-200"
                  >
                    Batal
                  </button>

                  <button
                    onClick={submitMatrix}
                    disabled={!activeStockOpnameSession || filledItems.length === 0}
                    className={`rounded-2xl px-5 py-3 text-sm font-black text-white transition ${
                      !activeStockOpnameSession || filledItems.length === 0
                        ? "cursor-not-allowed bg-slate-300"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    Simpan Matrix SO ({filledItems.length})
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function MatrixStat({ label, value, color = "slate" }) {
  const style = {
    slate: "border-slate-200 bg-white text-slate-900",
    emerald: "border-emerald-100 bg-white text-emerald-600",
    amber: "border-amber-100 bg-white text-amber-600",
    red: "border-red-100 bg-white text-red-600",
  }

  return (
    <div className={`rounded-2xl border px-3 py-2 shadow-sm ${style[color]}`}>
      <p className="text-[10px] font-black uppercase tracking-wide opacity-70">
        {label}
      </p>

      <p className="mt-0.5 text-xl font-black">{value}</p>
    </div>
  )
}

function buildMatrixRows(items, sizeColumns) {
  const rows = items.reduce((result, item) => {
    const rowId = getMatrixRowId(item)

    if (!result[rowId]) {
      result[rowId] = {
        id: rowId,
        productId: item.productId,
        productName: item.productName,
        brand: item.brand,
        category: item.category,
        color: getItemColor(item),
        items: [],
        sizeMap: {},
      }
    }

    result[rowId].items.push(item)
    result[rowId].sizeMap[getItemSize(item)] = item

    return result
  }, {})

  return Object.values(rows)
    .map((row) => ({
      ...row,
      items: row.items.sort((a, b) =>
        compareSizeValue(getItemSize(a), getItemSize(b))
      ),
      sizeMap: sizeColumns.reduce((result, size) => {
        if (row.sizeMap[size]) result[size] = row.sizeMap[size]
        return result
      }, {}),
    }))
    .sort((a, b) => {
      const brandCompare = (a.brand || "").localeCompare(b.brand || "")
      if (brandCompare !== 0) return brandCompare

      const categoryCompare = (a.category || "").localeCompare(b.category || "")
      if (categoryCompare !== 0) return categoryCompare

      const productCompare = (a.productName || "").localeCompare(
        b.productName || ""
      )
      if (productCompare !== 0) return productCompare

      return (a.color || "").localeCompare(b.color || "")
    })
}

function getSizeColumns(items) {
  return Array.from(new Set(items.map((item) => getItemSize(item))))
    .filter(Boolean)
    .sort(compareSizeValue)
}

function compareSizeValue(a, b) {
  const numericA = Number(a)
  const numericB = Number(b)

  if (!Number.isNaN(numericA) && !Number.isNaN(numericB)) {
    return numericA - numericB
  }

  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  })
}

function getMatrixRowId(item) {
  return [
    item.productId || "-",
    getItemColor(item) || "-",
    item.brand || "-",
    item.category || "-",
  ].join("::")
}

function getItemSize(item) {
  return item.variantValue?.toString() || "-"
}

function getItemColor(item) {
  return (
    item.variant?.color ||
    item.variant?.colorName ||
    item.variant?.warna ||
    item.product?.color ||
    item.product?.colorName ||
    item.product?.warna ||
    item.product?.variantColor ||
    item.color ||
    item.colorName ||
    item.warna ||
    "-"
  )
}

function getCellStatusClass(difference) {
  if (difference === null) {
    return {
      wrapper: "bg-white",
      input:
        "border-slate-200 bg-white text-slate-900 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50",
    }
  }

  if (difference === 0) {
    return {
      wrapper: "bg-emerald-50/40",
      input:
        "border-emerald-200 bg-white text-emerald-700 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50",
    }
  }

  return {
    wrapper: "bg-red-50/40",
    input:
      "border-red-200 bg-white text-red-700 focus:border-red-400 focus:ring-4 focus:ring-red-50",
  }
}

function formatDifference(value) {
  const number = Number(value || 0)

  if (number > 0) return `+${number}`
  return String(number)
}

export default StockOpnameMatrixModal