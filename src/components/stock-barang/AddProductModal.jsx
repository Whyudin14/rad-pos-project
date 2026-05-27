import { useMemo, useState } from "react"

const categoryOptions = [
  "Running",
  "Running Junior",
  "Lifestyle",
  "Lifestyle Junior",
  "Football",
  "Football Junior",
  "Futsal",
  "Futsal Junior",
  "Aksesoris",
]

const initialVariant = {
  value: "",
  stock: "",
  sku: "",
  barcode: "",
  price: "",
  minimumStock: "",
}

function AddProductModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "Running",
    sku: "",
    barcode: "",
    basePrice: "",
    price: "",
    minimumStock: "",
    rackLocation: "",
    description: "",
    showInPOS: true,
    useStock: true,
  })

  const [variants, setVariants] = useState([
    {
      ...initialVariant,
      value: "40",
      stock: "",
    },
  ])

  const totalVariantStock = useMemo(() => {
    return variants.reduce((total, variant) => {
      return total + Number(variant.stock || 0)
    }, 0)
  }, [variants])

  const marginAmount =
    Number(formData.price || 0) - Number(formData.basePrice || 0)

  const marginPercent =
    Number(formData.basePrice || 0) > 0
      ? Math.round((marginAmount / Number(formData.basePrice || 0)) * 100)
      : 0

  const handleChange = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleVariantChange = (index, field, value) => {
    setVariants((current) => {
      return current.map((variant, variantIndex) => {
        if (variantIndex !== index) return variant

        return {
          ...variant,
          [field]: value,
        }
      })
    })
  }

  const addVariantRow = () => {
    setVariants((current) => [
      ...current,
      {
        ...initialVariant,
      },
    ])
  }

  const removeVariantRow = (index) => {
    setVariants((current) => {
      if (current.length === 1) return current

      return current.filter((_, variantIndex) => variantIndex !== index)
    })
  }

  const generateSku = () => {
    const brandCode = formData.brand
      ? formData.brand.toUpperCase().replace(/\s/g, "").slice(0, 4)
      : "RAD"

    const categoryCode = formData.category
      ? formData.category.toUpperCase().replace(/\s/g, "").slice(0, 4)
      : "PROD"

    return `${brandCode}-${categoryCode}-${Date.now().toString().slice(-5)}`
  }

  const submitProduct = (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert("Nama produk wajib diisi.")
      return
    }

    if (!formData.brand.trim()) {
      alert("Brand wajib diisi.")
      return
    }

    if (!formData.category) {
      alert("Kategori wajib dipilih.")
      return
    }

    if (!formData.price || Number(formData.price) <= 0) {
      alert("Harga jual wajib diisi dan harus lebih dari 0.")
      return
    }

    if (Number(formData.basePrice || 0) < 0) {
      alert("Harga modal tidak boleh minus.")
      return
    }

    if (Number(formData.minimumStock || 0) < 0) {
      alert("Minimum stok tidak boleh minus.")
      return
    }

    const filledVariants = variants.filter((variant) => {
      return (
        String(variant.value || "").trim() ||
        String(variant.stock || "").trim() ||
        String(variant.sku || "").trim() ||
        String(variant.barcode || "").trim()
      )
    })

    if (filledVariants.length === 0) {
      alert("Minimal isi 1 varian ukuran/stok.")
      return
    }

    const emptySizeVariant = filledVariants.find((variant) => {
      return !String(variant.value || "").trim()
    })

    if (emptySizeVariant) {
      alert("Ukuran varian tidak boleh kosong.")
      return
    }

    const invalidNumberVariant = filledVariants.find((variant) => {
      return (
        Number(variant.stock || 0) < 0 ||
        Number(variant.price || 0) < 0 ||
        Number(variant.minimumStock || 0) < 0
      )
    })

    if (invalidNumberVariant) {
      alert("Stok, harga varian, dan minimum stok tidak boleh minus.")
      return
    }

    const variantValues = filledVariants.map((variant) => {
      return String(variant.value || "").trim().toLowerCase()
    })

    const hasDuplicateVariant = variantValues.some((value, index) => {
      return variantValues.indexOf(value) !== index
    })

    if (hasDuplicateVariant) {
      alert("Ukuran varian tidak boleh dobel.")
      return
    }

    const productSku = formData.sku || generateSku()

    const cleanedVariants = filledVariants.map((variant, index) => {
      const variantValue = String(variant.value || "-").trim()

      return {
        id: `VAR-${Date.now()}-${index}`,
        value: variantValue,
        stock: Number(variant.stock || 0),
        sku:
          variant.sku ||
          `${productSku}-${variantValue.toString().replace(/\s/g, "")}`,
        barcode: variant.barcode || "",
        price: Number(variant.price || formData.price || 0),
        minimumStock:
          variant.minimumStock === ""
            ? Number(formData.minimumStock || 0)
            : Number(variant.minimumStock || 0),
      }
    })

    const newProduct = {
      id: `PROD-${Date.now()}`,
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      category: formData.category,
      sku: productSku,
      barcode: formData.barcode,
      basePrice: Number(formData.basePrice || 0),
      price: Number(formData.price || 0),
      stock: cleanedVariants.reduce((total, variant) => {
        return total + Number(variant.stock || 0)
      }, 0),
      minimumStock: Number(formData.minimumStock || 0),
      rackLocation: formData.rackLocation,
      description: formData.description,
      variantType: "Ukuran",
      showInPOS: formData.showInPOS,
      useStock: formData.useStock,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variants: cleanedVariants,
    }

    onSave(newProduct)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-blue-600">
              Manajemen Barang
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              Tambah Produk
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Tambahkan produk RAD Sport lengkap dengan stok per ukuran.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submitProduct} className="overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <SectionCard title="Informasi Produk">
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    label="Nama Produk"
                    required
                    value={formData.name}
                    onChange={(value) => handleChange("name", value)}
                    placeholder="Contoh: MILLS Enermax"
                  />

                  <InputField
                    label="Brand"
                    required
                    value={formData.brand}
                    onChange={(value) => handleChange("brand", value)}
                    placeholder="Contoh: MILLS"
                  />

                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                      Kategori <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={formData.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                    >
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <InputField
                    label="Letak Rak"
                    value={formData.rackLocation}
                    onChange={(value) => handleChange("rackLocation", value)}
                    placeholder="Contoh: Rak Running A1"
                  />

                  <InputField
                    label="SKU Produk"
                    value={formData.sku}
                    onChange={(value) => handleChange("sku", value)}
                    placeholder="Kosongkan untuk auto"
                  />

                  <InputField
                    label="Barcode Produk"
                    value={formData.barcode}
                    onChange={(value) => handleChange("barcode", value)}
                    placeholder="Opsional"
                  />
                </div>
              </SectionCard>

              <SectionCard title="Harga & Stok">
                <div className="grid gap-4 md:grid-cols-3">
                  <InputField
                    label="Harga Modal"
                    type="number"
                    value={formData.basePrice}
                    onChange={(value) => handleChange("basePrice", value)}
                    placeholder="0"
                  />

                  <InputField
                    label="Harga Jual"
                    required
                    type="number"
                    value={formData.price}
                    onChange={(value) => handleChange("price", value)}
                    placeholder="0"
                  />

                  <InputField
                    label="Minimum Stok"
                    type="number"
                    value={formData.minimumStock}
                    onChange={(value) => handleChange("minimumStock", value)}
                    placeholder="0"
                  />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <InfoBox label="Total Stok" value={totalVariantStock} />
                  <InfoBox
                    label="Margin"
                    value={
                      marginAmount > 0
                        ? `Rp ${marginAmount.toLocaleString("id-ID")}`
                        : "Rp 0"
                    }
                  />
                  <InfoBox
                    label="Markup"
                    value={`${marginPercent > 0 ? marginPercent : 0}%`}
                  />
                </div>
              </SectionCard>
            </div>

            <div className="space-y-5">
              <SectionCard title="Pengaturan">
                <div className="space-y-3">
                  <CheckRow
                    checked={formData.showInPOS}
                    onChange={() =>
                      handleChange("showInPOS", !formData.showInPOS)
                    }
                    label="Tampilkan di POS Kasir"
                    description="Produk akan muncul di halaman transaksi."
                  />

                  <CheckRow
                    checked={formData.useStock}
                    onChange={() => handleChange("useStock", !formData.useStock)}
                    label="Gunakan stok"
                    description="Stok produk akan dihitung dan bisa dipakai untuk SO."
                  />
                </div>
              </SectionCard>

              <SectionCard title="Keterangan">
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Catatan produk, warna, seri, atau info tambahan..."
                  className="min-h-28 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </SectionCard>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Varian Ukuran
                </h3>
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  Isi ukuran dan stok fisik awal. Total stok akan dihitung otomatis.
                </p>
              </div>

              <button
                type="button"
                onClick={addVariantRow}
                className="rounded-2xl bg-blue-50 px-4 py-2.5 text-sm font-black text-blue-600 transition hover:bg-blue-100"
              >
                + Tambah Varian
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <div className="min-w-[850px]">
                <div className="grid grid-cols-[0.7fr_0.7fr_1fr_1fr_0.8fr_0.7fr_auto] gap-3 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-400">
                  <span>Ukuran</span>
                  <span>Stok</span>
                  <span>SKU</span>
                  <span>Barcode</span>
                  <span>Harga</span>
                  <span>Min</span>
                  <span>Aksi</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[0.7fr_0.7fr_1fr_1fr_0.8fr_0.7fr_auto] gap-3 px-4 py-3"
                    >
                      <SmallInput
                        value={variant.value}
                        onChange={(value) =>
                          handleVariantChange(index, "value", value)
                        }
                        placeholder="40"
                      />

                      <SmallInput
                        type="number"
                        value={variant.stock}
                        onChange={(value) =>
                          handleVariantChange(index, "stock", value)
                        }
                        placeholder="0"
                      />

                      <SmallInput
                        value={variant.sku}
                        onChange={(value) =>
                          handleVariantChange(index, "sku", value)
                        }
                        placeholder="Auto"
                      />

                      <SmallInput
                        value={variant.barcode}
                        onChange={(value) =>
                          handleVariantChange(index, "barcode", value)
                        }
                        placeholder="Opsional"
                      />

                      <SmallInput
                        type="number"
                        value={variant.price}
                        onChange={(value) =>
                          handleVariantChange(index, "price", value)
                        }
                        placeholder="Ikut harga"
                      />

                      <SmallInput
                        type="number"
                        value={variant.minimumStock}
                        onChange={(value) =>
                          handleVariantChange(index, "minimumStock", value)
                        }
                        placeholder="Ikut min"
                      />

                      <button
                        type="button"
                        onClick={() => removeVariantRow(index)}
                        className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300"
                        disabled={variants.length === 1}
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 mt-5 flex flex-col gap-3 border-t border-slate-100 bg-white pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-200"
            >
              Batal
            </button>

            <button
              type="submit"
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
            >
              Simpan Produk
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-black text-slate-900">{title}</h3>
      {children}
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  )
}

function SmallInput({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
    />
  )
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-slate-900">{value}</p>
    </div>
  )
}

function CheckRow({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-start gap-3 rounded-2xl bg-slate-50 p-4 text-left transition hover:bg-slate-100"
    >
      <span
        className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md text-xs font-black ${
          checked ? "bg-blue-600 text-white" : "bg-white text-transparent"
        }`}
      >
        ✓
      </span>

      <span>
        <span className="block text-sm font-black text-slate-800">{label}</span>
        <span className="mt-1 block text-xs font-semibold leading-relaxed text-slate-400">
          {description}
        </span>
      </span>
    </button>
  )
}

export default AddProductModal