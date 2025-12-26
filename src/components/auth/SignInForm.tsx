import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { login } from "../../api/auth";

export default function SignInForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [nik, setNik] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await login({ nik, password });

            if (response.success) {
                // Redirect ke dashboard
                navigate("/");
            } else {
                setError(response.message || "Login gagal");
            }
        } catch (err) {
            setError("Terjadi kesalahan saat login");
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1">
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                            Admin Login
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Masukkan NIK dan password untuk login sebagai admin
                        </p>
                    </div>
                    <div>
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                <div>
                                    <Label>
                                        NIK{" "}
                                        <span className="text-error-500">
                                            *
                                        </span>{" "}
                                    </Label>
                                    <Input
                                        placeholder="Masukkan NIK"
                                        value={nik}
                                        onChange={(e) => setNik(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>
                                        Password{" "}
                                        <span className="text-error-500">
                                            *
                                        </span>{" "}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Masukkan password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                        />
                                        <span
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2">
                                            {showPassword ? (
                                                <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                            ) : (
                                                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            checked={isChecked}
                                            onChange={setIsChecked}
                                        />
                                        <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                                            Ingat saya
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center items-center rounded-lg bg-brand-500 px-10 py-3 font-medium text-white transition-all hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={loading}>
                                        {loading ? "Loading..." : "Login"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
