import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import EntitySelector from "../Components/entitySelector";
import GenericTable from "../Components/genericTable";
import CrudModal from "../Components/crudModal";
import Layout from "../Layouts/layout";
import { Helmet } from "react-helmet";
import { confirmAlert } from "../Components/sweetAlert";
import PermissionManager from "../Components/permissionManager";

const fetchEntities = async (entity) => {
    const response = await axios.get(`/manage/${entity}`);
    return response.data?.data || [];
};

const Manage = ({ initialData }) => {
    const [currentEntity, setCurrentEntity] = useState("roles");
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [formData, setFormData] = useState({});
    const [editingId, setEditingId] = useState(null);

    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["entities", currentEntity],
        queryFn: () => fetchEntities(currentEntity),
        staleTime: 1000 * 60 * 5,
    });

    const entities = [
        { value: "roles", label: "Roles" },
        { value: "users", label: "Users" },
        { value: "tahapans", label: "Project Tahapan" },
        { value: "permissions", label: "Permissions" },
        { value: "kategoris", label: "Dokumen Kategori" },
    ];

    const columns = {
        roles: [{ key: "name", label: "Name" }],
        users: [
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "role.name", label: "Role" },
        ],
        tahapans: [
            { key: "name", label: "Name" },
            { key: "description", label: "Description" },
        ],
        kategoris: [{ key: "name", label: "Name" }],
    };

    const fields = {
        roles: [{ key: "name", label: "Name", type: "text" }],
        users: [
            { key: "name", label: "Name", type: "text" },
            { key: "email", label: "Email", type: "email" },
            { key: "password", label: "Password", type: "password", required: false },
            {
                key: "role_id",
                label: "Role",
                type: "select",
                options: (initialData?.roles || []).map((role) => ({
                    value: role.id,
                    label: role.name,
                })),
            },
        ],
        tahapans: [
            { key: "name", label: "Name", type: "text" },
            { key: "description", label: "Description", type: "text" },
        ],
        kategoris: [{ key: "name", label: "Name", type: "text" }],
    };

    const mutation = useMutation({
        mutationFn: ({ method, url, payload }) => axios({ method, url, data: payload }),
        onSuccess: () => {
            queryClient.invalidateQueries(["entities", currentEntity]);
            closeModal();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`/manage/${currentEntity}/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(["entities", currentEntity]);
        },
    });

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setShowModal(true);
        if (mode === "add") {
            setFormData({});
        } else {
            setFormData({
                id: item.id,
                name: item.name,
                email: item.email,
                role_id: item.role ? item.role.id : item.role_id,
                password: "",
                description: item.description,
            });
            setEditingId(item.id);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({});
        setEditingId(null);
    };

    const handleFormChange = (key, value) => {
        setFormData({ ...formData, [key]: value });
    };

    const submitForm = async (e) => {
        e.preventDefault();
        const method = modalMode === "add" ? "post" : "put";
        const url = modalMode === "add" ? `/manage/${currentEntity}` : `/manage/${currentEntity}/${editingId}`;
        mutation.mutate({ method, url, payload: formData });
    };

    const deleteRecord = (id) => {
        confirmAlert(
            "Konfirmasi Hapus",
            "Apakah anda yakin ingin menghapus data ini?",
            () => deleteMutation.mutateAsync(id),
            "Ya",
            "Batal",
            "Data berhasil dihapus!",
            "Gagal menghapus data!"
        );
    };

    return (
        <>
            <Helmet>
                <title>Simlatek - Manage Dashboard</title>
            </Helmet>
            <Layout currentActive="database">
                <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300">
                    <div className="max-w-7xl mx-auto">
                        <header className="mb-6">
                            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                                Manage Dashboard
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Kelola entitas database dengan mudah dan efisien
                            </p>
                        </header>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <EntitySelector
                                    entities={entities}
                                    currentEntity={currentEntity}
                                    onChange={setCurrentEntity}
                                    className="w-full sm:w-64 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
                                />
                                {currentEntity !== "permissions" && (
                                    <button
                                        onClick={() => openModal("add")}
                                        className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 transition-colors duration-200 flex items-center gap-2 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-800"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Tambah Baru
                                    </button>
                                )}
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                                    <span className="ml-3 text-gray-600 dark:text-gray-400">
                                        Memuat data...
                                    </span>
                                </div>
                            ) : currentEntity === "permissions" ? (
                                <PermissionManager />
                            ) : (
                                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                    <GenericTable
                                        columns={columns[currentEntity]}
                                        data={data}
                                        onEdit={(item) => openModal("edit", item)}
                                        onDelete={deleteRecord}
                                    />
                                </div>
                            )}
                        </div>

                        <CrudModal
                            show={showModal}
                            onClose={closeModal}
                            title={`${modalMode === "add" ? "Tambah" : "Edit"} ${
                                entities.find((e) => e.value === currentEntity)?.label
                            }`}
                            formData={formData}
                            onChange={handleFormChange}
                            onSubmit={submitForm}
                            fields={fields[currentEntity]}
                        />
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default Manage;
