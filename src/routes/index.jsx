import { BrowserRouter, Routes, Route } from "react-router-dom"

import Dashboard from "../pages/Dashboard"
import POSKasir from "../pages/POSKasir"
import RiwayatTransaksi from "../pages/RiwayatTransaksi"
import StokBarang from "../pages/StokBarang"

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/kasir" element={<POSKasir />} />
        <Route path="/riwayat-transaksi" element={<RiwayatTransaksi />} />
        <Route path="/stok-barang" element={<StokBarang />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes