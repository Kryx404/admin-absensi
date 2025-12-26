// API service for lokasi endpoints using fetch
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

console.log("[Lokasi API] Base URL:", API_BASE);

export async function getAllLokasi(cabangId?: number) {
    const url = cabangId
        ? `${API_BASE}/lokasi?cabang_id=${cabangId}`
        : `${API_BASE}/lokasi`;
    const token = localStorage.getItem("token");
    console.log("[Lokasi API] Fetching:", url);
    try {
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("[Lokasi API] Response status:", res.status);
        if (!res.ok) throw new Error("Gagal mengambil data lokasi");
        const data = await res.json();
        console.log("[Lokasi API] Data received:", data);
        return data;
    } catch (error) {
        console.error("[Lokasi API] Error:", error);
        throw error;
    }
}

export async function getLokasiById(id: string) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/lokasi/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error("Gagal mengambil data lokasi");
    return res.json();
}

export async function createLokasi(data: any) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/lokasi`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Gagal membuat lokasi");
    return res.json();
}

export async function updateLokasi(id: string, data: any) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/lokasi/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Gagal update lokasi");
    return res.json();
}

export async function deleteLokasi(id: string) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/lokasi/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error("Gagal hapus lokasi");
    return res.json();
}
