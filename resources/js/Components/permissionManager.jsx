import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Tambahkan useQueryClient
import axios from "axios";
import { confirmAlert } from "./sweetAlert";

const fetchRoles = async () => {
    const response = await axios.get("/manage/roles");
    return response.data.data;
};

const fetchTahapans = async () => {
    const response = await axios.get("/manage/tahapans");
    return response.data.data;
};

const fetchPermissions = async () => {
    const response = await axios.get("/manage/permissions");
    return response.data.data;
};

const PermissionManager = () => {
    const queryClient = useQueryClient(); // Inisialisasi QueryClient untuk mengelola cache

    const { data: roles, isLoading: rolesLoading } = useQuery({
        queryKey: ["roles"],
        queryFn: fetchRoles,
        staleTime: 1000 * 60 * 5, // 5 menit
    });

    const { data: tahapans, isLoading: tahapansLoading } = useQuery({
        queryKey: ["tahapans"],
        queryFn: fetchTahapans,
        staleTime: 1000 * 60 * 5, // 5 menit
    });

    const { data: permissions, isLoading: permissionsLoading } = useQuery({
        queryKey: ["permissions"],
        queryFn: fetchPermissions,
        staleTime: 0, // Data dianggap stale segera setelah di-fetch
    });

    const [permissionState, setPermissionState] = useState({});

    useEffect(() => {
        if (permissions) {
            const initialState = {};
            permissions.forEach((perm) => {
                if (!initialState[perm.role_id]) {
                    initialState[perm.role_id] = [];
                }
                initialState[perm.role_id].push(perm.projecttahapan_id);
            });
            setPermissionState(initialState);
        }
    }, [permissions]);

    const handleCheckboxChange = (roleId, tahapanId) => {
        setPermissionState((prevState) => {
            const newState = { ...prevState };
            if (!newState[roleId]) {
                newState[roleId] = [];
            }
            if (newState[roleId].includes(tahapanId)) {
                newState[roleId] = newState[roleId].filter(
                    (id) => id !== tahapanId
                );
            } else {
                newState[roleId].push(tahapanId);
            }
            return newState;
        });
    };

    const mutation = useMutation({
        mutationFn: (payload) =>
            axios.post("/manage/permissions/batch-update", payload),
        onSuccess: () => {
            // Invalidasi cache setelah mutasi berhasil
            queryClient.invalidateQueries(["permissions"]);
        },
        onError: (error) => {
            console.error("Mutation error:", error);
        },
    });

    const handleSave = () => {
        confirmAlert(
            "Konfirmasi!",
            "Apakah Anda yakin ingin menyimpan perubahan?",
            () =>
                mutation
                    .mutateAsync({ permissions: permissionState })
                    .then(() => {
                        // Opsional: Update state lokal langsung untuk UX instan
                        queryClient.setQueryData(["permissions"], (oldData) => {
                            const newPermissions = [];
                            Object.entries(permissionState).forEach(
                                ([roleId, tahapanIds]) => {
                                    tahapanIds.forEach((tahapanId) => {
                                        newPermissions.push({
                                            role_id: parseInt(roleId),
                                            projecttahapan_id: tahapanId,
                                        });
                                    });
                                }
                            );
                            return newPermissions;
                        });
                    }),
            "Ya, Simpan",
            "Batal",
            "Perubahan berhasil disimpan!",
            "Gagal menyimpan perubahan!"
        );
    };

    if (rolesLoading || tahapansLoading || permissionsLoading) {
        return <div className="text-center py-4">Loading...</div>;
    }

    return (
        <div className="p-4 bg-white dark:bg-black rounded-lg shadow-md dark:shadow-neon">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                Kelola Permission
            </h2>
            <div className="overflow-x-auto rounded-lg">
                <table className="w-full border-collapse  min-w-max">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-neon">
                            <th className="p-3 text-left text-gray-700 dark:text-gray-100">
                                Role
                            </th>
                            {tahapans.map((tahapan) => (
                                <th
                                    key={tahapan.id}
                                    className="p-3 text-left text-gray-700 dark:text-gray-100"
                                >
                                    {tahapan.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((role, index) => (
                            <tr
                                key={role.id}
                                className={`border-b border-gray-300 dark:border-neon ${
                                    index % 2 === 0
                                        ? "bg-gray-50 dark:bg-black"
                                        : "bg-white dark:bg-gray-900"
                                }`}
                            >
                                <td className="p-3 text-gray-800 dark:text-gray-100">
                                    {role.name}
                                </td>
                                {tahapans.map((tahapan) => (
                                    <td
                                        key={tahapan.id}
                                        className="p-3 text-center"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={
                                                permissionState[
                                                    role.id
                                                ]?.includes(tahapan.id) || false
                                            }
                                            onChange={() =>
                                                handleCheckboxChange(
                                                    role.id,
                                                    tahapan.id
                                                )
                                            }
                                            className="form-checkbox h-5 w-5 text-blue-600 dark:text-gray-100 focus:ring-neon transition"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button
                onClick={handleSave}
                className="mt-4 px-6 py-2 rounded text-white transition bg-blue-500 dark:bg-neon hover:bg-blue-600 dark:hover:shadow-neon-glow"
            >
                Simpan Perubahan
            </button>
        </div>
    );
};

export default PermissionManager;
