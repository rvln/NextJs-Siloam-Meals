import Menu from "./components/Menu";

// Fungsi getData tetap sama
async function getMenuData(uuid: string) {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/pasien/link/${uuid}`;
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) {
      throw new Error("Gagal mengambil data menu dari server");
    }
    const data = await response.json();
    return data.menu ?? [];
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
}

export default async function Pesanan({
  params,
}: {
  params: { uuid: string };
}) {
  const { uuid } = params;
  const menuData = await getMenuData(uuid);

  return (
    // Latar belakang diatur di komponen Menu, di sini cukup sebagai wrapper
    <main>
      <Menu uuid={uuid} initialData={menuData} />
    </main>
  );
}
