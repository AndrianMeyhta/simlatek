// js/pages/dashboard.tsx
import { Head, Link } from "@inertiajs/react";
import Layout from "../Layouts/layout";
import { useState } from "react";

// Tipe data untuk props
interface DashboardProps {
    stats: {
        active: number;
        avg_progress: number;
        pending_rekomendasi: number;
        team_members: number;
    };
    activePermintaans: {
        id: number;
        nomertiket: string;
        title: string;
        progress_percentage: number;
        status: string;
    }[];
    recentLogs: {
        id: number;
        description: string;
        created_at: string;
        user_name: string;
    }[];
    pendingTasks: {
        id: number;
        description: string;
        permintaan_title: string;
        permintaan_id: number;
    }[];
    teamMembers: {
        id: number;
        name: string;
        email: string;
    }[];
    canAddUsers: boolean;
    roleId: number;
    userName: string;
}

const Dashboard: React.FC<DashboardProps> = ({
    stats,
    activePermintaans,
    recentLogs,
    pendingTasks,
    teamMembers,
    canAddUsers,
    roleId,
    userName,
}) => {
    // State untuk mengontrol visibilitas modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fungsi untuk membuka/tutup modal
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    // Fungsi untuk mendapatkan warna badge berdasarkan status
    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "new":
                return "bg-blue-100 text-blue-800";
            case "in progress":
                return "bg-yellow-100 text-yellow-800";
            case "completed":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <>
            <Head title="Simlatek - Dashboard" />
            <Layout currentActive="dashboard">
                <div className="p-6 sm:p-8 space-y-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Selamat Datang, {userName}!
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Pantau proyek dan tugas Anda di sini.
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            {(roleId === 5 || roleId === 1) && (
                                <Link
                                    href="/permintaan/create"
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md"
                                >
                                    Buat Permintaan
                                </Link>
                            )}
                            {canAddUsers && (
                                <Link
                                    href="/permintaan"
                                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition shadow-md"
                                >
                                    Kelola Permintaan
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Statistik */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-auto-fit gap-4 animate-fade-in">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center space-x-4 transform hover:scale-105 transition">
                            <div className="p-4 bg-blue-200 dark:bg-blue-900 rounded-full">
                                <svg
                                    className="w-8 h-8 text-blue-600 dark:text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 17v-6h6v6m-3-9v12"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    Permintaan Aktif
                                </h3>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {stats.active}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center space-x-4 transform hover:scale-105 transition">
                            <div className="p-4 bg-green-200 dark:bg-green-900 rounded-full">
                                <svg
                                    className="w-8 h-8 text-green-600 dark:text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    Progress Rata-rata
                                </h3>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {Math.round(stats.avg_progress)}%
                                </p>
                            </div>
                        </div>
                        {(roleId === 2 || roleId === 5) && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center space-x-4 transform hover:scale-105 transition">
                                <div className="p-4 bg-yellow-200 dark:bg-yellow-900 rounded-full">
                                    <svg
                                        className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 8v4l3 3"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        Rekomendasi Pending
                                    </h3>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {stats.pending_rekomendasi}
                                    </p>
                                </div>
                            </div>
                        )}
                        {roleId !== 5 && (
                            <div
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center space-x-4 transform hover:scale-105 transition cursor-pointer"
                                onClick={toggleModal}
                            >
                                <div className="p-4 bg-purple-200 dark:bg-purple-900 rounded-full">
                                    <svg
                                        className="w-8 h-8 text-purple-600 dark:text-purple-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        Anggota Tim
                                    </h3>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {stats.team_members}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Modal untuk daftar anggota tim */}
                    {isModalOpen && (
                        <>
                            <div
                                className="fixed inset-0 bg-gray-300 dark:bg-gray-700 opacity-50 z-40"
                                onClick={toggleModal}
                            ></div>
                            <div className="fixed inset-0 flex items-center justify-center z-50">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-lg w-full p-6 animate-fade-in">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Daftar Anggota Tim
                                        </h2>
                                        <button
                                            onClick={toggleModal}
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            <svg
                                                className="w-6 h-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                    {teamMembers.length > 0 ? (
                                        <div className="space-y-4 max-h-96 overflow-y-auto">
                                            {teamMembers.map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center space-x-3"
                                                >
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {member.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {member.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Tidak ada anggota tim.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Permintaan Aktif */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-fade-in">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Permintaan Aktif
                            </h2>
                            {activePermintaans.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700">
                                                <th className="p-4">
                                                    No. Tiket
                                                </th>
                                                <th className="p-4">Judul</th>
                                                <th className="p-4">Progres</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activePermintaans.map(
                                                (permintaan) => (
                                                    <tr
                                                        key={permintaan.id}
                                                        className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                                    >
                                                        <td className="p-4 font-medium">
                                                            {
                                                                permintaan.nomertiket
                                                            }
                                                        </td>
                                                        <td className="p-4">
                                                            {permintaan.title}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-32 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                                                    <div
                                                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-300"
                                                                        style={{
                                                                            width: `${permintaan.progress_percentage}%`,
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                                                    {permintaan.progress_percentage.toFixed(
                                                                        0,
                                                                    )}
                                                                    %
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span
                                                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(permintaan.status)}`}
                                                            >
                                                                {
                                                                    permintaan.status
                                                                }
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <Link
                                                                href={`/permintaan/${permintaan.id}`}
                                                                className="text-blue-600 hover:underline dark:text-blue-400 font-medium"
                                                            >
                                                                Lihat
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 p-4">
                                    Tidak ada permintaan aktif saat ini.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Aktivitas Terbaru */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-fade-in">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Aktivitas Terbaru
                        </h2>
                        {recentLogs.length > 0 ? (
                            <div className="space-y-4">
                                {recentLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="flex items-start space-x-3"
                                    >
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                                            <svg
                                                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 8v4l3 3"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-gray-900 dark:text-white font-medium">
                                                {log.description}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Oleh {log.user_name} pada{" "}
                                                {log.created_at}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">
                                Tidak ada aktivitas terbaru.
                            </p>
                        )}
                    </div>

                    {/* Tugas Pending */}
                    {pendingTasks.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-fade-in">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Tugas Pending
                            </h2>
                            <div className="space-y-4">
                                {pendingTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                    >
                                        <svg
                                            className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 8v4l3 3"
                                            />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {task.description}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Pada permintaan:{" "}
                                                {task.permintaan_title}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/permintaan/${task.permintaan_id}`}
                                            className="text-blue-600 hover:underline dark:text-blue-400 font-medium"
                                        >
                                            Selesaikan
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Layout>
        </>
    );
};

export default Dashboard;
