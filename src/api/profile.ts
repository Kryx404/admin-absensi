import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Upload profile photo
export const uploadProfilePhoto = async (userId: number, file: File) => {
    const formData = new FormData();
    formData.append("photo", file);

    const response = await axios.post(
        `${API_URL}/users/${userId}/photo`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        },
    );

    return response.data;
};

// Delete profile photo
export const deleteProfilePhoto = async (userId: number) => {
    const response = await axios.delete(`${API_URL}/users/${userId}/photo`);
    return response.data;
};

// Get user by ID
export const getUserById = async (userId: number) => {
    const response = await axios.get(`${API_URL}/users/${userId}`);
    return response.data;
};

// Update user
export const updateUser = async (userId: number, userData: any) => {
    const response = await axios.put(`${API_URL}/users/${userId}`, userData);
    return response.data;
};
