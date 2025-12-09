import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Get authorization token
const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Pembayaran interfaces
export interface Pembayaran {
    id: number;
    cabang_id: number;
    periode_bulan: string;
    jumlah: number;
    status: "pending" | "verified" | "rejected";
    bukti_transfer?: string;
    tanggal_bayar?: string;
    catatan?: string;
    verified_by?: number;
    verified_at?: string;
    created_at: string;
    updated_at: string;
    // Join fields
    nama_cabang?: string;
    kode_cabang?: string;
    verified_by_name?: string;
}

export interface PembayaranStats {
    pending: {
        count: number;
        amount: number;
    };
    verified_this_month: {
        count: number;
        amount: number;
    };
    recent_pending: Pembayaran[];
}

export interface CreatePembayaranData {
    cabang_id?: number; // Only for superadmin
    periode_bulan: string;
    jumlah: number;
    tanggal_bayar?: string;
    catatan?: string;
    bukti_transfer?: File;
}

export interface VerifyPembayaranData {
    status: "verified" | "rejected";
    catatan?: string;
}

// Get all pembayaran (with filters)
export const getAllPembayaran = async (params?: {
    status?: string;
    periode?: string;
    cabang_id?: number;
}) => {
    try {
        const response = await axios.get(`${API_URL}/pembayaran`, {
            headers: getAuthHeader(),
            params,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching pembayaran:", error);
        throw error;
    }
};

// Get pembayaran by ID
export const getPembayaranById = async (id: number) => {
    try {
        const response = await axios.get(`${API_URL}/pembayaran/${id}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching pembayaran by ID:", error);
        throw error;
    }
};

// Create pembayaran
export const createPembayaran = async (data: CreatePembayaranData) => {
    try {
        const formData = new FormData();

        // Append all fields
        if (data.cabang_id)
            formData.append("cabang_id", data.cabang_id.toString());
        formData.append("periode_bulan", data.periode_bulan);
        formData.append("jumlah", data.jumlah.toString());
        if (data.tanggal_bayar)
            formData.append("tanggal_bayar", data.tanggal_bayar);
        if (data.catatan) formData.append("catatan", data.catatan);
        if (data.bukti_transfer)
            formData.append("bukti_transfer", data.bukti_transfer);

        const response = await axios.post(`${API_URL}/pembayaran`, formData, {
            headers: {
                ...getAuthHeader(),
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error creating pembayaran:", error);
        throw error;
    }
};

// Verify pembayaran (superadmin only)
export const verifyPembayaran = async (
    id: number,
    data: VerifyPembayaranData,
) => {
    try {
        const response = await axios.put(
            `${API_URL}/pembayaran/${id}/verify`,
            data,
            {
                headers: getAuthHeader(),
            },
        );
        return response.data;
    } catch (error) {
        console.error("Error verifying pembayaran:", error);
        throw error;
    }
};

// Delete pembayaran
export const deletePembayaran = async (id: number) => {
    try {
        const response = await axios.delete(`${API_URL}/pembayaran/${id}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting pembayaran:", error);
        throw error;
    }
};

// Get pembayaran stats (superadmin only)
export const getPembayaranStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/pembayaran/stats`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching pembayaran stats:", error);
        throw error;
    }
};
