import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { confirmAlert } from "./sweetAlert";
import { Role, Tahapan, Permission, PermissionState  } from "../types";


// Fungsi fetch dengan tipe return
const fetchRoles = async (): Promise<Role[]> => {
    const response = await axios.get<{ data: Role[] }>("/manage/roles");
    return response.data.data;
};

const fetchTahapans = async (): Promise<Tahapan[]> => {
    const response = await axios.get<{ data: Tahapan[] }>("/manage/tahapans");
    return response.data.data;
};

const fetchPermissions = async (): Promise<Permission[]> => {
    const response = await axios.get<{ data: Permission[] }>(
        "/manage/permissions"
    );
    return response.data.data;
};

const PermissionManager: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: roles, isLoading: rolesLoading } = useQuery<Role[]>({
        queryKey: ["roles"],
        queryFn: fetchRoles,
        staleTime: 1000 * 60 * 5, // 5 menit
    });

    const { data: tahapans, isLoading: tahapansLoading } = useQuery<Tahapan[]>({
        queryKey: ["tahapans"],
        queryFn: fetchTahapans,
        staleTime: 1000 * 60 * 5, // 5 menit
    });

    const { data: permissions, isLoading: permissionsLoading } = useQuery<
        Permission[]
    >({
        queryKey: ["permissions"],
        queryFn: fetchPermissions,
        staleTime: 0,
    });

    const [permissionState, setPermissionState] = useState<PermissionState>({});

    useEffect(() => {
        if (permissions) {
            const initialState: PermissionState = {};
            permissions.forEach((perm) => {
                if (!initialState[perm.role_id]) {
                    initialState[perm.role_id] = [];
                }
                initialState[perm.role_id].push(perm.permintaantahapan_id);
            });
            setPermissionState(initialState);
        }
    }, [permissions]);

    const handleCheckboxChange = (roleId: number, tahapanId: number): void => {
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
        mutationFn: (payload: { permissions: PermissionState }) =>
            axios.post("/manage/permissions/batch-update", payload),
        onSuccess: () => {
            // Perbaikan error pertama: gunakan tipe yang lebih spesifik
            queryClient.invalidateQueries({ queryKey: ["permissions"] });
        },
        onError: (error: unknown) => {
            console.error("Mutation error:", error);
        },
    });

    const handleSave = (): void => {
        confirmAlert(
            "Konfirmasi!",
            "Apakah Anda yakin ingin menyimpan perubahan?",
            () =>
                mutation
                    .mutateAsync({ permissions: permissionState })
                    .then(() => {
                        queryClient.setQueryData<Permission[]>(
                            ["permissions"],
                            (oldData) => {
                                const newPermissions: Permission[] = [];
                                Object.entries(permissionState).forEach(
                                    ([roleId, tahapanIds]) => {
                                        // Perbaikan error kedua: tambahkan tipe untuk tahapanId
                                        tahapanIds.forEach(
                                            (tahapanId: number) => {
                                                newPermissions.push({
                                                    role_id: parseInt(roleId),
                                                    permintaantahapan_id:
                                                        tahapanId,
                                                });
                                            }
                                        );
                                    }
                                );
                                return newPermissions;
                            }
                        );
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
                <table className="w-full border-collapse min-w-max">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-neon">
                            <th className="p-3 text-left text-gray-700 dark:text-gray-100">
                                Role
                            </th>
                            {tahapans?.map((tahapan) => (
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
                        {roles?.map((role, index) => (
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
                                {tahapans?.map((tahapan) => (
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
