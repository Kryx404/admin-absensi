// API service for absensi endpoints using fetch
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

console.log("[Absensi API] Base URL:", API_BASE);

export async function getAllAbsensi() {
    const url = `${API_BASE}/absensi`;
    console.log("[Absensi API] Fetching:", url);
    try {
        const res = await fetch(url);
        console.log("[Absensi API] Response status:", res.status);
        if (!res.ok) throw new Error("Gagal mengambil data absensi");
        const data = await res.json();
        console.log("[Absensi API] Data received:", data);
        return data;
    } catch (error) {
        console.error("[Absensi API] Error:", error);
        throw error;
    }
}

export async function getAbsensiByUser(userId: string) {
    const res = await fetch(`${API_BASE}/absensi/user/${userId}`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Gagal mengambil data absensi user");
    return res.json();
}

export async function getTodayAbsensi() {
    const res = await fetch(`${API_BASE}/absensi/today`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Gagal mengambil absensi hari ini");
    return res.json();
}

export async function clockIn(formData: FormData) {
    const res = await fetch(`${API_BASE}/absensi/clock-in`, {
        method: "POST",
        body: formData,
        credentials: "include",
    });
    if (!res.ok) throw new Error("Gagal clock-in");
    return res.json();
}

export async function clockOut(formData: FormData) {
    const res = await fetch(`${API_BASE}/absensi/clock-out`, {
        method: "POST",
        body: formData,
        credentials: "include",
    });
    if (!res.ok) throw new Error("Gagal clock-out");
    return res.json();
}
