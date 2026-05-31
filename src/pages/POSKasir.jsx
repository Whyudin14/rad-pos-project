import { useEffect, useMemo, useState } from "react"
import { createRoot } from "react-dom/client"

import MainLayout from "../layouts/MainLayout"
import ProductCard from "../components/ProductCard"
import CartItem from "../components/CartItem"
import CheckoutModal from "../components/CheckoutModal"
import ReceiptSuccessModal from "../components/ReceiptSuccessModal"
import EditCartItemModal from "../components/EditCartItemModal"
import PrintReceipt from "../components/PrintReceipt"
import ProductVariantModal from "../components/ProductVariantModal"

import {
  saveTransaction,
  generateInvoiceNumber,
} from "../utils/transactionStorage"

const PRODUCT_STORAGE_KEY = "radProducts"

function POSKasir() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [barcodeInput, setBarcodeInput] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [lastTransaction, setLastTransaction] = useState(null)
  const [isMember, setIsMember] = useState(false)
  const [selectedCartItem, setSelectedCartItem] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)

  const formatRupiah = (number) => {
    return `Rp ${Number(number || 0).toLocaleString("id-ID")}`
  }

  const getVariantValue = (variant) => {
    return (
      variant?.value ||
      variant?.ukuran ||
      variant?.size ||
      variant?.variantValue ||
      "-"
    )
  }

  const getVariantPrice = (product, variant) => {
    return Number(
      variant?.price ||
        variant?.hargaJual ||
        variant?.sellingPrice ||
        product?.price ||
        product?.hargaJual ||
        0
    )
  }

  const getVariantStock = (variant) => {
    return Number(variant?.stock || variant?.stok || 0)
  }

  const splitProductNameAndColor = (rawName = "") => {
    const name = String(rawName || "").trim()

    if (!name.includes(" - ")) {
      return {
        displayName: name,
        color: "",
      }
    }

    const parts = name.split(" - ")
    const displayName = parts[0]?.trim() || name
    const color = parts.slice(1).join(" - ").trim()

    return {
      displayName,
      color,
    }
  }

  const normalizeProductForPOS = (product) => {
    const variants = Array.isArray(product.variants) ? product.variants : []

    const totalStock = variants.reduce((sum, variant) => {
      return sum + getVariantStock(variant)
    }, 0)

    const variantPrices = variants
      .map((variant) => getVariantPrice(product, variant))
      .filter((price) => price > 0)

    const lowestPrice =
      variantPrices.length > 0
        ? Math.min(...variantPrices)
        : Number(product.price || product.hargaJual || 0)

    const rawName =
      product.name || product.namaProduk || product.productName || "-"

    const productColor =
      product.color || product.warna || product.productColor || ""

    const parsedProduct = splitProductNameAndColor(rawName)

    return {
      ...product,
      id: product.id || product.productId || crypto.randomUUID(),
      name: rawName,
      displayName: parsedProduct.displayName,
      color: productColor || parsedProduct.color,
      brand: product.brand || product.merek || "",
      category: product.category || product.kategori || "Tanpa Kategori",
      price: lowestPrice,
      stock: totalStock,
      variants,
    }
  }

  const loadProductsFromStorage = () => {
    try {
      const storedProducts = JSON.parse(
        localStorage.getItem(PRODUCT_STORAGE_KEY) || "[]"
      )

      if (!Array.isArray(storedProducts)) {
        setProducts([])
        return
      }

      const activeProducts = storedProducts
        .filter((product) => {
          const isActive = product.isActive !== false
          const showInPOS = product.showInPOS !== false

          return isActive && showInPOS
        })
        .map(normalizeProductForPOS)

      setProducts(activeProducts)
    } catch (error) {
      console.error("Gagal membaca radProducts:", error)
      setProducts([])
    }
  }

  useEffect(() => {
    loadProductsFromStorage()

    const handleFocus = () => {
      loadProductsFromStorage()
    }

    const handleStorageChange = (event) => {
      if (event.key === PRODUCT_STORAGE_KEY) {
        loadProductsFromStorage()
      }
    }

    window.addEventListener("focus", handleFocus)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ]

    return ["All", ...uniqueCategories]
  }, [products])

  const addToCart = (product) => {
    if (!product?.variants || product.variants.length === 0) {
      alert("Produk ini belum punya varian ukuran.")
      return
    }

    setSelectedProduct(product)
    setSelectedVariant(null)
  }

  const addProductVariantToCart = (product, variantData) => {
    if (!product || !variantData) return false

    const productId = product.id
    const variantId = variantData.id || variantData.variantId || null
    const variantValue = getVariantValue(variantData)
    const variantPrice = getVariantPrice(product, variantData)
    const variantStock = getVariantStock(variantData)

    if (variantStock <= 0) {
      alert("Stok varian ini kosong")
      return false
    }

    const cartId = `${productId}-${variantId || variantValue}`
    const existingItem = cart.find((item) => item.cartId === cartId)

    if (existingItem) {
      setSelectedCartItem(existingItem)
      return true
    }

    const variantSku = variantData.sku || variantData.variantSku || ""
    const variantBarcode =
      variantData.barcode || variantData.variantBarcode || ""

    const newItem = {
      ...product,

      cartId,
      productId,
      variantId,

      id: productId,
      name: product.name,
      category: product.category,
      brand: product.brand,

      qty: 1,
      stock: variantStock,
      price: variantPrice,
      harga: variantPrice,
      customPrice: variantPrice,
      discountPercent: 0,
      note: "",

      variantType: product.variantType || "Ukuran",
      variantValue,
      ukuran: variantValue,
      variantStock,

      sku: variantSku || product.sku || "",
      barcode: variantBarcode || product.barcode || "",

      productSku: product.sku || "",
      productBarcode: product.barcode || "",
      variantSku,
      variantBarcode,
    }

    setCart((prevCart) => [...prevCart, newItem])
    setSelectedCartItem(newItem)

    return true
  }

  const confirmAddToCart = (variantData = selectedVariant) => {
    if (!selectedProduct || !variantData) return

    const success = addProductVariantToCart(selectedProduct, variantData)

    if (success) {
      setSelectedProduct(null)
      setSelectedVariant(null)
    }
  }

  const handleBarcodeSubmit = (e) => {
    e.preventDefault()

    const keyword = barcodeInput.trim()
    if (!keyword) return

    const normalizedKeyword = keyword.toLowerCase()

    for (const product of products) {
      const matchedVariant = product.variants?.find((variant) => {
        const variantSku = String(
          variant.sku || variant.variantSku || ""
        ).toLowerCase()

        const variantBarcode = String(
          variant.barcode || variant.variantBarcode || ""
        )

        return variantBarcode === keyword || variantSku === normalizedKeyword
      })

      if (matchedVariant) {
        addProductVariantToCart(product, matchedVariant)
        setBarcodeInput("")
        return
      }
    }

    const matchedProduct = products.find((product) => {
      const productSku = String(product.sku || "").toLowerCase()
      const productBarcode = String(product.barcode || "")

      return productBarcode === keyword || productSku === normalizedKeyword
    })

    if (matchedProduct) {
      addToCart(matchedProduct)
      setBarcodeInput("")
      return
    }

    alert("Barcode / SKU tidak ditemukan")
    setBarcodeInput("")
  }

  const removeItem = (targetId) => {
    setCart(
      cart.filter((item) => {
        const itemTargetId = item.cartId || item.id
        return itemTargetId !== targetId
      })
    )
  }

  const saveCartItemEdit = (id, updatedData) => {
    const targetId = selectedCartItem?.cartId || id

    setCart(
      cart.map((item) => {
        const itemTargetId = item.cartId || item.id

        if (itemTargetId === targetId) {
          return {
            ...item,
            ...updatedData,
          }
        }

        return item
      })
    )
  }

  const subtotal = cart.reduce((total, item) => {
    const customPrice = Number(item.customPrice || 0)
    const discountPercent = Number(item.discountPercent || 0)
    const qty = Number(item.qty || 0)

    const priceAfterDiscount =
      customPrice - (customPrice * discountPercent) / 100

    return total + priceAfterDiscount * qty
  }, 0)

  const totalDiscount = cart.reduce((total, item) => {
    const customPrice = Number(item.customPrice || 0)
    const discountPercent = Number(item.discountPercent || 0)
    const qty = Number(item.qty || 0)

    const discountValue = ((customPrice * discountPercent) / 100) * qty

    return total + discountValue
  }, 0)

  const memberDiscount = isMember && subtotal >= 300000 ? subtotal * 0.05 : 0
  const grandTotal = subtotal - memberDiscount

  const totalItems = cart.reduce((total, item) => {
    return total + Number(item.qty || 0)
  }, 0)

  const validateCartStock = () => {
    const invalidItem = cart.find((item) => {
      const qty = Number(item.qty || 0)
      const stock = Number(item.variantStock ?? item.stock ?? 0)

      return stock > 0 && qty > stock
    })

    if (invalidItem) {
      const variantLabel =
        invalidItem.variantValue || invalidItem.ukuran
          ? ` ukuran ${invalidItem.variantValue || invalidItem.ukuran}`
          : ""

      alert(
        `Qty produk "${invalidItem.name}"${variantLabel} melebihi stok tersedia.\n\nStok tersedia: ${
          invalidItem.variantStock ?? invalidItem.stock ?? 0
        }\nQty di keranjang: ${invalidItem.qty}`
      )

      setSelectedCartItem(invalidItem)
      return false
    }

    return true
  }

  const handleOpenCheckout = () => {
    if (cart.length === 0) return

    const isCartValid = validateCartStock()

    if (!isCartValid) return

    setIsCheckoutOpen(true)
  }

  const handleFinishTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
      invoiceNumber: generateInvoiceNumber(),
      date: new Date().toISOString(),
      status: "Lunas",
    }

    saveTransaction(newTransaction)

    setLastTransaction(newTransaction)
    setIsCheckoutOpen(false)
    setIsReceiptOpen(true)
    setCart([])
    setIsMember(false)
  }

  const handlePrintReceipt = () => {
    if (!lastTransaction) return

    const printWindow = window.open("", "_blank", "width=360,height=640")

    if (!printWindow) {
      alert("Popup print diblokir browser. Izinkan popup dulu ya.")
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak Struk</title>
          <style>
            @page {
              size: 58mm auto;
              margin: 0;
            }

            * {
              box-sizing: border-box;
            }

            html,
            body {
              width: 58mm;
              margin: 0;
              padding: 0;
              background: #fff;
              color: #000;
              font-family: Arial, Helvetica, sans-serif;
            }

            #print-root {
              width: 58mm;
              max-width: 58mm;
              margin: 0;
              padding: 6px 5px;
            }

            .print-receipt {
              width: 100%;
              max-width: 100%;
              font-size: 10px;
              line-height: 1.28;
            }

            .receipt-header {
              text-align: center;
            }

            .receipt-logo {
              margin-bottom: 3px;
              font-size: 12px;
              font-weight: 900;
              letter-spacing: 1px;
            }

            .receipt-header h2 {
              margin: 0;
              font-size: 12px;
              font-weight: 900;
              line-height: 1.2;
            }

            .receipt-header p {
              margin: 1px 0;
              font-size: 9.5px;
              line-height: 1.25;
            }

            .line {
              width: 100%;
              margin: 6px 0;
              border-top: 1px dashed #000;
            }

            .receipt-info {
              display: grid;
              grid-template-columns: 1fr auto;
              gap: 6px;
              font-size: 10px;
            }

            .receipt-info p {
              margin: 1px 0;
            }

            .right {
              text-align: right;
              white-space: nowrap;
            }

            .receipt-items {
              display: flex;
              flex-direction: column;
              gap: 6px;
            }

            .receipt-item p {
              margin: 0;
            }

            .item-name {
              font-size: 10.5px;
              font-weight: 900;
              line-height: 1.25;
              text-transform: uppercase;
              word-break: break-word;
            }

            .row {
              display: grid;
              grid-template-columns: 1fr auto;
              gap: 6px;
              align-items: start;
            }

            .row span:first-child {
              min-width: 0;
              word-break: break-word;
            }

            .row span:last-child {
              text-align: right;
              white-space: nowrap;
            }

            .small {
              font-size: 9.5px;
            }

            .note {
              margin-top: 2px !important;
              font-size: 9.5px;
              font-style: italic;
            }

            .summary,
            .payment {
              display: flex;
              flex-direction: column;
              gap: 3px;
            }

            .total {
              margin-bottom: 3px;
              font-size: 12.5px;
              font-weight: 900;
            }

            .receipt-footer {
              text-align: center;
            }

            .receipt-footer p {
              margin: 2px 0;
              font-size: 10px;
            }

            @media print {
              html,
              body {
                width: 58mm;
                margin: 0;
                padding: 0;
              }

              #print-root {
                width: 58mm;
                max-width: 58mm;
                padding: 6px 5px;
              }
            }
          </style>
        </head>

        <body>
          <div id="print-root"></div>
        </body>
      </html>
    `)

    printWindow.document.close()

    const rootElement = printWindow.document.getElementById("print-root")
    const root = createRoot(rootElement)

    root.render(<PrintReceipt transaction={lastTransaction} />)

    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
    }, 500)
  }

  const filteredProducts = products.filter((product) => {
    const keyword = searchTerm.toLowerCase()

    const matchSearch =
      product.name?.toLowerCase().includes(keyword) ||
      product.displayName?.toLowerCase().includes(keyword) ||
      product.color?.toLowerCase().includes(keyword) ||
      product.category?.toLowerCase().includes(keyword) ||
      product.brand?.toLowerCase().includes(keyword) ||
      product.sku?.toLowerCase().includes(keyword) ||
      product.barcode?.includes(searchTerm) ||
      product.variants?.some((variant) => {
        return (
          String(variant.sku || "").toLowerCase().includes(keyword) ||
          String(variant.barcode || "").includes(searchTerm) ||
          String(getVariantValue(variant)).toLowerCase().includes(keyword)
        )
      })

    const matchCategory =
      selectedCategory === "All" || product.category === selectedCategory

    return matchSearch && matchCategory
  })

  return (
    <MainLayout>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">
            RAD Sport POS
          </p>
          <h1 className="text-3xl font-bold">POS / Kasir</h1>
          <p className="mt-1 text-slate-500">
            Proses transaksi penjualan toko.
          </p>
        </div>

        <form
          onSubmit={handleBarcodeSubmit}
          className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
        >
          <input
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            placeholder="Scan / input barcode..."
            className="h-11 flex-1 rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
          />

          <button
            type="submit"
            className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700"
          >
            Scan
          </button>
        </form>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari produk, brand, SKU, barcode, atau ukuran..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-5 py-4 text-sm outline-none"
            />
          </div>

          <div className="mb-5 flex items-center gap-3 overflow-x-auto pb-1">
            {categories.map((category) => {
              const isActive = selectedCategory === category

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-medium transition ${
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
              <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 text-center">
                <p className="font-bold text-slate-500">
                  Produk POS tidak ditemukan
                </p>
                <p className="mt-1 max-w-md text-sm text-slate-400">
                  Pastikan produk di Stok Barang masih aktif dan data produk
                  sudah tersimpan.
                </p>
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

        <div className="sticky top-6 h-[calc(100vh-80px)] rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-full flex-col">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">Keranjang</h3>
                <p className="text-sm text-slate-400">
                  {cart.length === 0
                    ? "Belum ada produk dipilih"
                    : `${cart.length} jenis produk • ${totalItems} item`}
                </p>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs font-semibold text-red-500 hover:text-red-600"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="mb-3 flex-1 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                  Cart masih kosong
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <CartItem
                      key={item.cartId || item.id}
                      item={item}
                      onRemove={() => removeItem(item.cartId || item.id)}
                      onEdit={() => setSelectedCartItem(item)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 bg-white pt-3">
              <div className="mb-3 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-2.5">
                <div>
                  <p className="text-sm font-bold text-slate-700">Member</p>
                  <p className="text-xs text-slate-400">5% min. Rp 300.000</p>
                </div>

                <input
                  type="checkbox"
                  checked={isMember}
                  onChange={(e) => setIsMember(e.target.checked)}
                  className="h-5 w-5"
                />
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Subtotal Net</span>
                  <span className="font-bold">{formatRupiah(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Diskon Reguler</span>
                  <span className="font-bold text-emerald-600">
                    - {formatRupiah(totalDiscount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Diskon Member</span>
                  <span className="font-bold text-emerald-600">
                    - {formatRupiah(memberDiscount)}
                  </span>
                </div>
              </div>

              <div className="my-3 border-t border-slate-200" />

              <div className="mb-3 flex items-end justify-between">
                <span className="text-sm font-bold text-slate-500">
                  Total Akhir
                </span>
                <span className="text-3xl font-black leading-none text-blue-600">
                  {formatRupiah(grandTotal)}
                </span>
              </div>

              <button
                onClick={handleOpenCheckout}
                disabled={cart.length === 0}
                className="w-full rounded-2xl bg-blue-600 py-3.5 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        total={grandTotal}
        totalDiscount={totalDiscount}
        memberDiscount={memberDiscount}
        isMember={isMember}
        onFinishTransaction={handleFinishTransaction}
      />

      <ReceiptSuccessModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transaction={lastTransaction}
        onPrintReceipt={handlePrintReceipt}
      />

      <EditCartItemModal
        isOpen={!!selectedCartItem}
        onClose={() => setSelectedCartItem(null)}
        item={selectedCartItem}
        onSave={saveCartItemEdit}
      />

      <ProductVariantModal
        isOpen={!!selectedProduct}
        onClose={() => {
          setSelectedProduct(null)
          setSelectedVariant(null)
        }}
        product={selectedProduct}
        selectedVariant={selectedVariant}
        setSelectedVariant={setSelectedVariant}
        onConfirm={confirmAddToCart}
      />
    </MainLayout>
  )
}

export default POSKasir