import React, { useState, useEffect, ReactNode } from "react";
import { usePage, Link } from "@inertiajs/react";
import {
    successAlert,
    confirmAlert,
    errorAlert,
} from "../Components/sweetAlert";
import axios from "axios";
import { User, ThemeColors } from "../types";
import {
    Grid,
    Database,
    FileText,
    FolderOpen,
    Box,
    Lock,
    UserCog,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Settings,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface MenuItem {
    id: string;
    label: string;
    to?: string;
    icon?: ReactNode;
    isItem?: boolean;
    type?: "separator";
    onClick?: () => void;
}

interface ActivePermintaan {
    id: number;
    permintaan_id: number;
    title?: string;
}

interface LayoutProps {
    currentActive?: string;
    children: ReactNode;
}

const fetchActivePermintaans = async () => {
    const response = await axios.get("/active-permintaans", {
        withCredentials: true,
    });
    return response.data;
};

const Layout: React.FC<LayoutProps> = ({ currentActive, children }) => {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const [activeItem, setActiveItem] = useState<string>(
        currentActive || "dashboard",
    );
    const [darkMode, setDarkMode] = useState<boolean>(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme ? savedTheme === "dark" : true;
    });
    const [isProfileModalOpen, setIsProfileModalOpen] =
        useState<boolean>(false);
    const [formData, setFormData] = useState<{
        name: string;
        email: string;
        password: string;
    }>({
        name: "",
        email: "",
        password: "",
    });

    const { auth } = usePage<{
        auth: { user: string; role: string; role_id?: number; email?: string };
    }>().props;
    const [user, setUser] = useState<User>({
        name: auth.user || "Guest",
        role: auth.role || "User",
        id: auth.role_id || 0,
        email: auth.email || "",
    });

    const isSuperadmin = auth.role === "Superadmin";

    const { data: activePermintaans = [], isLoading } = useQuery({
        queryKey: ["activePermintaans"],
        queryFn: fetchActivePermintaans,
        enabled: !isSuperadmin,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode);
        localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    useEffect(() => {
        setFormData({
            name: user.name,
            email: user.email || "",
            password: "",
        });
    }, [user]);

    console.log("auth:", auth);

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
            "Logout gagal!",
        );
    };

    const openProfileModal = (): void => {
        setFormData({
            name: user.name,
            email: user.email || "",
            password: "",
        });
        setIsProfileModalOpen(true);
    };

    const closeProfileModal = (): void => {
        setIsProfileModalOpen(false);
        setFormData((prev) => ({ ...prev, password: "" }));
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFormSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password || undefined,
            };
            await axios.put(`/dashboard/users/${user.id}`, payload, {
                withCredentials: true,
            });
            setUser((prev) => ({
                ...prev,
                name: formData.name,
                email: formData.email,
            }));
            successAlert("Sukses!", "Profil berhasil diperbarui.");
            closeProfileModal();
        } catch (error: any) {
            console.error("Update failed:", error);
            const errorMessage =
                error.response?.data?.message || "Gagal memperbarui profil.";
            errorAlert("Gagal!", errorMessage);
        }
    };

    const allowedRoleIds = [1, 5];

    const superadminMenuItems: MenuItem[] = [
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
        {
            id: "aplikasi_daftar",
            icon: <FolderOpen size={20} />,
            label: "Aplikasi",
            to: "/aplikasi",
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
        {
            id: "userskill",
            icon: <UserCog size={20} />,
            label: "User Skill",
            to: "/user-management",
            isItem: true,
        },
    ];

    const nonSuperadminMenuItems: MenuItem[] = [
        {
            id: "dashboard",
            icon: <Grid size={20} />,
            label: "Dashboard",
            to: "/dashboard",
            isItem: true,
        },
        { id: "pengajuan", type: "separator", label: "Pengajuan" },
        ...(allowedRoleIds.includes(auth.role_id || 0)
            ? [
                  {
                      id: "permohonan_pengajuan",
                      icon: <FileText size={20} />,
                      label: "Permohonan",
                      to: "/permintaan/create",
                      isItem: true,
                  },
              ]
            : []),
        {
            id: "active_permintaan",
            type: "separator",
            label: "Permintaan Aktif",
        },
        ...(activePermintaans.length > 0
            ? activePermintaans
                  .slice(0, 5)
                  .map((permintaan: ActivePermintaan) => ({
                      id: `permintaan_${permintaan.permintaan_id}`,
                      icon: <FolderOpen size={20} />,
                      label:
                          permintaan.title ||
                          `Permintaan #${permintaan.permintaan_id}`,
                      to: `/permintaan/${permintaan.permintaan_id}`,
                      isItem: true,
                  }))
            : [
                  {
                      id: "no_permintaan",
                      icon: <FolderOpen size={20} />,
                      label: "Tidak ada permintaan aktif",
                      to: "#",
                      isItem: true,
                  },
              ]),
        ...(activePermintaans.length > 5
            ? [
                  {
                      id: "see_all_permintaan",
                      icon: <FolderOpen size={20} />,
                      label: "Lihat Semua Permintaan Aktif",
                      to: "/permintaan",
                      isItem: true,
                  },
              ]
            : []),
    ];

    const menuItems = isSuperadmin
        ? superadminMenuItems
        : nonSuperadminMenuItems;

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
                  cardBg: "bg-gray-900/80 backdrop-blur-xl",
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
                  cardBg: "bg-white/80 backdrop-blur-xl",
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
                                        <button
                                            onClick={() => {
                                                if (item.onClick) {
                                                    item.onClick();
                                                } else {
                                                    handleNavigate(item.id);
                                                }
                                            }}
                                            className={`flex items-center w-full text-left ${
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
                                            {item.to ? (
                                                <Link
                                                    href={item.to}
                                                    className="flex items-center w-full"
                                                >
                                                    {item.icon}
                                                    {!collapsed && (
                                                        <span className="ml-3">
                                                            {item.label}
                                                        </span>
                                                    )}
                                                </Link>
                                            ) : (
                                                <>
                                                    {item.icon}
                                                    {!collapsed && (
                                                        <span className="ml-3">
                                                            {item.label}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                            {activeItem === item.id &&
                                                !collapsed && (
                                                    <span className="ml-auto h-2 w-2 rounded-full bg-current"></span>
                                                )}
                                        </button>
                                    )}
                                </li>
                            ))}
                    </ul>
                </div>

                <div className="absolute bottom-0 w-full">
                    {/* Profile Settings */}
                    <div className={`border-t ${theme.border}`}>
                        <button
                            onClick={openProfileModal}
                            className={`w-full flex ${
                                collapsed ? "justify-center p-4" : "p-4"
                            } ${theme.textSecondary} ${theme.hoverBg} transition-all`}
                        >
                            <Settings size={20} />
                            {!collapsed && (
                                <span className="ml-3">Edit Profil</span>
                            )}
                        </button>
                    </div>

                    {/* Logout */}
                    <div className={`border-t ${theme.border}`}>
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
                </div>
            </aside>

            <main
                className={`flex-1 transition-all duration-300 ${theme.bg} ${
                    collapsed ? "pl-16" : "pl-64"
                } overflow-y-auto h-screen overflow-hidden`}
            >
                {children}
            </main>

            {/* Profile Settings Modal */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300">
                    <div
                        className={`${theme.cardBg} p-8 rounded-2xl w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100 border ${theme.border}`}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2
                                className={`${theme.text} text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent`}
                            >
                                Edit Profile
                            </h2>
                            <button
                                onClick={closeProfileModal}
                                className={`${theme.textSecondary} hover:${theme.activeText} transition-colors`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleFormSubmit}>
                            <div className="mb-5">
                                <label
                                    className={`${theme.textSecondary} block text-sm font-medium mb-2`}
                                    htmlFor="name"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    className={`w-full p-3 rounded-lg ${theme.bg} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner`}
                                    required
                                />
                            </div>
                            <div className="mb-5">
                                <label
                                    className={`${theme.textSecondary} block text-sm font-medium mb-2`}
                                    htmlFor="email"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    className={`w-full p-3 rounded-lg ${theme.bg} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner`}
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label
                                    className={`${theme.textSecondary} block text-sm font-medium mb-2`}
                                    htmlFor="password"
                                >
                                    Password (optional)
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleFormChange}
                                    className={`w-full p-3 rounded-lg ${theme.bg} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner`}
                                    placeholder="Leave blank to keep current"
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={closeProfileModal}
                                    className={`px-5 py-2 rounded-lg ${theme.textSecondary} bg-gray-500/10 hover:bg-gray-500/20 transition-colors font-medium`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-md"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Layout;
