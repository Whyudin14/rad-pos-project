import { useLocation, useNavigate } from "react-router-dom"

const menuItems = [
  { name: "Dashboard", icon: "🏠", path: "/" },
  { name: "Produk", icon: "👟" },
  { name: "Kategori", icon: "🏷️" },
  { name: "Stok Barang", icon: "📦" },
  { name: "POS / Kasir", icon: "🧾", path: "/kasir" },
  { name: "Riwayat Penjualan", icon: "📊" },
  { name: "Settlement", icon: "💰" },
  { name: "Pengaturan", icon: "⚙️" },
]

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside className="w-72 min-h-screen bg-white border-r border-slate-200 px-5 py-6">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
            R
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">RAD POS</h1>
            <p className="text-xs text-slate-400">Sport Retail System</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = item.path === location.pathname

          return (
            <button
              key={item.name}
              onClick={() => item.path && navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar