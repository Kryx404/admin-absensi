import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
    BoxCubeIcon,
    CalenderIcon,
    ChevronDownIcon,
    GridIcon,
    HorizontaLDots,
    PieChartIcon,
    TableIcon,
    UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import {
    FiSettings,
    FiFileText,
    FiBell,
    FiHardDrive,
    FiHelpCircle,
    FiInfo,
    FiDollarSign,
    FiCheckSquare,
} from "react-icons/fi";

type NavItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
    {
        icon: <GridIcon />,
        name: "Dashboard",
        path: "/",
    },
    {
        icon: <CalenderIcon />,
        name: "Kalender",
        path: "/calendar",
    },
    {
        icon: <PieChartIcon />,
        name: "Laporan Kehadiran",
        subItems: [
            { name: "Rekap Harian/Bulanan", path: "/laporan-rekap" },
            { name: "Grafik Statistik", path: "/laporan-statistik" },
            {
                name: "Deteksi Telat & Pulang Cepat",
                path: "/laporan-telat-pulangcepat",
            },
            { name: "Status Kehadiran Realtime", path: "/laporan-realtime" },
        ],
    },
    {
        icon: <UserCircleIcon />,
        name: "Manajemen Pengguna",
        subItems: [{ name: "Pengguna & Hak Akses", path: "/manajemen-user" }],
    },
    {
        icon: <BoxCubeIcon />,
        name: "Pengaturan Kantor",
        subItems: [{ name: "Tambah/Edit Lokasi", path: "/manajemen-lokasi" }],
    },
    {
        icon: <CalenderIcon />,
        name: "Izin & Cuti",
        subItems: [
            { name: "Approval Izin & Cuti", path: "/approval-izin-cuti" },
        ],
    },
    {
        icon: <TableIcon />,
        name: "Export Laporan",
        subItems: [{ name: "Export ke Excel/PDF", path: "/export-laporan" }],
    },
];

// Get user role from localStorage
const getUserRole = () => {
    try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.role || "admin";
        }
    } catch (error) {
        console.error("Error parsing user from localStorage:", error);
    }
    return "admin";
};

// Others items - conditional based on role
const getOthersItems = (): NavItem[] => {
    const userRole = getUserRole();
    const items: NavItem[] = [];

    // Admin menu items
    items.push(
        {
            icon: <FiSettings className="w-5 h-5" />,
            name: "Pengaturan Sistem",
            path: "/pengaturan-sistem",
        },
        {
            icon: <FiFileText className="w-5 h-5" />,
            name: "Log Aktivitas",
            path: "/log-aktivitas",
        },
        {
            icon: <FiBell className="w-5 h-5" />,
            name: "Notifikasi",
            path: "/notifikasi",
        },
        {
            icon: <FiHardDrive className="w-5 h-5" />,
            name: "Backup Data",
            path: "/backup-data",
        },
        {
            icon: <FiHelpCircle className="w-5 h-5" />,
            name: "Bantuan & Panduan",
            path: "/bantuan",
        },
        {
            icon: <FiInfo className="w-5 h-5" />,
            name: "Tentang Aplikasi",
            path: "/tentang",
        },
    );

    // Superadmin additional items
    if (userRole === "superadmin") {
        items.push(
            {
                icon: <BoxCubeIcon />,
                name: "Manajemen Cabang",
                path: "/manajemen-cabang",
            },
            {
                icon: <FiDollarSign className="w-5 h-5" />,
                name: "Monitoring Pembayaran",
                path: "/monitoring-pembayaran",
            },
        );
    }

    return items;
};

const AppSidebar: React.FC = () => {
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const location = useLocation();

    const [openSubmenu, setOpenSubmenu] = useState<{
        type: "main" | "others";
        index: number;
    } | null>(null);
    const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
        {},
    );
    const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [othersMenuItems, setOthersMenuItems] = useState<NavItem[]>(
        getOthersItems(),
    );

    // Update others items when component mounts or localStorage changes
    useEffect(() => {
        setOthersMenuItems(getOthersItems());
    }, [location]);

    // const isActive = (path: string) => location.pathname === path;
    const isActive = useCallback(
        (path: string) => location.pathname === path,
        [location.pathname],
    );

    useEffect(() => {
        let submenuMatched = false;
        ["main", "others"].forEach((menuType) => {
            const items = menuType === "main" ? navItems : othersMenuItems;
            items.forEach((nav, index) => {
                if (nav.subItems) {
                    nav.subItems.forEach((subItem) => {
                        if (isActive(subItem.path)) {
                            setOpenSubmenu({
                                type: menuType as "main" | "others",
                                index,
                            });
                            submenuMatched = true;
                        }
                    });
                }
            });
        });

        if (!submenuMatched) {
            setOpenSubmenu(null);
        }
    }, [location, isActive, othersMenuItems]);

    useEffect(() => {
        if (openSubmenu !== null) {
            const key = `${openSubmenu.type}-${openSubmenu.index}`;
            if (subMenuRefs.current[key]) {
                setSubMenuHeight((prevHeights) => ({
                    ...prevHeights,
                    [key]: subMenuRefs.current[key]?.scrollHeight || 0,
                }));
            }
        }
    }, [openSubmenu]);

    const handleSubmenuToggle = (
        index: number,
        menuType: "main" | "others",
    ) => {
        setOpenSubmenu((prevOpenSubmenu) => {
            if (
                prevOpenSubmenu &&
                prevOpenSubmenu.type === menuType &&
                prevOpenSubmenu.index === index
            ) {
                return null;
            }
            return { type: menuType, index };
        });
    };

    const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
        <ul className="flex flex-col gap-4">
            {items.map((nav, index) => (
                <li key={nav.name}>
                    {nav.subItems ? (
                        <button
                            onClick={() => handleSubmenuToggle(index, menuType)}
                            className={`menu-item group ${
                                openSubmenu?.type === menuType &&
                                openSubmenu?.index === index
                                    ? "menu-item-active"
                                    : "menu-item-inactive"
                            } cursor-pointer ${
                                !isExpanded && !isHovered
                                    ? "lg:justify-center"
                                    : "lg:justify-start"
                            }`}>
                            <span
                                className={`menu-item-icon-size  ${
                                    openSubmenu?.type === menuType &&
                                    openSubmenu?.index === index
                                        ? "menu-item-icon-active"
                                        : "menu-item-icon-inactive"
                                }`}>
                                {nav.icon}
                            </span>
                            {(isExpanded || isHovered || isMobileOpen) && (
                                <span className="menu-item-text">
                                    {nav.name}
                                </span>
                            )}
                            {(isExpanded || isHovered || isMobileOpen) && (
                                <ChevronDownIcon
                                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                                        openSubmenu?.type === menuType &&
                                        openSubmenu?.index === index
                                            ? "rotate-180 text-brand-500"
                                            : ""
                                    }`}
                                />
                            )}
                        </button>
                    ) : (
                        nav.path && (
                            <Link
                                to={nav.path}
                                className={`menu-item group ${
                                    isActive(nav.path)
                                        ? "menu-item-active"
                                        : "menu-item-inactive"
                                }`}>
                                <span
                                    className={`menu-item-icon-size ${
                                        isActive(nav.path)
                                            ? "menu-item-icon-active"
                                            : "menu-item-icon-inactive"
                                    }`}>
                                    {nav.icon}
                                </span>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <span className="menu-item-text">
                                        {nav.name}
                                    </span>
                                )}
                            </Link>
                        )
                    )}
                    {nav.subItems &&
                        (isExpanded || isHovered || isMobileOpen) && (
                            <div
                                ref={(el) => {
                                    subMenuRefs.current[
                                        `${menuType}-${index}`
                                    ] = el;
                                }}
                                className="overflow-hidden transition-all duration-300"
                                style={{
                                    height:
                                        openSubmenu?.type === menuType &&
                                        openSubmenu?.index === index
                                            ? `${
                                                  subMenuHeight[
                                                      `${menuType}-${index}`
                                                  ]
                                              }px`
                                            : "0px",
                                }}>
                                <ul className="mt-2 space-y-1 ml-9">
                                    {nav.subItems.map((subItem) => (
                                        <li key={subItem.name}>
                                            <Link
                                                to={subItem.path}
                                                className={`menu-dropdown-item ${
                                                    isActive(subItem.path)
                                                        ? "menu-dropdown-item-active"
                                                        : "menu-dropdown-item-inactive"
                                                }`}>
                                                {subItem.name}
                                                <span className="flex items-center gap-1 ml-auto">
                                                    {subItem.new && (
                                                        <span
                                                            className={`ml-auto ${
                                                                isActive(
                                                                    subItem.path,
                                                                )
                                                                    ? "menu-dropdown-badge-active"
                                                                    : "menu-dropdown-badge-inactive"
                                                            } menu-dropdown-badge`}>
                                                            new
                                                        </span>
                                                    )}
                                                    {subItem.pro && (
                                                        <span
                                                            className={`ml-auto ${
                                                                isActive(
                                                                    subItem.path,
                                                                )
                                                                    ? "menu-dropdown-badge-active"
                                                                    : "menu-dropdown-badge-inactive"
                                                            } menu-dropdown-badge`}>
                                                            pro
                                                        </span>
                                                    )}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                </li>
            ))}
        </ul>
    );

    return (
        <aside
            className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
            isExpanded || isMobileOpen
                ? "w-[290px]"
                : isHovered
                ? "w-[290px]"
                : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
            <div
                className={`py-8 flex ${
                    !isExpanded && !isHovered
                        ? "lg:justify-center"
                        : "justify-start"
                }`}>
                <Link to="/" className="flex items-center gap-2 select-none">
                    {isExpanded || isHovered || isMobileOpen ? (
                        <span className="text-2xl font-bold tracking-wide text-brand-600 dark:text-white">
                            Admin absen
                        </span>
                    ) : (
                        <img
                            src="/images/logo/logo-icon.svg"
                            alt="Logo"
                            width={32}
                            height={32}
                        />
                    )}
                </Link>
            </div>
            <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
                <nav className="mb-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                                    !isExpanded && !isHovered
                                        ? "lg:justify-center"
                                        : "justify-start"
                                }`}>
                                {isExpanded || isHovered || isMobileOpen ? (
                                    "Menu"
                                ) : (
                                    <HorizontaLDots className="size-6" />
                                )}
                            </h2>
                            {renderMenuItems(navItems, "main")}
                        </div>
                        <div className="">
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                                    !isExpanded && !isHovered
                                        ? "lg:justify-center"
                                        : "justify-start"
                                }`}>
                                {isExpanded || isHovered || isMobileOpen ? (
                                    "Others"
                                ) : (
                                    <HorizontaLDots />
                                )}
                            </h2>
                            {renderMenuItems(othersMenuItems, "others")}
                        </div>
                    </div>
                </nav>
                {isExpanded || isHovered || isMobileOpen ? null : null}
            </div>
        </aside>
    );
};

export default AppSidebar;
