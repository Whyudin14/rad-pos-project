import { BrowserRouter, Routes, Route } from "react-router-dom"

import Dashboard from "../pages/Dashboard"
import POSKasir from "../pages/POSKasir"

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/kasir" element={<POSKasir />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes