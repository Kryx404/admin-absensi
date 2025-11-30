import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://192.168.1.51:3001/api";

export interface LoginCredentials {
    nik: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data?: {
        user: {
            id: number;
            nik: string;
            name: string;
            email: string;
            position: string;
            role: string;
            phone: string;
            address: string;
            status: string;
        };
        token: string;
    };
}

export const login = async (
    credentials: LoginCredentials,
): Promise<LoginResponse> => {
    console.log("Login API called with NIK:", credentials.nik);
    try {
        const response = await axios.post<LoginResponse>(
            `${API_URL}/auth/login`,
            credentials,
        );
        console.log("Login response:", response.data);

        // Simpan token dan user data ke localStorage
        if (response.data.success && response.data.data) {
            localStorage.setItem("token", response.data.data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.data.user),
            );
            // Set initial last activity timestamp
            localStorage.setItem("lastActivity", Date.now().toString());
        }

        return response.data;
    } catch (error) {
        const axiosError = error as {
            response?: { data: LoginResponse };
            message: string;
        };
        console.error(
            "Login error:",
            axiosError.response?.data || axiosError.message,
        );
        if (axiosError.response?.data) {
            return axiosError.response.data;
        }
        return {
            success: false,
            message: "Gagal terhubung ke server",
        };
    }
};

export const logout = async (): Promise<void> => {
    console.log("Logout API called");
    try {
        const token = localStorage.getItem("token");
        await axios.post(
            `${API_URL}/auth/logout`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } catch (error) {
        console.error("Logout error:", error);
    } finally {
        // Hapus data dari localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("lastActivity");
    }
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem("token");
};
