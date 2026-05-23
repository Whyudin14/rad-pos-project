import { useState } from "react"
import MainLayout from "../layouts/MainLayout"
import ProductCard from "../components/ProductCard"
import CartItem from "../components/CartItem"

const products = [
  {
    id: 1,
    name: "MILLS Running",
    stock: 12,
    price: 549000,
    category: "Running",
  },
  {
    id: 2,
    name: "Ortuseight Futsal",
    stock: 8,
    price: 399000,
    category: "Futsal",
  },
  {
    id: 3,
    name: "Specs Accelerator",
    stock: 5,
    price: 699000,
    category: "Football",
  },
  {
    id: 4,
    name: "Kaos Sport RAD",
    stock: 20,
    price: 129000,
    category: "Apparel",
  },
]

const categories = [
  "All",
  "Running",
  "Running Junior",
  "Futsal",
  "Futsal Junior",
  "Football",
  "Football Junior",
  "Volleyball",
  "Lifestyle",
  "Sandals",
  "Apparel",
  "Accessories",
]

function POSKasir() {
  const [cart, setCart] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id)

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      )
    } else {
      setCart([...cart, { ...product, qty: 1 }])
    }
  }

  const increaseQty = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    )
  }

  const decreaseQty = (id) => {
    setCart(
      cart
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    )
  }

  const removeItem = (id) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.qty,
    0
  )

  const formatRupiah = (number) => {
    return `Rp ${number.toLocaleString("id-ID")}`
  }

  const filteredProducts = products.filter((product) => {
  const matchSearch =
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())

  const matchCategory =
    selectedCategory === "All" ||
    product.category === selectedCategory

  return matchSearch && matchCategory
  })

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-medium text-blue-600 mb-1">
            RAD Sport POS
          </p>

          <h1 className="text-3xl font-bold">POS / Kasir</h1>

          <p className="text-slate-500 mt-1">
            Proses transaksi penjualan toko.
          </p>
        </div>

        <button className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition">
          Scan Barcode
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-5">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari produk atau scan barcode..."
                className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 outline-none text-sm"
            />
          </div>

          <div className="flex items-center gap-3 mb-5 overflow-x-auto">
            {categories.map((category) => {
                const isActive = selectedCategory === category

                return (
                <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap transition ${
                    isActive
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                    {category}
                </button>
                )
            })}
          </div>

          <div className="min-h-[520px] overflow-y-auto rounded-3xl">
            {filteredProducts.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                Produk tidak ditemukan
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-5">
                {filteredProducts.map((product) => (
                    <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    />
                ))}
                </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-xl font-bold">Keranjang</h3>
            <p className="text-sm text-slate-400">
              {cart.length === 0
                ? "Belum ada produk dipilih"
                : `${cart.length} produk dipilih`}
            </p>
          </div>

          <div className="h-[350px] overflow-y-auto mb-5">
            {cart.length === 0 ? (
              <div className="h-full border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-400">
                Cart masih kosong
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onIncrease={increaseQty}
                    onDecrease={decreaseQty}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold">{formatRupiah(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between mb-5">
              <span className="text-slate-500">Total</span>
              <span className="text-3xl font-bold text-blue-600">
                {formatRupiah(subtotal)}
              </span>
            </div>

            <button
              disabled={cart.length === 0}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default POSKasir