import { useLocation, useNavigate } from "react-router-dom"

const menuItems = [
  { name: "Dashboard", icon: "🏠", path: "/" },
  { name: "Produk", icon: "👟", path: "/produk" },
  { name: "Kategori", icon: "🏷️", path: "/kategori" },
  { name: "Stok Barang", icon: "📦", path: "/stok-barang" },
  { name: "POS / Kasir", icon: "🧾", path: "/kasir" },
  { name: "Riwayat Penjualan", icon: "📊", path: "/riwayat-transaksi" },
  { name: "Settlement", icon: "💰", path: "/settlement" },
  { name: "Pengaturan", icon: "⚙️", path: "/pengaturan" },
]

function Sidebar({ isCollapsed = false, onToggle }) {
  const navigate = useNavigate()
  const location = useLocation()

  const isMenuActive = (itemPath) => {
    if (itemPath === "/") {
      return location.pathname === "/"
    }

    return location.pathname === itemPath
  }

  return (
    <aside
      className={`h-screen shrink-0 border-r border-slate-200 bg-white transition-all duration-300 ${
        isCollapsed ? "w-24" : "w-72"
      }`}
    >
      <div className="flex h-full flex-col">
        <div
          className={`shrink-0 border-b border-slate-100 px-5 py-5 ${
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
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-sm">
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
              className="mt-4 flex h-9 w-full items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-600 transition hover:bg-slate-200"
            >
              ›
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-5">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = isMenuActive(item.path)

              return (
                <button
                  key={item.name}
                  onClick={() => item.path && navigate(item.path)}
                  title={isCollapsed ? item.name : ""}
                  className={`group flex w-full items-center rounded-2xl text-sm font-bold transition ${
                    isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3"
                  } ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center text-base">
                    {item.icon}
                  </span>

                  {!isCollapsed && (
                    <span className="truncate text-left">{item.name}</span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="shrink-0 border-t border-slate-100 px-4 py-4">
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