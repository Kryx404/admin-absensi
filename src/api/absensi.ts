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

// GET rekap absensi dengan filter
export async function getRekapAbsensi(params: {
    startDate?: string;
    endDate?: string;
    month?: number;
    year?: number;
    search?: string;
    divisi?: string;
    departemen?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
    page?: number;
    limit?: number;
}) {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, String(value));
        }
    });

    const url = `${API_BASE}/absensi/rekap?${queryParams.toString()}`;
    console.log("[Absensi API] Fetching rekap:", url);

    try {
        const res = await fetch(url);
        console.log("[Absensi API] Rekap response status:", res.status);
        if (!res.ok) throw new Error("Gagal mengambil rekap absensi");
        const data = await res.json();
        console.log("[Absensi API] Rekap data received:", data);
        return data;
    } catch (error) {
        console.error("[Absensi API] Rekap error:", error);
        throw error;
    }
}

// GET summary statistik rekap
export async function getRekapSummary(params: {
    startDate?: string;
    endDate?: string;
    month?: number;
    year?: number;
}) {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, String(value));
        }
    });

    const url = `${API_BASE}/absensi/rekap/summary?${queryParams.toString()}`;
    console.log("[Absensi API] Fetching summary:", url);

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Gagal mengambil summary rekap");
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("[Absensi API] Summary error:", error);
        throw error;
    }
}

// GET statistik absensi untuk grafik
export async function getStatistikAbsensi(params: {
    startDate?: string;
    endDate?: string;
    month?: number;
    year?: number;
    divisi?: string;
    departemen?: string;
    groupBy?: "day" | "month" | "employee";
}) {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, String(value));
        }
    });

    const url = `${API_BASE}/statistik?${queryParams.toString()}`;
    console.log("[Absensi API] Fetching statistik:", url);

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Gagal mengambil statistik absensi");
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("[Absensi API] Statistik error:", error);
        throw error;
    }
}

// GET status distribution untuk pie chart
export async function getStatusDistribution(params: {
    startDate?: string;
    endDate?: string;
    month?: number;
    year?: number;
    divisi?: string;
    departemen?: string;
}) {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, String(value));
        }
    });

    const url = `${API_BASE}/statistik/distribution?${queryParams.toString()}`;
    console.log("[Absensi API] Fetching distribution:", url);

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Gagal mengambil distribusi status");
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("[Absensi API] Distribution error:", error);
        throw error;
    }
}
