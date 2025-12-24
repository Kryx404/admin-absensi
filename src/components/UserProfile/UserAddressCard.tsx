import { getCurrentUser } from "../../api/auth";
import { useState, useEffect } from "react";

export default function UserAddressCard() {
    const [user, setUser] = useState(getCurrentUser());

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
    }, []);
    return (
        <>
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                            Address
                        </h4>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                            <div className="col-span-2">
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                    Alamat Lengkap
                                </p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                    {user?.address || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                    Status Akun
                                </p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                    {user?.status === "active"
                                        ? "Aktif"
                                        : "Nonaktif"}
                                </p>
                            </div>

                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                    Role
                                </p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                    {user?.role === "admin"
                                        ? "Administrator"
                                        : user?.role || "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
