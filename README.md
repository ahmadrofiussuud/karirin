# ARAH — ruang untuk mulai

Prototipe lokal Next.js + React + TypeScript. Bahasa antarmuka Indonesia.

## Menjalankan

Node.js 20.9+ diperlukan.

```powershell
cd C:\laragon\www\karirin
npm.cmd install
npm.cmd run dev
```

Buka http://127.0.0.1:3000. Jika port sudah dipakai, ikuti alamat yang dicetak Next.js.

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd start
```

## Alur yang tersedia

1. Profil: nama, minat, tujuan, pengalaman, status mahasiswa, waktu, dan anggaran.
2. Radar: urutan berdasarkan kecocokan minat, pencarian, filter kategori/gratis, simpan peluang.
3. Reality Check: persyaratan status, biaya, kapasitas mingguan, simulasi durasi 1–8 minggu.
4. Confidence Bridge: rencana berbeda sesuai hambatan; checklist dan komitmen jika–maka.
5. Growth Journey: status pendaftaran/partisipasi, refleksi, waktu aktual.
6. Semua data disimpan di localStorage browser. Ekspor JSON tersedia pada sidebar.

## Batas prototipe

- Peluang adalah data fiktif/contoh, bukan informasi lomba atau tenggat resmi.
- Perubahan status pendaftaran hanya catatan pribadi. Tidak ada pendaftaran eksternal.
- Rekomendasi dan rencana menggunakan aturan deterministik; belum menggunakan model AI.
- Belum ada akun, server database, sinkronisasi antarperangkat, atau impor JSON.
- Data browser dapat hilang saat penyimpanan situs dibersihkan. Ekspor catatan untuk cadangan.
- Durasi skenario merupakan ilustrasi beban, bukan penjadwal yang menjamin tenggat.
- Refleksi menutup perjalanan setelah status Diikuti; catatan lebih awal tetap bisa disimpan.

## Struktur

- `app/page.tsx`: ruang kerja dan lima tahap interaksi
- `app/globals.css`: sistem visual dan responsive layout
- `lib/domain.ts`: data contoh, model domain, simulasi, prioritas, validasi penyimpanan
- `tests/domain.test.ts`: pemeriksaan perhitungan, prioritas, dan pemulihan data
- `docs/`: konteks produk dan keputusan desain

## Tahap lanjutan

Validasi dengan mahasiswa, pulihkan guidebook dan instrumen survei, gunakan peluang dari sumber resmi, lalu tentukan kebutuhan autentikasi dan database. Pisahkan efektivitas yang diharapkan dari hasil yang benar-benar diuji.
