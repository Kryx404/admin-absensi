// API service for user endpoints using fetch
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

console.log("[User API] Base URL:", API_BASE);

export async function getAllUsers() {
    const url = `${API_BASE}/users`;
    const token = localStorage.getItem("token");
    console.log("[User API] Fetching:", url);
    try {
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("[User API] Response status:", res.status);
        if (!res.ok) throw new Error("Gagal mengambil data user");
        const data = await res.json();
        console.log("[User API] Data received:", data);
        return data;
    } catch (error) {
        console.error("[User API] Error:", error);
        throw error;
    }
}

export async function getUserById(id: string) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/users/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error("Gagal mengambil data user");
    return res.json();
}

export async function createUser(data: any) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Gagal membuat user");
    return res.json();
}

export async function updateUser(id: string, data: any) {
    const url = `${API_BASE}/users/${id}`;
    const token = localStorage.getItem("token");
    console.log("[User API] Updating user:", url, data);
    try {
        const res = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        console.log("[User API] Update response status:", res.status);

        const result = await res.json();
        console.log("[User API] Update response data:", result);

        if (!res.ok) {
            return {
                success: false,
                message: result.message || "Gagal update user",
            };
        }

        return result;
    } catch (error) {
        console.error("[User API] Update error:", error);
        return {
            success: false,
            message: "Terjadi kesalahan saat update user",
        };
    }
}

export async function deleteUser(id: string) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error("Gagal hapus user");
    return res.json();
}
