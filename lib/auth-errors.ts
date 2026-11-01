export function authErrorMessage(error: { code?: string; status?: number }, signup: boolean) {
  switch (error.code) {
    case "email_address_not_authorized":
      return "Email konfirmasi belum bisa dikirim ke alamat ini karena layanan email Karirin belum dikonfigurasi untuk pengguna umum. Pengelola perlu mengaktifkan layanan pengirim email terlebih dahulu.";
    case "over_email_send_rate_limit":
      return "Batas pengiriman email konfirmasi sedang tercapai. Jangan ulangi pendaftaran dulu. Periksa inbox dan spam, lalu coba lagi setelah batas pengiriman pulih.";
    case "over_request_rate_limit":
      return "Terlalu banyak percobaan. Tunggu beberapa menit sebelum mencoba lagi.";
    case "email_not_confirmed":
      return "Email belum dikonfirmasi. Buka tautan konfirmasi di inbox atau spam sebelum masuk.";
    case "weak_password":
      return "Password belum memenuhi ketentuan keamanan. Gunakan password yang lebih kuat dengan minimal 8 karakter.";
    case "email_address_invalid":
    case "validation_failed":
      return "Alamat email atau isian belum valid. Periksa kembali penulisannya.";
    case "signup_disabled":
    case "email_provider_disabled":
      return "Pendaftaran email sedang tidak tersedia. Pengelola perlu memeriksa pengaturan layanan akun.";
    case "invalid_credentials":
      return "Email atau password belum cocok. Periksa kembali, lalu coba masuk lagi.";
    default:
      if (error.status === 429) return "Batas percobaan sementara tercapai. Tunggu beberapa menit sebelum mencoba lagi.";
      if (error.status && error.status >= 500) return "Layanan akun sedang mengalami gangguan. Silakan coba lagi nanti.";
      return signup ? "Pendaftaran belum berhasil. Periksa email dan password, atau coba lagi nanti." : "Belum bisa masuk. Periksa email, password, dan konfirmasi emailmu.";
  }
}
