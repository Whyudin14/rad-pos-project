import { BrowserRouter, Routes, Route } from "react-router-dom"

import Dashboard from "../pages/Dashboard"
import POSKasir from "../pages/POSKasir"
import RiwayatTransaksi from "../pages/RiwayatTransaksi"
import StokBarang from "../pages/StokBarang"
import Settlement from "../pages/Settlement"

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/kasir" element={<POSKasir />} />
        <Route path="/riwayat-transaksi" element={<RiwayatTransaksi />} />
        <Route path="/stok-barang" element={<StokBarang />} />
        <Route path="/settlement" element={<Settlement />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes