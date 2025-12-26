const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export interface JamKerja {
    mulai: string;
    selesai: string;
}

export interface PengaturanCabang {
    id?: number;
    cabang_id: number;
    nama_cabang?: string;
    jam_kerja: {
        senin: JamKerja | null;
        selasa: JamKerja | null;
        rabu: JamKerja | null;
        kamis: JamKerja | null;
        jumat: JamKerja | null;
        sabtu: JamKerja | null;
        minggu: JamKerja | null;
    };
    toleransi_keterlambatan: number;
    notif_reminder_absen: boolean;
    notif_keterlambatan: boolean;
    notif_approval: boolean;
    created_at?: string;
    updated_at?: string;
}

export const getPengaturan = async (): Promise<PengaturanCabang> => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/pengaturan`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch pengaturan");
    }

    const data = await response.json();
    return data.data;
};

export const updatePengaturan = async (
    pengaturan: Partial<PengaturanCabang>,
): Promise<PengaturanCabang> => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/pengaturan`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pengaturan),
    });

    if (!response.ok) {
        throw new Error("Failed to update pengaturan");
    }

    const data = await response.json();
    return data.data;
};
