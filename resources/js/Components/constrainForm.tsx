// resources/js/Components/ConstrainForm.tsx
import React, { useEffect } from "react";
import { ConstrainFormProps } from "../types";

const ConstrainForm: React.FC<ConstrainFormProps> = ({
    form,
    setForm,
    tahapans,
    dokumenKategoris,
    onSubmit,
    isPending,
    resetForm,
    relationOptions,
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

        // Jika tipe diubah, atur target_table dan target_column sesuai kondisi
        if (name === "type") {
            if (value === "upload_file") {
                setForm({
                    ...form,
                    [name]: value,
                    target_table: "dokumens",
                    target_column: "filepath",
                });
            } else {
                setForm({
                    ...form,
                    [name]: value,
                    target_table: "",
                    target_column: "",
                });
            }
        } else {
            setForm({
                ...form,
                [name]: newValue,
            });
        }
    };

    // Efek untuk memastikan target_table dan target_column sesuai saat form.type berubah
    useEffect(() => {
        if (form.type === "upload_file" && (form.target_table !== "dokumens" || form.target_column !== "filepath")) {
            setForm({
                ...form,
                target_table: "dokumens",
                target_column: "filepath",
            });
        }
    }, [form.type]);

    return (
        <form onSubmit={onSubmit} className="bg-white p-6 rounded-xl shadow-lg space-y-6 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-gray-800">{form.id ? "Edit Constraint" : "Tambah Constraint Baru"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tahapan Proyek</label>
                    <select
                        name="projecttahapan_id"
                        value={form.projecttahapan_id}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
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
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
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
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        placeholder="Contoh: Jadwal Rapat"
                        required
                    />
                </div>

                <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="required"
                            checked={form.required}
                            onChange={handleChange}
                            className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">Wajib Diisi</span>
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tabel Tujuan</label>
                    <input
                        type="text"
                        name="target_table"
                        value={form.target_table}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        placeholder="Contoh: rapats"
                        required
                        disabled={form.type === "upload_file"} // Disable saat upload_file
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kolom Tujuan</label>
                    <input
                        type="text"
                        name="target_column"
                        value={form.target_column}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        placeholder="Contoh: jadwalrapat"
                        required
                        disabled={form.type === "upload_file"} // Disable saat upload_file
                    />
                </div>

                {form.type === "upload_file" && (
                    <>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Dokumen</label>
                            <select
                                name="dokumenkategori_id"
                                value={form.dokumenkategori_id || ""}
                                onChange={(e) => setForm({ ...form, dokumenkategori_id: e.target.value || null })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            >
                                <option value="">Pilih Kategori (Opsional)</option>
                                {dokumenKategoris.map((kategori) => (
                                    <option key={kategori.id} value={kategori.id}>
                                        {kategori.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Relasi ke</label>
                            <select
                                name="relasi"
                                value={form.relasi || ""}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            >
                                <option value="">Pilih Relasi (Opsional)</option>
                                {relationOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2 flex items-center">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="isTesting"
                                    checked={form.isTesting || false}
                                    onChange={handleChange}
                                    className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700">Testing</span>
                            </label>
                        </div>

                        {form.isTesting && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Testing Type</label>
                                <select
                                    name="testingtype"
                                    value={form.testingtype || ""}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                >
                                    <option value="">Pilih Tipe Testing</option>
                                    <option value="Fungsi">Fungsi</option>
                                    <option value="Keamanan">Keamanan</option>
                                    <option value="Performa">Performa</option>
                                </select>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="flex space-x-4">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all duration-200 disabled:bg-indigo-400 shadow-md"
                >
                    {isPending ? "Menyimpan..." : form.id ? "Perbarui" : "Tambah"}
                </button>
                {form.id && (
                    <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md"
                    >
                        Batal
                    </button>
                )}
            </div>
        </form>
    );
};

export default ConstrainForm;
