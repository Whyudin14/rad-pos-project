import { Routes, Route } from "react-router-dom"

import Dashboard from "../pages/Dashboard"
import LaporanPenjualan from "../pages/LaporanPenjualan"
import Produk from "../pages/Produk"
import Kategori from "../pages/Kategori"
import DataBarang from "../pages/DataBarang"
import POSKasir from "../pages/POSKasir"
import RiwayatTransaksi from "../pages/RiwayatTransaksi"
import StokBarang from "../pages/StokBarang"
import StockOpname from "../pages/StockOpname"
import MutasiStok from "../pages/MutasiStok"
import Settlement from "../pages/Settlement"
import Pengaturan from "../pages/Pengaturan"

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/laporan-penjualan" element={<LaporanPenjualan />} />

      <Route path="/produk" element={<Produk />} />
      <Route path="/kategori" element={<Kategori />} />

      <Route path="/data-barang" element={<DataBarang />} />
      <Route path="/stok-barang" element={<StokBarang />} />
      <Route path="/stock-opname" element={<StockOpname />} />
      <Route path="/mutasi-stok" element={<MutasiStok />} />

      <Route path="/kasir" element={<POSKasir />} />
      <Route path="/riwayat-transaksi" element={<RiwayatTransaksi />} />
      <Route path="/settlement" element={<Settlement />} />
      <Route path="/pengaturan" element={<Pengaturan />} />
    </Routes>
  )
}

export default AppRoutes