import React, { useState, useEffect, ReactNode } from "react";
import { usePage, Link } from "@inertiajs/react";
import { confirmAlert } from "../Components/sweetAlert";
import axios from "axios";
import {
    Grid,
    Database,
    FileText,
    FolderOpen,
    Box,
    Lock,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

interface MenuItem {
    id: string;
    label: string;
    to?: string;
    icon?: ReactNode;
    isItem?: boolean;
    type?: "separator";
}

interface LayoutProps {
    currentActive?: string;
    children: ReactNode;
}

interface User {
    name: string;
    role: string;
}

interface ThemeColors {
    bg: string;
    border: string;
    text: string;
    textSecondary: string;
    hoverBg: string;
    activeBg: string;
    activeText: string;
    separator: string;
    cardBg: string;
}

const Layout: React.FC<LayoutProps> = ({ currentActive, children }) => {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const [activeItem, setActiveItem] = useState<string>(
        currentActive || "dashboard"
    );
    const [darkMode, setDarkMode] = useState<boolean>(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme ? savedTheme === "dark" : true;
    });

    const { auth } = usePage<{ auth: { user: string; role: string } }>().props;
    const [user] = useState<User>({
        name: auth.user || "Guest",
        role: auth.role || "User",
    });

    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode);
        localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const toggleSidebar = (): void => setCollapsed((prev) => !prev);
    const toggleTheme = (): void => setDarkMode((prev) => !prev);
    const handleNavigate = (itemId: string): void => setActiveItem(itemId);

    const handleLogout = (): void => {
        confirmAlert(
            "Konfirmasi!",
            "Apakah Anda yakin ingin keluar?",
            (): Promise<boolean> =>
                axios
                    .post("/logout", {}, { withCredentials: true })
                    .then(() => {
                        window.location.href = "/";
                        return true;
                    })
                    .catch((error) => {
                        console.error("Logout failed:", error);
                        return false;
                    }),
            "Ya",
            "Batal",
            "Berhasil logout!",
            "Logout gagal!"
        );
    };

    const menuItems: MenuItem[] = [
        {
            id: "dashboard",
            icon: <Grid size={20} />,
            label: "Dashboard",
            to: "/dashboard",
            isItem: true,
        },
        { id: "pengajuan", type: "separator", label: "Pengajuan" },
        {
            id: "permohonan_pengajuan",
            icon: <FileText size={20} />,
            label: "Permohonan",
            to: "/permintaan/create",
            isItem: true,
        },
        { id: "list", type: "separator", label: "List" },
        {
            id: "permohonan_daftar",
            icon: <FolderOpen size={20} />,
            label: "Permohonan",
            to: "/permintaan",
            isItem: true,
        },
        { id: "manage", type: "separator", label: "Manage" },
        {
            id: "database",
            icon: <Database size={20} />,
            label: "Database",
            to: "/manage",
            isItem: true,
        },
        {
            id: "constrain",
            icon: <Lock size={20} />,
            label: "Constrain",
            to: "/constrain",
            isItem: true,
        },
    ];

    const getThemeColors = (): ThemeColors =>
        darkMode
            ? {
                  bg: "bg-gray-800",
                  border: "border-gray-700/20",
                  text: "text-white",
                  textSecondary: "text-gray-400",
                  hoverBg:
                      "hover:bg-gradient-to-r hover:from-gray-700/50 hover:via-indigo-700/50 hover:to-purple-700/50",
                  activeBg:
                      "bg-gradient-to-r from-blue-500/50 to-indigo-500/50",
                  activeText: "text-indigo-400",
                  separator: "text-indigo-400",
                  cardBg: "bg-gray-900/20 backdrop-blur-xl",
              }
            : {
                  bg: "bg-gray-200",
                  border: "border-gray-200/20",
                  text: "text-gray-900",
                  textSecondary: "text-gray-600",
                  hoverBg:
                      "hover:bg-gradient-to-r hover:from-blue-100/50 hover:via-indigo-100/50 hover:to-purple-100/50",
                  activeBg:
                      "bg-gradient-to-r from-blue-600/20 to-indigo-600/20",
                  activeText: "text-indigo-600",
                  separator: "text-indigo-500",
                  cardBg: "bg-white/20 backdrop-blur-xl",
              };

    const theme: ThemeColors = getThemeColors();

    const toggleThumbStyle = darkMode
        ? "translate-x-6 bg-white"
        : "translate-x-0 bg-white";

    const toggleTrackStyle = darkMode ? "bg-indigo-600" : "bg-gray-200";

    return (
        <div className="flex h-screen overflow-hidden">
            <aside
                className={`fixed left-0 top-0 h-screen ${
                    theme.cardBg
                } transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
            >
                {/* Header */}
                <div
                    className={`flex items-center ${
                        collapsed ? "justify-center" : "justify-between"
                    } p-4 border-b transition-all duration-300 ${theme.border}`}
                >
                    {!collapsed && (
                        <h1 className="font-bold text-xl bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            SIMLATEK
                        </h1>
                    )}
                    <div
                        className={`flex items-center ${
                            collapsed ? "flex-col space-y-2" : "space-x-2"
                        }`}
                    >
                        <button
                            onClick={toggleTheme}
                            className={`w-12 h-6 rounded-full relative ${toggleTrackStyle} transition-colors duration-300 focus:outline-none`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-300 ${toggleThumbStyle}`}
                            >
                                {darkMode ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 m-0.5 text-indigo-600"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 m-0.5 text-amber-500"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </span>
                        </button>
                        <button
                            onClick={toggleSidebar}
                            className={`${theme.hoverBg} p-1 rounded-full ${theme.textSecondary}`}
                        >
                            {collapsed ? (
                                <ChevronRight size={18} />
                            ) : (
                                <ChevronLeft size={18} />
                            )}
                        </button>
                    </div>
                </div>

                {/* User Profile */}
                <div
                    className={`p-4 border-b transition-all duration-300 ${
                        theme.border
                    } flex ${collapsed ? "justify-center" : "items-center"}`}
                >
                    <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                            <span className="text-white font-medium">U</span>
                        </div>
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    </div>
                    {!collapsed && (
                        <div className="ml-3">
                            <p className={`${theme.text} font-semibold`}>
                                {user.name}
                            </p>
                            <p className={`${theme.activeText} text-sm`}>
                                {user.role}
                            </p>
                        </div>
                    )}
                </div>

                {/* Menu */}
                <div className="py-4 px-2 overflow-y-auto max-h-[calc(100vh-200px)]">
                    <ul className="space-y-1">
                        {menuItems
                            .filter((item) => !collapsed || item.isItem)
                            .map((item) => (
                                <li key={item.id}>
                                    {item.type === "separator" ? (
                                        <div className="py-2 px-2">
                                            <span
                                                className={`${theme.separator} text-xs font-semibold uppercase tracking-wider`}
                                            >
                                                {item.label}
                                            </span>
                                        </div>
                                    ) : (
                                        <Link
                                            href={item.to!}
                                            onClick={() =>
                                                handleNavigate(item.id)
                                            }
                                            className={`flex items-center ${
                                                collapsed
                                                    ? "justify-center p-3"
                                                    : "p-2 px-4"
                                            } ${
                                                theme.hoverBg
                                            } rounded-lg transition-all ${
                                                activeItem === item.id
                                                    ? `${theme.activeBg} ${theme.activeText}`
                                                    : theme.textSecondary
                                            }`}
                                        >
                                            {item.icon}
                                            {!collapsed && (
                                                <span className="ml-3">
                                                    {item.label}
                                                </span>
                                            )}
                                            {activeItem === item.id &&
                                                !collapsed && (
                                                    <span className="ml-auto h-2 w-2 rounded-full bg-current"></span>
                                                )}
                                        </Link>
                                    )}
                                </li>
                            ))}
                    </ul>
                </div>

                {/* Logout */}
                <div
                    className={`absolute bottom-0 w-full border-t ${theme.border}`}
                >
                    <button
                        onClick={handleLogout}
                        className={`w-full flex ${
                            collapsed ? "justify-center p-4" : "p-4"
                        } text-red-400 ${theme.hoverBg} transition-all`}
                    >
                        <LogOut size={20} />
                        {!collapsed && <span className="ml-3">Logout</span>}
                    </button>
                </div>
            </aside>

            <main
                className={`flex-1 transition-all duration-300 ${theme.bg} ${
                    collapsed ? "pl-16" : "pl-64"
                } overflow-y-auto h-screen overflow-hidden`}
            >
                {children}
            </main>
        </div>
    );
};

export default Layout;
