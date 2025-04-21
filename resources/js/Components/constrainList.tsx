import React from "react";
import { ConstrainListProps } from "../types";

const ConstrainList: React.FC<ConstrainListProps> = ({
    constraints,
    dokumenKategoris,
    onEdit,
    onDelete,
    isDeleting,
}) => {
    const getTypeBadge = (type: string) => {
        switch (type) {
            case "schedule":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
            case "upload_file":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "progress":
                return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
            case "text":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "schedule":
                return "Jadwal";
            case "upload_file":
                return "Upload File";
            case "progress":
                return "Progress";
            case "text":
                return "Teks";
            default:
                return type;
        }
    };

    return (
        <div className="mt-10">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 border-b-2 border-cyan-500 pb-2">
                Daftar Constraint
            </h2>
            {constraints.length === 0 ? (
                <div className="text-center py-12 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-md transition-all duration-300">
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                        Belum ada constraint yang ditambahkan.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {constraints.map((constraint) => (
                        <div
                            key={constraint.id}
                            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 flex flex-col h-full transform hover:-translate-y-1"
                        >
                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                        {constraint.name}
                                    </h3>
                                    <span
                                        className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeBadge(
                                            constraint.type,
                                        )}`}
                                    >
                                        {getTypeLabel(constraint.type)}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    <p>
                                        <span className="font-medium">
                                            Tahapan:
                                        </span>{" "}
                                        <span className="text-gray-800 dark:text-gray-200">
                                            {constraint.permintaantahapan
                                                ?.name || "Tidak Diketahui"}
                                        </span>
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Wajib:
                                        </span>{" "}
                                        <span
                                            className={
                                                constraint.detail.required
                                                    ? "text-green-600 dark:text-green-400"
                                                    : "text-red-600 dark:text-red-400"
                                            }
                                        >
                                            {constraint.detail.required
                                                ? "Ya"
                                                : "Tidak"}
                                        </span>
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Tabel:
                                        </span>{" "}
                                        <span className="text-gray-800 dark:text-gray-200">
                                            {constraint.detail.target_table}
                                        </span>
                                    </p>
                                    {constraint.type === "progress" ? (
                                        <p>
                                            <span className="font-medium">
                                                Kolom:
                                            </span>{" "}
                                            <span className="text-gray-800 dark:text-gray-200">
                                                {constraint.detail.target_columns?.join(
                                                    ", ",
                                                ) || "Tidak Ada"}
                                            </span>
                                        </p>
                                    ) : (
                                        <p>
                                            <span className="font-medium">
                                                Kolom:
                                            </span>{" "}
                                            <span className="text-gray-800 dark:text-gray-200">
                                                {constraint.detail
                                                    .target_column || "N/A"}
                                            </span>
                                        </p>
                                    )}
                                    {constraint.detail.dokumenkategori_id && (
                                        <p>
                                            <span className="font-medium">
                                                Kategori Dokumen:
                                            </span>{" "}
                                            <span className="text-gray-800 dark:text-gray-200">
                                                {dokumenKategoris.find(
                                                    (k) =>
                                                        Number(k.id) ===
                                                        Number(
                                                            constraint.detail
                                                                .dokumenkategori_id,
                                                        ),
                                                )?.name || "Tidak Diketahui"}
                                            </span>
                                        </p>
                                    )}
                                    {constraint.type === "upload_file" &&
                                        constraint.detail.isTesting && (
                                            <p>
                                                <span className="font-medium">
                                                    Tipe Testing:
                                                </span>{" "}
                                                <span className="text-gray-800 dark:text-gray-200">
                                                    {constraint.detail
                                                        .testingtype || "N/A"}
                                                </span>
                                            </p>
                                        )}
                                </div>
                            </div>
                            <div className="mt-6 flex space-x-3">
                                <button
                                    onClick={() => onEdit(constraint)}
                                    className="flex-1 bg-yellow-500 dark:bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 dark:hover:bg-yellow-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => onDelete(constraint.id)}
                                    className="flex-1 bg-red-500 dark:bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-all duration-200 disabled:bg-red-400 dark:disabled:bg-red-500 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? "Menghapus..." : "Hapus"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ConstrainList;
