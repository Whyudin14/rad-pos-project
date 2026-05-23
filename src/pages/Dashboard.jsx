import MainLayout from "../layouts/MainLayout"
import StatCard from "../components/StatCard"
import TransactionTable from "../components/TransactionTable"

function Dashboard() {
  return (
    <MainLayout>
      <header className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-medium text-blue-600 mb-1">
            RAD Sport POS
          </p>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-slate-500 mt-1">
            Pantau transaksi, stok, dan performa toko hari ini.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-80 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
            <input
              type="text"
              placeholder="Cari produk, transaksi, invoice..."
              className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-xs text-slate-400">Admin</p>
            <p className="font-semibold text-sm">RAD Sport</p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-4 gap-5 mb-8">
        <StatCard title="Penjualan Hari Ini" value="Rp 2.450.000" note="+12% dari kemarin" icon="💳" />
        <StatCard title="Total Transaksi" value="32" note="Transaksi selesai" icon="🧾" />
        <StatCard title="Produk Terjual" value="58 Item" note="Dari semua kategori" icon="👟" />
        <StatCard title="Stok Menipis" value="7 Produk" note="Perlu restock" icon="⚠️" />
      </section>

      <section className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <TransactionTable />
        </div>

        <div className="space-y-6">
          <div className="bg-blue-600 text-white rounded-3xl shadow-sm p-6">
            <p className="text-blue-100 text-sm">Quick Action</p>
            <h3 className="text-2xl font-bold mt-2 mb-6">
              Mulai transaksi baru
            </h3>

            <button className="w-full bg-white text-blue-600 font-semibold py-3 rounded-2xl hover:bg-blue-50 transition">
              Buka Kasir
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold mb-2">Reminder Stok</h3>
            <p className="text-sm text-slate-500 mb-4">
              Beberapa produk mulai menipis dan perlu dicek ulang.
            </p>

            <button className="w-full bg-slate-100 text-slate-700 font-semibold py-3 rounded-2xl hover:bg-slate-200 transition">
              Cek Stok Barang
            </button>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}

export default Dashboard