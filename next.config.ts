import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost", // Gunakan Alamat IPv4 server backend NestJS Anda
        port: "8080", // PASTIKAN PORT INI SESUAI DENGAN PORT BACKEND NESTJS ANDA
        pathname: "/public/**", // Opsional: Hanya izinkan gambar dari path /image/
      },
    ],
  },
};

export default nextConfig;
