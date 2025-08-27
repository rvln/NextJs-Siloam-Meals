import Menu, { ApiMenu } from "./components/Menu"

async function getMenuData(uuid: string): Promise<ApiMenu[]> {
    try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/pasien/link/${uuid}`;
        console.log("Fetching:", url);

        const response = await fetch(url, {
            next: { revalidate: 60 },
        });

        console.log("Status:", response.status, response.statusText);

        if (!response.ok) {
            const text = await response.text();
            console.error("Response body:", text);
            throw new Error("Gagal mengambil data menu");
        }

        const data = await response.json();

        // Pastikan return array menu
        return data.menu ?? [];
    } catch (error) {
        console.error("Fetch error:", error);
        return [];
    }
}

export default async function Pesanan({ params }: { params: { uuid: string } }) {
    const { uuid } = await params;

    const menuData = await getMenuData(uuid);

    return (
        <main className="min-h-screen bg-gray-400">
            <Menu uuid={uuid} initialData={menuData} />
        </main>
    )
}
