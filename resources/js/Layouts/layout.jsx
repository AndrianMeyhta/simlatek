import React, { useState, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import { confirmAlert } from "../Components/sweetAlert";
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
    Sun,
    Moon,
} from "lucide-react";

const Layout = ({ currentActive, children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeItem, setActiveItem] = useState(currentActive || "dashboard");
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme ? savedTheme === "dark" : true;
    });

    const { auth } = usePage().props;
    const [user] = useState({
        name: auth.user || "Guest",
        role: auth.role || "User",
    });

    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode);
        localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const toggleSidebar = () => setCollapsed(!collapsed);
    const toggleTheme = () => setDarkMode(prev => !prev);
    const handleNavigate = (itemId) => setActiveItem(itemId);

    const handleLogout = () => {
        confirmAlert(
            "Konfirmasi!",
            "Apakah Anda yakin ingin keluar?",
            () => axios.post("/logout", {}, { withCredentials: true })
                .then(() => window.location.href = "/"),
            "Ya",
            "Batal",
            "Berhasil logout!",
            "Logout gagal!"
        );
    };

    const menuItems = [
        { id: "dashboard", icon: <Grid size={20} />, label: "Dashboard", to: "/dashboard", isItem: true },
        { id: "pengajuan", type: "separator", label: "Pengajuan" },
        { id: "permohonan_pengajuan", icon: <FileText size={20} />, label: "Permohonan", to: "/permintaan/create", isItem: true },
        { id: "list", type: "separator", label: "List" },
        { id: "permohonan_daftar", icon: <FolderOpen size={20} />, label: "Permohonan", to: "/permintaan", isItem: true },
        { id: "manage", type: "separator", label: "Manage" },
        { id: "database", icon: <Database size={20} />, label: "Database", to: "/manage", isItem: true },
        { id: "constrain", icon: <Lock size={20} />, label: "Constrain", to: "/constrain", isItem: true },
    ];

    const getThemeColors = () => darkMode ? {
        bg: "bg-gray-800",
        border: "border-gray-800",
        text: "text-gray-200",
        textSecondary: "text-gray-400",
        hoverBg: "hover:bg-gray-800",
        activeBg: "bg-cyan-900/50",
        activeText: "text-cyan-400",
        separator: "text-cyan-500",
    } : {
        bg: "bg-white",
        border: "border-gray-200",
        text: "text-gray-800",
        textSecondary: "text-gray-600",
        hoverBg: "hover:bg-gray-100",
        activeBg: "bg-cyan-50",
        activeText: "text-cyan-600",
        separator: "text-cyan-600",
    };

    const theme = getThemeColors();

    return (
        <div className="flex h-screen overflow-hidden">
            <aside className={`fixed left-0 top-0 h-screen ${theme.bg} transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
                {/* Header */}
                <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} p-4 border-b transision-all duration-300 ${theme.border}`}>
                    {!collapsed && (
                        <h1 className="font-bold text-xl bg-gradient-to-r from-pink-600 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
                            SIMLATEK
                        </h1>
                    )}
                    <div className={`flex items-center ${collapsed ? "flex-col space-y-2" : "space-x-2"}`}>
                        <button
                            onClick={toggleTheme}
                            className={`${theme.hoverBg} p-1 rounded-full ${theme.textSecondary}`}
                        >
                            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button
                            onClick={toggleSidebar}
                            className={`${theme.hoverBg} p-1 rounded-full ${theme.textSecondary}`}
                        >
                            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>
                    </div>
                </div>

                {/* User Profile */}
                <div className={`p-4 border-b transision-all duration-300 ${theme.border} flex ${collapsed ? "justify-center" : "items-center"}`}>
                    <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                            <span className="text-white font-medium">U</span>
                        </div>
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    </div>
                    {!collapsed && (
                        <div className="ml-3">
                            <p className={`${theme.text} font-semibold`}>{user.name}</p>
                            <p className={`${theme.activeText} text-sm`}>{user.role}</p>
                        </div>
                    )}
                </div>

                {/* Menu */}
                <div className="py-4 px-2 overflow-y-auto max-h-[calc(100vh-200px)]">
                    <ul className="space-y-1">
                        {menuItems
                            .filter(item => !collapsed || item.isItem) // Hanya tampilkan items saat collapsed
                            .map((item) => (
                            <li key={item.id}>
                                {item.type === "separator" ? (
                                    <div className="py-2 px-2">
                                        <span className={`${theme.separator} text-xs font-semibold uppercase tracking-wider`}>
                                            {item.label}
                                        </span>
                                    </div>
                                ) : (
                                    <Link
                                        href={item.to}
                                        onClick={() => handleNavigate(item.id)}
                                        className={`flex items-center ${collapsed ? "justify-center p-3" : "p-2 px-4"} ${theme.hoverBg} rounded-lg transition-all ${
                                            activeItem === item.id ? `${theme.activeBg} ${theme.activeText}` : theme.textSecondary
                                        }`}
                                    >
                                        {item.icon}
                                        {!collapsed && <span className="ml-3">{item.label}</span>}
                                        {activeItem === item.id && !collapsed && (
                                            <span className="ml-auto h-2 w-2 rounded-full bg-current"></span>
                                        )}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Logout */}
                <div className="absolute bottom-0 w-full border-t ${theme.border}">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex ${collapsed ? "justify-center p-4" : "p-4"} text-red-400 ${theme.hoverBg} transition-all`}
                    >
                        <LogOut size={20} />
                        {!collapsed && <span className="ml-3">Logout</span>}
                    </button>
                </div>
            </aside>

            <main className={`flex-1 transition-all duration-300 ${collapsed ? "pl-16" : "pl-64"} overflow-y-auto h-screen`}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
