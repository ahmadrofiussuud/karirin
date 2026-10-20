import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karirin — Ruang Navigasi Karier & Eksplorasi Peluang Mahasiswa",
  description:
    "Platform navigasi karier mahasiswa. Kenali kapasitas waktu mingguan, temukan peluang terkurasi, lakukan reality check beban, dan ambil langkah pertamamu tanpa overthinking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
