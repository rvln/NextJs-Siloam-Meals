import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost", // GANTI DENGAN IP BACKEND NESTJS ATAU LOCALHOST ANDA
        port: "8080", // PASTIKAN PORT INI SESUAI DENGAN PORT BACKEND NESTJS ANDA
        pathname: "/public/**", // Opsional: Hanya izinkan gambar dari path /image/
      },
    ],
  },
};

export default nextConfig;
