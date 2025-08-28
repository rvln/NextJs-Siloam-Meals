"use client"

import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface JwtPayload {
  sub: number;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah halaman reload saat form di-submit
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal, periksa kembali username dan password Anda.');
      }

      const { access_token } = data;

      const decodedToken = jwtDecode<JwtPayload>(access_token);

      const userRole = decodedToken.role;

      localStorage.setItem('accessToken', access_token);

      switch (userRole) {
        case 'NURSE':
          router.push('/nurse');
          break;
        case 'KITCHEN':
          router.push('/kitchen');
          break;
        case 'ADMIN':
          router.push('/admin');
          break;
        default:
          router.push('/dashboard');
          break;
      }

    } catch (err: unknown) {
      // Tangkap error dari 'throw new Error' atau jika fetch gagal
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      // Apapun hasilnya, hentikan loading
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 h-screen">
        <div className="grid md:grid-cols-2 gap-12 items-center h-full">
          <div className="hidden md:flex flex-col justify-center h-full">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-500/20 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-white">Siloam Meals</h1>
            </div>
            <p className="text-gray-300 text-lg">
              Sistem manajemen makanan terintegrasi untuk pelayanan pasien yang lebih baik.
            </p>
          </div>

          <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-md">
              <div className="bg-gray-800/50 rounded-2xl shadow-2xl p-8 backdrop-blur-sm border border-gray-700">
                
                {error && (
                  <div className="bg-red-500/20 border border-red-500 text-red-300 text-sm rounded-lg p-3 mb-4 text-center">
                    {error}
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Selamat Datang</h2>
                  <p className="text-gray-400">Silakan masuk untuk melanjutkan</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="Username Anda"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="Password Anda"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-green-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300"
                  >
                    {isLoading ? 'Memproses...' : 'Masuk'} 
                    <svg className="w-5 h-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}