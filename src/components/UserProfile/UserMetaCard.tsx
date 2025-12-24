import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { getCurrentUser } from "../../api/auth";
import { updateUser, getUserById } from "../../api/user";
import { uploadProfilePhoto, deleteProfilePhoto } from "../../api/profile";
import { useState, useEffect, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Point, Area } from "react-easy-crop/types";

export default function UserMetaCard() {
    const { isOpen, openModal, closeModal } = useModal();
    const [user, setUser] = useState(getCurrentUser());
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        position: "",
        address: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Image crop states
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
        null,
    );
    const [isCropping, setIsCropping] = useState(false);

    const API_BASE_URL =
        import.meta.env.VITE_API_URL?.replace("/api", "") ||
        "http://localhost:3001";

    useEffect(() => {
        const loadUserData = async () => {
            const currentUser = getCurrentUser();
            console.log("Current User Data from localStorage:", currentUser);

            // Jika user ada, ambil data terbaru dari server
            if (currentUser?.id) {
                try {
                    const response = await getUserById(
                        currentUser.id.toString(),
                    );
                    console.log("User Data from server:", response);

                    if (response.success && response.data) {
                        const freshUser = response.data;
                        console.log("Fresh User Address:", freshUser.address);

                        // Update localStorage dengan data terbaru
                        localStorage.setItem("user", JSON.stringify(freshUser));
                        setUser(freshUser);

                        setFormData({
                            name: freshUser.name || "",
                            email: freshUser.email || "",
                            phone: freshUser.phone || "",
                            position: freshUser.position || "",
                            address: freshUser.address || "",
                        });
                        console.log("FormData after set:", {
                            name: freshUser.name || "",
                            email: freshUser.email || "",
                            phone: freshUser.phone || "",
                            position: freshUser.position || "",
                            address: freshUser.address || "",
                        });
                    }
                } catch (error) {
                    console.error("Error loading user data:", error);
                    // Fallback ke data localStorage jika gagal
                    setUser(currentUser);
                    setFormData({
                        name: currentUser.name || "",
                        email: currentUser.email || "",
                        phone: currentUser.phone || "",
                        position: currentUser.position || "",
                        address: currentUser.address || "",
                    });
                }
            }
        };

        loadUserData();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = async () => {
        if (!user?.id) {
            setError("User ID tidak ditemukan");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await updateUser(user.id.toString(), formData);

            if (response.success) {
                const updatedUser = { ...user, ...response.data };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);
                alert("Profile berhasil diupdate!");
                closeModal();
                window.location.reload();
            } else {
                setError(response.message || "Gagal update profile");
            }
        } catch (err) {
            console.error("Update profile error:", err);
            setError("Terjadi kesalahan saat update profile");
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validasi file
        if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
            alert("Hanya file JPG dan PNG yang diperbolehkan!");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert("Ukuran file maksimal 2MB!");
            return;
        }

        // Read file as data URL untuk preview
        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result as string);
            setIsCropping(true);
        };
        reader.readAsDataURL(file);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const onCropComplete = useCallback(
        (_croppedArea: Area, croppedAreaPixels: Area) => {
            setCroppedAreaPixels(croppedAreaPixels);
        },
        [],
    );

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", (error) => reject(error));
            image.setAttribute("crossOrigin", "anonymous");
            image.src = url;
        });

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area,
    ): Promise<Blob> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error("No 2d context");
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height,
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob as Blob);
            }, "image/jpeg");
        });
    };

    const handleCropSave = async () => {
        if (!selectedImage || !croppedAreaPixels || !user?.id) return;

        setLoading(true);
        try {
            const croppedBlob = await getCroppedImg(
                selectedImage,
                croppedAreaPixels,
            );
            const croppedFile = new File([croppedBlob], "profile.jpg", {
                type: "image/jpeg",
            });

            console.log("Uploading photo for user:", user.id);
            const response = await uploadProfilePhoto(user.id, croppedFile);
            console.log("Upload response:", response);

            if (response.success) {
                console.log("Upload successful, data:", response.data);
                console.log(
                    "New profile_photo path:",
                    response.data.profile_photo,
                );

                const updatedUser = {
                    ...user,
                    profile_photo: response.data.profile_photo,
                };

                console.log("Updated user object:", updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
                console.log("localStorage updated");

                setUser(updatedUser);

                // Dispatch custom event untuk trigger update di component lain
                window.dispatchEvent(new Event("userUpdated"));

                alert("Foto profile berhasil diupload!");
                setIsCropping(false);
                setSelectedImage(null);

                // Force reload dengan clear cache
                setTimeout(() => {
                    window.location.href = window.location.href;
                }, 500);
            } else {
                alert(
                    `Gagal upload foto: ${
                        response.message || "Terjadi kesalahan"
                    }`,
                );
            }
        } catch (err: any) {
            console.error("Upload photo error:", err);
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "Terjadi kesalahan saat upload foto";
            alert(`Gagal upload foto: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCropCancel = () => {
        setIsCropping(false);
        setSelectedImage(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    };

    const handleDeletePhoto = async () => {
        if (!user?.id || !user?.profile_photo) return;

        if (!confirm("Hapus foto profile?")) return;

        setLoading(true);
        try {
            const response = await deleteProfilePhoto(user.id);
            if (response.success) {
                const updatedUser = { ...user, profile_photo: null };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);

                // Dispatch custom event untuk trigger update di component lain
                window.dispatchEvent(new Event("userUpdated"));

                alert("Foto profile berhasil dihapus!");

                // Force reload dengan clear cache
                window.location.href = window.location.href;
            } else {
                alert(
                    `Gagal hapus foto: ${
                        response.message || "Terjadi kesalahan"
                    }`,
                );
            }
        } catch (err: any) {
            console.error("Delete photo error:", err);
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "Terjadi kesalahan saat hapus foto";
            alert(`Gagal hapus foto: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const getProfilePhotoUrl = () => {
        const photoPath = user?.profile_photo;
        console.log("getProfilePhotoUrl - user:", user);
        console.log("getProfilePhotoUrl - profile_photo:", photoPath);

        if (photoPath) {
            // Add timestamp to bust browser cache
            const url = `${API_BASE_URL}${photoPath}?t=${Date.now()}`;
            console.log("Generated photo URL:", url);
            return url;
        }
        console.log("Using default image");
        return "/images/user/owner.jpg";
    };

    return (
        <>
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                        <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                            <img
                                src={getProfilePhotoUrl()}
                                alt="user"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                        "/images/user/owner.jpg";
                                }}
                            />
                        </div>
                        <div className="order-3 xl:order-2">
                            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                                {user?.name || "Admin User"}
                            </h4>
                            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {user?.position || "Administrator"}
                                </p>
                                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    NIK: {user?.nik || "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={openModal}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto">
                        <svg
                            className="fill-current"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                                fill=""
                            />
                        </svg>
                        Edit
                    </button>
                </div>
            </div>

            {/* Modal Edit Profile */}
            <Modal
                isOpen={isOpen}
                onClose={closeModal}
                className="max-w-[700px] m-4">
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Edit Personal Information
                        </h4>
                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                            Update your details to keep your profile up-to-date.
                        </p>
                    </div>
                    {error && (
                        <div className="mx-2 mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                            {error}
                        </div>
                    )}
                    <form
                        className="flex flex-col"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSave();
                        }}>
                        <div className="custom-scrollbar h-[500px] overflow-y-auto px-2 pb-3">
                            <div>
                                {/* Profile Photo Section */}
                                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                    Foto Profile
                                </h5>
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="w-24 h-24 overflow-hidden border-2 border-gray-200 rounded-full dark:border-gray-800">
                                        <img
                                            src={getProfilePhotoUrl()}
                                            alt="profile"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (
                                                    e.target as HTMLImageElement
                                                ).src =
                                                    "/images/user/owner.jpg";
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            type="button"
                                            onClick={handlePhotoClick}
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
                                            Upload Foto Baru
                                        </button>
                                        {user?.profile_photo && (
                                            <button
                                                type="button"
                                                onClick={handleDeletePhoto}
                                                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:hover:bg-red-900/30">
                                                Hapus Foto
                                            </button>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            JPG atau PNG, max 2MB
                                        </p>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>

                                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                    Informasi Admin
                                </h5>

                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                    <div className="col-span-2">
                                        <Label>Nama Lengkap</Label>
                                        <Input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>NIK (Tidak bisa diubah)</Label>
                                        <Input
                                            type="text"
                                            value={user?.nik || ""}
                                            readOnly
                                            disabled
                                        />
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Email Address</Label>
                                        <Input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Phone</Label>
                                        <Input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Jabatan</Label>
                                        <Input
                                            type="text"
                                            name="position"
                                            value={formData.position}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <Label>Alamat</Label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full px-4 py-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={closeModal}
                                disabled={loading}>
                                Close
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={loading}>
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal Crop Image */}
            <Modal
                isOpen={isCropping}
                onClose={handleCropCancel}
                className="max-w-[600px] m-4">
                <div className="relative w-full max-w-[600px] rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
                    <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                        Sesuaikan Foto Profile
                    </h4>
                    <div className="relative h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        {selectedImage && (
                            <Cropper
                                image={selectedImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        )}
                    </div>
                    <div className="mt-4 px-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Zoom
                        </label>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                    </div>
                    <div className="flex items-center gap-3 mt-6">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCropCancel}
                            disabled={loading}>
                            Batal
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleCropSave}
                            disabled={loading}>
                            {loading ? "Menyimpan..." : "Simpan Foto"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
