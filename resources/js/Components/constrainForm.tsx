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
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value, type } = e.target;
        const newValue =
            type === "checkbox"
                ? (e.target as HTMLInputElement).checked // Pastikan ini selalu boolean
                : value;

        if (name === "type") {
            if (value === "upload_file") {
                setForm({
                    ...form,
                    [name]: value,
                    target_table: "dokumens",
                    target_column: "filepath",
                    target_columns: [],
                    isDomain: false,
                    domainType: "",
                });
            } else if (value === "progress") {
                setForm({
                    ...form,
                    [name]: value,
                    target_table: "progressreports",
                    target_column: "",
                    target_columns: ["description", "percentage_change"],
                    isDomain: false,
                    domainType: "",
                });
            } else if (value === "text") {
                setForm({
                    ...form,
                    [name]: value,
                    target_table: form.isDomain ? "domainlinks" : "",
                    target_column: form.isDomain ? "links" : "",
                    target_columns: [],
                });
            } else {
                setForm({
                    ...form,
                    [name]: value,
                    target_table: "",
                    target_column: "",
                    target_columns: [],
                    isDomain: false,
                    domainType: "",
                });
            }
        } else if (name === "isDomain") {
            const isDomainChecked = newValue as boolean; // Type assertion karena kita tahu ini dari checkbox
            setForm({
                ...form,
                isDomain: isDomainChecked,
                target_table: isDomainChecked ? "domainlinks" : "",
                target_column: isDomainChecked ? "links" : "",
                domainType: isDomainChecked ? form.domainType || "" : "",
            });
        } else {
            setForm({
                ...form,
                [name]: newValue,
            });
        }
    };

    useEffect(() => {
        if (form.type === "upload_file") {
            if (
                form.target_table !== "dokumens" ||
                form.target_column !== "filepath"
            ) {
                setForm({
                    ...form,
                    target_table: "dokumens",
                    target_column: "filepath",
                    target_columns: [],
                    isDomain: false,
                    domainType: "",
                });
            }
        } else if (form.type === "progress") {
            if (
                form.target_table !== "progressreports" ||
                JSON.stringify(form.target_columns) !==
                    JSON.stringify(["description", "percentage_change"])
            ) {
                setForm({
                    ...form,
                    target_table: "progressreports",
                    target_column: "",
                    target_columns: ["description", "percentage_change"],
                    isDomain: false,
                    domainType: "",
                });
            }
        } else if (form.type === "text" && form.isDomain) {
            if (
                form.target_table !== "domainlinks" ||
                form.target_column !== "links"
            ) {
                setForm({
                    ...form,
                    target_table: "domainlinks",
                    target_column: "links",
                });
            }
        }
    }, [form.type, form.isDomain, form, setForm]);

    return (
        <form
            onSubmit={onSubmit}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-6 transition-all duration-300"
        >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {form.id ? "Edit Constraint" : "Tambah Constraint Baru"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tahapan Proyek
                    </label>
                    <select
                        name="permintaantahapan_id"
                        value={form.permintaantahapan_id}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all duration-200"
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tipe Constraint
                    </label>
                    <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all duration-200"
                    >
                        <option value="schedule">Jadwal</option>
                        <option value="upload_file">Upload File</option>
                        <option value="progress">Progress</option>
                        <option value="text">Teks</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nama
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all duration-200"
                        placeholder="Contoh: Progress Development"
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
                            className="h-5 w-5 text-cyan-600 border-gray-300 dark:border-gray-600 rounded focus:ring-cyan-500 dark:focus:ring-cyan-400"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Wajib Diisi
                        </span>
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tabel Tujuan
                    </label>
                    <input
                        type="text"
                        name="target_table"
                        value={form.target_table}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all duration-200 disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                        placeholder="Contoh: domainlinks"
                        required
                        disabled={
                            form.type === "upload_file" ||
                            form.type === "progress" ||
                            (form.type === "text" && form.isDomain)
                        }
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Kolom Tujuan
                    </label>
                    <input
                        type="text"
                        name="target_column"
                        value={
                            form.type === "progress"
                                ? "Multiple (description, percentage_change)"
                                : form.target_column
                        }
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all duration-200 disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                        placeholder="Contoh: links"
                        required={form.type !== "progress"}
                        disabled={
                            form.type === "upload_file" ||
                            form.type === "progress" ||
                            (form.type === "text" && form.isDomain)
                        }
                    />
                </div>

                {form.type === "text" && (
                    <div className="md:col-span-2 flex flex-col gap-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="isDomain"
                                checked={form.isDomain || false}
                                onChange={handleChange}
                                className="h-5 w-5 text-cyan-600 border-gray-300 dark:border-gray-600 rounded focus:ring-cyan-500 dark:focus:ring-cyan-400"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Is Domain?
                            </span>
                        </label>

                        {form.isDomain && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Domain Type
                                </label>
                                <select
                                    name="domainType"
                                    value={form.domainType || ""}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all duration-200"
                                    required
                                >
                                    <option value="">Pilih Tipe Domain</option>
                                    <option value="sementara">Sementara</option>
                                    <option value="live">Live</option>
                                </select>
                            </div>
                        )}
                    </div>
                )}

                {form.type === "upload_file" && (
                    <>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Kategori Dokumen
                            </label>
                            <select
                                name="dokumenkategori_id"
                                value={form.dokumenkategori_id || ""}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        dokumenkategori_id:
                                            e.target.value || null,
                                    })
                                }
                                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all duration-200"
                            >
                                <option value="">
                                    Pilih Kategori (Opsional)
                                </option>
                                {dokumenKategoris.map((kategori) => (
                                    <option
                                        key={kategori.id}
                                        value={kategori.id}
                                    >
                                        {kategori.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Relasi ke
                            </label>
                            <select
                                name="relasi"
                                value={form.relasi || ""}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all duration-200"
                            >
                                <option value="">
                                    Pilih Relasi (Opsional)
                                </option>
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
                                    className="h-5 w-5 text-cyan-600 border-gray-300 dark:border-gray-600 rounded focus:ring-cyan-500 dark:focus:ring-cyan-400"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Testing
                                </span>
                            </label>
                        </div>

                        {form.isTesting && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Testing Type
                                </label>
                                <select
                                    name="testingtype"
                                    value={form.testingtype || ""}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all duration-200"
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
                    className="flex-1 bg-cyan-600 dark:bg-cyan-500 text-white py-3 px-6 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-600 transition-all duration-200 disabled:bg-cyan-400 dark:disabled:bg-cyan-600 disabled:cursor-not-allowed shadow-md"
                >
                    {isPending
                        ? "Menyimpan..."
                        : form.id
                          ? "Perbarui"
                          : "Tambah"}
                </button>
                {form.id && (
                    <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 bg-gray-500 dark:bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-200 shadow-md"
                    >
                        Batal
                    </button>
                )}
            </div>
        </form>
    );
};

export default ConstrainForm;
