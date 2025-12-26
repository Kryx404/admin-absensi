import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Cabang interface
export interface Cabang {
    id: number;
    nama_cabang: string;
    kode_cabang: string;
    alamat?: string;
    telepon?: string;
    email?: string;
    status: "active" | "inactive" | "suspended";
    subscription_start?: string;
    subscription_end?: string;
    max_users: number;
    paket: "basic" | "pro" | "enterprise";
    created_at?: string;
    updated_at?: string;
    user_count?: number;
}

// Get all cabang
export const getAllCabang = async () => {
    const response = await axios.get(`${API_URL}/cabang`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

// Get cabang by ID
export const getCabangById = async (id: string) => {
    const response = await axios.get(`${API_URL}/cabang/${id}`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

// Create cabang
export const createCabang = async (data: any) => {
    const response = await axios.post(`${API_URL}/cabang`, data, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

// Update cabang
export const updateCabang = async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/cabang/${id}`, data, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

// Delete cabang
export const deleteCabang = async (id: string) => {
    const response = await axios.delete(`${API_URL}/cabang/${id}`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

// Get dashboard stats for superadmin
export const getDashboardStats = async () => {
    const response = await axios.get(`${API_URL}/cabang/dashboard-stats`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

// Toggle status cabang (activate/deactivate)
export const toggleStatusCabang = async (
    id: number,
    status: "active" | "inactive",
) => {
    const response = await axios.put(
        `${API_URL}/cabang/${id}/toggle-status`,
        { status },
        {
            headers: getAuthHeaders(),
        },
    );
    return response.data;
};

// Extend subscription cabang
export const extendSubscription = async (
    id: number,
    data: { subscription_end: string; paket?: string },
) => {
    const response = await axios.put(
        `${API_URL}/cabang/${id}/extend-subscription`,
        data,
        {
            headers: getAuthHeaders(),
        },
    );
    return response.data;
};
