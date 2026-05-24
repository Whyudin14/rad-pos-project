import { BrowserRouter, Routes, Route } from "react-router-dom"

import Dashboard from "../pages/Dashboard"
import POSKasir from "../pages/POSKasir"
import RiwayatTransaksi from "../pages/RiwayatTransaksi"

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/kasir" element={<POSKasir />} />
        <Route path="/riwayat-transaksi" element={<RiwayatTransaksi />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes