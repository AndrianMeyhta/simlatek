// resources/js/Pages/Constrain/Index.tsx
import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "../Layouts/layout";
import { Head } from "@inertiajs/react";

interface Tahapan {
    id: number;
    name: string;
}

interface Constraint {
    id: number;
    projecttahapan_id: number;
    type: string; // Ubah ke 'type' sesuai migrasi baru
    detail: {
        name: string;
        required: boolean;
        target_table: string;
        target_column: string;
        dokumenkategori_id?: number | null;
    };
    project_tahapan: { name: string };
}

interface DokumenKategori {
    id: number;
    name: string;
}

interface Props extends Record<string, any> {
    tahapans: Tahapan[];
    constraints: Constraint[];
    dokumenKategoris: DokumenKategori[];
}

// Komponen Form
const ConstrainForm: React.FC<{
    form: any;
    setForm: any;
    tahapans: Tahapan[];
    dokumenKategoris: DokumenKategori[];
    onSubmit: (e: React.FormEvent) => void;
    isPending: boolean;
    resetForm: () => void;
}> = ({ form, setForm, tahapans, dokumenKategoris, onSubmit, isPending, resetForm }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setForm((prev: any) => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tahapan Proyek</label>
                <select
                    name="projecttahapan_id"
                    value={form.projecttahapan_id}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                >
                    <option value="">Pilih Tahapan</option>
                    {tahapans.map((tahapan) => (
                        <option key={tahapan.id} value={tahapan.id}>
                            {tahapan.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Constraint</label>
                <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="schedule">Jadwal</option>
                    <option value="upload_file">Upload File</option>
                    <option value="text">Teks</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Contoh: Jadwal Rapat atau Undangan"
                    required
                />
            </div>

            <div>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        name="required"
                        checked={form.required}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Wajib Diisi</span>
                </label>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tabel Tujuan</label>
                <input
                    type="text"
                    name="target_table"
                    value={form.target_table}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Contoh: rapats, dokumens"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kolom Tujuan</label>
                <input
                    type="text"
                    name="target_column"
                    value={form.target_column}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Contoh: jadwalrapat, filepath"
                    required
                />
            </div>

            {form.type === "upload_file" && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Dokumen</label>
                    <select
                        name="dokumenkategori_id"
                        value={form.dokumenkategori_id || ""}
                        onChange={(e) => setForm({ ...form, dokumenkategori_id: e.target.value || null })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Pilih Kategori (Opsional)</option>
                        {dokumenKategoris.map((kategori) => (
                            <option key={kategori.id} value={kategori.id}>
                                {kategori.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="flex space-x-3">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 disabled:bg-indigo-400"
                >
                    {isPending ? "Menyimpan..." : form.id ? "Perbarui" : "Tambah"}
                </button>
                {form.id && (
                    <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200"
                    >
                        Batal
                    </button>
                )}
            </div>
        </form>
    );
};

// Komponen List
const ConstrainList: React.FC<{
    constraints: Constraint[];
    dokumenKategoris: DokumenKategori[];
    onEdit: (constraint: Constraint) => void;
    onDelete: (id: number) => void;
    isDeleting: boolean;
}> = ({ constraints, dokumenKategoris, onEdit, onDelete, isDeleting }) => (
    <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Daftar Constraint</h2>
        {constraints.length === 0 ? (
            <p className="text-gray-500">Belum ada constraint yang ditambahkan.</p>
        ) : (
            <div className="grid gap-4 md:grid-cols-2">
                {constraints.map((constraint) => (
                    <div
                        key={constraint.id}
                        className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition duration-200"
                    >
                        <div className="space-y-1">
                            <p>
                                <strong className="text-gray-700">Tahapan:</strong>{" "}
                                {constraint.project_tahapan.name}
                            </p>
                            <p>
                                <strong className="text-gray-700">Tipe:</strong>{" "}
                                {constraint.type === "schedule"
                                    ? "Jadwal"
                                    : constraint.type === "upload_file"
                                        ? "Upload File"
                                        : "Teks"}
                            </p>
                            <p>
                                <strong className="text-gray-700">Nama:</strong> {constraint.detail.name}
                            </p>
                            <p>
                                <strong className="text-gray-700">Wajib:</strong>{" "}
                                {constraint.detail.required ? "Ya" : "Tidak"}
                            </p>
                            <p>
                                <strong className="text-gray-700">Tabel:</strong>{" "}
                                {constraint.detail.target_table}
                            </p>
                            <p>
                                <strong className="text-gray-700">Kolom:</strong>{" "}
                                {constraint.detail.target_column}
                            </p>
                            {constraint.detail.dokumenkategori_id && (
                                <p>
                                    <strong className="text-gray-700">Kategori Dokumen:</strong>{" "}
                                    {dokumenKategoris.find((k) => Number(k.id) === Number(constraint.detail.dokumenkategori_id))?.name || "Tidak Diketahui"}
                                </p>
                            )}
                        </div>
                        <div className="mt-3 flex space-x-2">
                            <button
                                onClick={() => onEdit(constraint)}
                                className="w-full bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600 transition duration-200"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(constraint.id)}
                                className="w-full bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition duration-200 disabled:bg-red-400"
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

const ConstrainIndex: React.FC = () => {
    const { props } = usePage<Props>();
    const { tahapans, dokumenKategoris } = props;

    const queryClient = useQueryClient();

    const [form, setForm] = useState<{
        id: number | null;
        projecttahapan_id: string;
        type: "schedule" | "upload_file" | "text";
        name: string;
        required: boolean;
        target_table: string;
        target_column: string;
        dokumenkategori_id: string | null;
    }>({
        id: null,
        projecttahapan_id: "",
        type: "schedule",
        name: "",
        required: true,
        target_table: "",
        target_column: "",
        dokumenkategori_id: null,
    });

    const { data: constraints, isLoading } = useQuery<Constraint[]>({
        queryKey: ["constraints"],
        queryFn: async () => {
            const response = await axios.get("/constrain");
            return response.data.constraints;
        },
        initialData: props.constraints,
    });

    const createMutation = useMutation({
        mutationFn: (newConstraint: typeof form) =>
            axios.post("/constrain", newConstraint, {
                headers: {
                    "X-CSRF-TOKEN":
                        document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["constraints"] });
            resetForm();
        },
        onError: (error) => {
            console.error("Gagal menambahkan constraint:", error);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (updatedConstraint: typeof form) =>
            axios.put(`/constrain/${updatedConstraint.id}`, updatedConstraint, {
                headers: {
                    "X-CSRF-TOKEN":
                        document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["constraints"] });
            resetForm();
        },
        onError: (error) => {
            console.error("Gagal memperbarui constraint:", error);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) =>
            axios.delete(`/constrain/${id}`, {
                headers: {
                    "X-CSRF-TOKEN":
                        document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["constraints"] });
        },
        onError: (error) => {
            console.error("Gagal menghapus constraint:", error);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.id) {
            updateMutation.mutate(form);
        } else {
            createMutation.mutate(form);
        }
    };

    const handleEdit = (constraint: Constraint) => {
        setForm({
            id: constraint.id,
            projecttahapan_id: constraint.projecttahapan_id.toString(),
            type: constraint.type as "schedule" | "upload_file" | "text",
            name: constraint.detail.name,
            required: constraint.detail.required,
            target_table: constraint.detail.target_table,
            target_column: constraint.detail.target_column,
            dokumenkategori_id: constraint.detail.dokumenkategori_id?.toString() || null,
        });
    };

    const handleDelete = (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus constraint ini?")) {
            deleteMutation.mutate(id);
        }
    };

    const resetForm = () => {
        setForm({
            id: null,
            projecttahapan_id: "",
            type: "schedule",
            name: "",
            required: true,
            target_table: "",
            target_column: "",
            dokumenkategori_id: null,
        });
    };

    if (isLoading) {
        return (
            <Layout currentActive="constrain">
                <div className="text-center mt-10 text-gray-600">Memuat...</div>
            </Layout>
        );
    }

    return (
        <>
            <Head title="Simlatek - Constrain" />
            <Layout currentActive="constrain">
                <div className="max-w-6xl mx-auto p-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">Kelola Constraint Tahapan</h1>

                    {/* Form */}
                    <ConstrainForm
                        form={form}
                        setForm={setForm}
                        tahapans={tahapans}
                        dokumenKategoris={dokumenKategoris}
                        onSubmit={handleSubmit}
                        isPending={createMutation.isPending || updateMutation.isPending}
                        resetForm={resetForm}
                    />

                    {/* Daftar */}
                    <ConstrainList
                        constraints={constraints || []}
                        dokumenKategoris={dokumenKategoris}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isDeleting={deleteMutation.isPending}
                    />
                </div>
            </Layout>
        </>
    );
};

export default ConstrainIndex;
