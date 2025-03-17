// resources/js/Components/ConstrainForm.tsx
import React from "react";
import { ConstrainListProps } from "../types";

const ConstrainList: React.FC<ConstrainListProps> = ({ constraints, dokumenKategoris, onEdit, onDelete, isDeleting }) => (
    <div className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Daftar Constraint</h2>
        {constraints.length === 0 ? (
            <div className="text-center py-10 bg-gray-100 rounded-xl">
                <p className="text-gray-500 text-lg">Belum ada constraint yang ditambahkan.</p>
            </div>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {constraints.map((constraint) => (
                    <div
                        key={constraint.id}
                        className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
                    >
                        <div className="flex-1 space-y-3">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-gray-800">{constraint.name}</h3>
                                <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        constraint.type === "schedule"
                                            ? "bg-blue-100 text-blue-800"
                                            : constraint.type === "upload_file"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-purple-100 text-purple-800"
                                    }`}
                                >
                                    {constraint.type === "schedule"
                                        ? "Jadwal"
                                        : constraint.type === "upload_file"
                                        ? "Upload File"
                                        : "Teks"}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Tahapan:</span>{" "}
                                {constraint.project_tahapan?.name || "Tidak Diketahui"}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Wajib:</span>{" "}
                                {constraint.detail.required ? "Ya" : "Tidak"}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Tabel:</span> {constraint.detail.target_table}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Kolom:</span> {constraint.detail.target_column}
                            </p>
                            {constraint.detail.dokumenkategori_id && (
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Kategori Dokumen:</span>{" "}
                                    {dokumenKategoris.find((k) => Number(k.id) === Number(constraint.detail.dokumenkategori_id))?.name || "Tidak Diketahui"}
                                </p>
                            )}
                        </div>
                        <div className="mt-4 flex space-x-3">
                            <button
                                onClick={() => onEdit(constraint)}
                                className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-all duration-200 shadow-sm"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(constraint.id)}
                                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-all duration-200 disabled:bg-red-400 shadow-sm"
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

export default ConstrainList;
