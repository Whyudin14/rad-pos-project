import { useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"

const mainMenuSections = [
  {
    items: [{ name: "Dashboard", icon: "🏠", path: "/" }],
  },
  {
    title: "Master Data",
    items: [
      { name: "Produk", icon: "👟", path: "/produk" },
      { name: "Kategori", icon: "🏷️", path: "/kategori" },
    ],
  },
  {
    title: "Manajemen Stok",
    items: [
      { name: "Data Barang", icon: "📋", path: "/data-barang" },
      { name: "Stok Barang", icon: "📦", path: "/stok-barang" },
      { name: "Stock Opname", icon: "✅", path: "/stock-opname" },
      { name: "Mutasi Stok", icon: "🔁", path: "/mutasi-stok" },
    ],
  },
  {
    title: "Laporan",
    items: [
      {
        name: "Riwayat Penjualan",
        icon: "📊",
        path: "/riwayat-transaksi",
      },
      {
        name: "Laporan Penjualan",
        icon: "📈",
        path: "/laporan-penjualan",
      },
      {
        name: "Settlement",
        icon: "💰",
        path: "/settlement",
      },
    ],
  },
]

const primaryMenu = {
  name: "POS / Kasir",
  icon: "🧾",
  path: "/kasir",
}

const bottomMenu = {
  name: "Pengaturan",
  icon: "⚙️",
  path: "/pengaturan",
}

function Sidebar({ isCollapsed = false, onToggle }) {
  const navigate = useNavigate()
  const location = useLocation()
  const scrollAreaRef = useRef(null)
  const activeMenuRef = useRef(null)

  const isMenuActive = (itemPath) => {
    if (itemPath === "/") {
      return location.pathname === "/"
    }

    return location.pathname === itemPath
  }

  const isPrimaryActive = isMenuActive(primaryMenu.path)
  const isBottomActive = isMenuActive(bottomMenu.path)

  useEffect(() => {
    if (!activeMenuRef.current || !scrollAreaRef.current) return

    activeMenuRef.current.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    })
  }, [location.pathname])

  const handleNavigate = (path) => {
    if (!path || location.pathname === path) return
    navigate(path)
  }

  return (
    <aside
      className={`h-screen shrink-0 border-r border-slate-200 bg-white transition-all duration-300 ${
        isCollapsed ? "w-24" : "w-72"
      }`}
    >
      <div className="flex h-full flex-col">
        <div
          className={`shrink-0 border-b border-slate-100 px-4 py-4 ${
            isCollapsed ? "px-4" : ""
          }`}
        >
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "justify-between gap-3"
            }`}
          >
            <div
              className={`flex items-center ${
                isCollapsed ? "justify-center" : "gap-3"
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-sm">
                R
              </div>

              {!isCollapsed && (
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-black text-slate-900">
                    RAD POS
                  </h1>
                  <p className="truncate text-xs font-medium text-slate-400">
                    Sport Retail System
                  </p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={onToggle}
                title="Tutup sidebar"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-600 transition hover:bg-slate-200"
              >
                ‹
              </button>
            )}
          </div>

          {isCollapsed && (
            <button
              onClick={onToggle}
              title="Buka sidebar"
              className="mt-3 flex h-9 w-full items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-600 transition hover:bg-slate-200"
            >
              ›
            </button>
          )}
        </div>

        <div className="shrink-0 px-4 py-3">
          <button
            onClick={() => handleNavigate(primaryMenu.path)}
            title={isCollapsed ? primaryMenu.name : ""}
            className={`group flex w-full items-center rounded-2xl text-sm font-black transition ${
              isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3.5"
            } ${
              isPrimaryActive
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center text-base">
              {primaryMenu.icon}
            </span>

            {!isCollapsed && (
              <div className="min-w-0 text-left">
                <span className="block truncate">{primaryMenu.name}</span>
                <span
                  className={`mt-0.5 block truncate text-[10px] font-black uppercase tracking-wide ${
                    isPrimaryActive ? "text-blue-100" : "text-blue-400"
                  }`}
                >
                  Transaksi Utama
                </span>
              </div>
            )}
          </button>
        </div>

        <div
          ref={scrollAreaRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-3 [scrollbar-width:thin]"
        >
          <nav className="space-y-3">
            {mainMenuSections.map((section, sectionIndex) => (
              <div key={section.title || sectionIndex}>
                {!isCollapsed && section.title && (
                  <p className="mb-1 px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {section.title}
                  </p>
                )}

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = isMenuActive(item.path)

                    return (
                      <button
                        key={item.name}
                        ref={isActive ? activeMenuRef : null}
                        onClick={() => handleNavigate(item.path)}
                        title={isCollapsed ? item.name : ""}
                        className={`group flex w-full items-center rounded-2xl text-sm font-bold transition ${
                          isCollapsed
                            ? "justify-center px-0 py-2.5"
                            : "gap-3 px-3.5 py-2.5"
                        } ${
                          isActive
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center text-base">
                          {item.icon}
                        </span>

                        {!isCollapsed && (
                          <span className="truncate text-left">
                            {item.name}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="shrink-0 border-t border-slate-100 px-4 py-3">
          <button
            onClick={() => handleNavigate(bottomMenu.path)}
            title={isCollapsed ? bottomMenu.name : ""}
            className={`mb-3 flex w-full items-center rounded-2xl text-sm font-bold transition ${
              isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3.5 py-2.5"
            } ${
              isBottomActive
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center text-base">
              {bottomMenu.icon}
            </span>

            {!isCollapsed && (
              <span className="truncate text-left">{bottomMenu.name}</span>
            )}
          </button>

          <div
            className={`rounded-2xl bg-slate-50 p-3 ${
              isCollapsed ? "text-center" : ""
            }`}
          >
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              {isCollapsed ? "POS" : "Mode"}
            </p>

            {!isCollapsed && (
              <p className="mt-1 text-xs font-bold text-slate-700">
                Local Storage
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar