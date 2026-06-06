import PagePlaceholder from "../components/PagePlaceholder"

function Pengaturan() {
  return (
    <PagePlaceholder
      eyebrow="Sistem"
      title="Pengaturan"
      description="Halaman ini nantinya digunakan untuk mengatur informasi toko, user, role akses, printer, dan konfigurasi sistem RAD POS."
      icon="⚙️"
      emptyTitle="Pengaturan Sistem Belum Dibuat"
      emptyDescription="Struktur menu sudah siap. Fitur pengaturan akan dibuat setelah fitur utama POS, stok, SO, dan laporan sudah lebih matang."
    />
  )
}

export default Pengaturan