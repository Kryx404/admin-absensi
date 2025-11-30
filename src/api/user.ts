// API service for user endpoints using fetch
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

console.log("[User API] Base URL:", API_BASE);

export async function getAllUsers() {
    const url = `${API_BASE}/users`;
    console.log("[User API] Fetching:", url);
    try {
        const res = await fetch(url);
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
    const res = await fetch(`${API_BASE}/users/${id}`);
    if (!res.ok) throw new Error("Gagal mengambil data user");
    return res.json();
}

export async function createUser(data: any) {
    const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Gagal membuat user");
    return res.json();
}

export async function updateUser(id: string, data: any) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Gagal update user");
    return res.json();
}

export async function deleteUser(id: string) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Gagal hapus user");
    return res.json();
}
