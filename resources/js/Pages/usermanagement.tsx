import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
import Layout from "../Layouts/layout";
import { confirmAlert } from "../Components/sweetAlert";

interface Role {
    id: number;
    name: string;
}

interface Skill {
    id: number;
    name: string;
    description: string | null;
    category: string;
    pivot?: {
        id: number;
        user_id: number;
        skill_id: number;
        level: string;
        experience_since: string | null;
        notes: string | null;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    pivot?: {
        id: number;
        user_id: number;
        skill_id: number;
        level: string;
        experience_since: string | null;
        notes: string | null;
    };
    skills?: Skill[];
}

interface Props {
    users: User[];
    roles: Role[];
    skills: Skill[];
}

export default function Index({
    users: initialUsers,
    roles,
    skills: initialSkills,
}: Props) {
    const [activeTab, setActiveTab] = useState<"users" | "skills">("users");
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
    const [isUserSkillModalOpen, setIsUserSkillModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [isViewUsersModalOpen, setIsViewUsersModalOpen] = useState(false);
    const [usersWithSkill, setUsersWithSkill] = useState<User[]>([]);
    const [selectedSkillForView, setSelectedSkillForView] =
        useState<Skill | null>(null);
    const [selectedUserSkill, setSelectedUserSkill] = useState<Skill | null>(
        null,
    );
    const [userForm, setUserForm] = useState({
        name: "",
        email: "",
        password: "",
        role_id: "",
    });
    const [skillForm, setSkillForm] = useState({
        name: "",
        description: "",
        category: "Development",
    });
    const [userSkillForm, setUserSkillForm] = useState({
        skill_id: "",
        level: "Beginner",
        experience_since: "",
        notes: "",
    });
    const [isViewingUserDetails, setIsViewingUserDetails] = useState(false);
    const [userDetails, setUserDetails] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [skills, setSkills] = useState<Skill[]>(initialSkills);
    const [alertMessage, setAlertMessage] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    const fetchUsers = async () => {
        try {
            const response = await axios.get("/users");
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            showAlert("Failed to fetch users", "error");
        }
    };

    const fetchSkills = async () => {
        try {
            const response = await axios.get("/skills");
            setSkills(response.data);
        } catch (error) {
            console.error("Error fetching skills:", error);
            showAlert("Failed to fetch skills", "error");
        }
    };

    const showAlert = (message: string, type: "success" | "error") => {
        setAlertMessage({ message, type });
        setTimeout(() => setAlertMessage(null), 3000);
    };

    const openUserModal = (user: User | null = null) => {
        if (user) {
            setUserForm({
                name: user.name,
                email: user.email,
                password: "",
                role_id: user.role.id.toString(),
            });
            setSelectedUser(user);
        } else {
            setUserForm({
                name: "",
                email: "",
                password: "",
                role_id: roles[0]?.id.toString() || "",
            });
            setSelectedUser(null);
        }
        setIsUserModalOpen(true);
    };

    const fetchUsersWithSkill = async (skillId: number) => {
        try {
            const response = await axios.get(`/skills/${skillId}/users`);
            setUsersWithSkill(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching users with skill:", error);
            showAlert("Failed to fetch users with this skill", "error");
            return [];
        }
    };

    const viewUsersWithSkill = async (skill: Skill) => {
        setSelectedSkillForView(skill);
        await fetchUsersWithSkill(skill.id);
        setIsViewUsersModalOpen(true);
    };

    const openSkillModal = (skill: Skill | null = null) => {
        if (skill) {
            setSkillForm({
                name: skill.name,
                description: skill.description || "",
                category: skill.category,
            });
            setSelectedSkill(skill);
        } else {
            setSkillForm({
                name: "",
                description: "",
                category: "Development",
            });
            setSelectedSkill(null);
        }
        setIsSkillModalOpen(true);
    };

    const openUserSkillModal = (
        user: User | null = null,
        userSkill: Skill | null = null,
    ) => {
        if (user) setSelectedUser(user);
        if (userSkill) {
            setUserSkillForm({
                skill_id: userSkill.id.toString(),
                level: userSkill.pivot?.level || "Beginner",
                experience_since: userSkill.pivot?.experience_since || "",
                notes: userSkill.pivot?.notes || "",
            });
            setSelectedUserSkill(userSkill);
        } else {
            const availableSkills = skills.filter(
                (skill) =>
                    !user?.skills?.some(
                        (userSkill) => userSkill.id === skill.id,
                    ),
            );
            setUserSkillForm({
                skill_id: availableSkills[0]?.id.toString() || "",
                level: "Beginner",
                experience_since: "",
                notes: "",
            });
            setSelectedUserSkill(null);
        }
        setIsUserSkillModalOpen(true);
    };

    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedUser) {
                await axios.put(`/users/${selectedUser.id}`, userForm);
                showAlert("User updated successfully", "success");
            } else {
                await axios.post("/users", userForm);
                showAlert("User created successfully", "success");
            }
            setIsUserModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error("Error saving user:", error);
            showAlert("Failed to save user", "error");
        }
    };

    const handleSkillSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedSkill) {
                await axios.put(`/skills/${selectedSkill.id}`, skillForm);
                showAlert("Skill updated successfully", "success");
            } else {
                await axios.post("/skills", skillForm);
                showAlert("Skill created successfully", "success");
            }
            setIsSkillModalOpen(false);
            fetchSkills();
        } catch (error) {
            console.error("Error saving skill:", error);
            showAlert("Failed to save skill", "error");
        }
    };

    const handleUserSkillSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (
                selectedUserSkill &&
                selectedUserSkill.pivot &&
                selectedUserSkill.pivot.id
            ) {
                await axios.put(
                    `/user-skills/${selectedUserSkill.pivot.id}`,
                    userSkillForm,
                );
                showAlert("User skill updated successfully", "success");
            } else if (selectedUser && !selectedUserSkill) {
                await axios.post(
                    `/users/${selectedUser.id}/skills`,
                    userSkillForm,
                );
                showAlert("User skill added successfully", "success");
            }
            setIsUserSkillModalOpen(false);
            if (userDetails) viewUserDetails(userDetails.id);
        } catch (error) {
            console.error("Error saving user skill:", error);
            showAlert("Failed to save user skill", "error");
        }
    };

    const deleteUser = (userId: number) => {
        confirmAlert(
            "Konfirmasi Hapus",
            "Apakah anda yakin ingin menghapus user ini?",
            async () => {
                try {
                    await axios.delete(`/users/${userId}`);
                    showAlert("User deleted successfully", "success");
                    fetchUsers();
                    return true;
                } catch (error) {
                    console.error("Error deleting user:", error);
                    showAlert("Failed to delete user", "error");
                    return false;
                }
            },
            "Ya",
            "Batal",
            "Data berhasil dihapus!",
            "Gagal menghapus data!",
        );
    };

    const deleteSkill = (skillId: number) => {
        confirmAlert(
            "Konfirmasi Hapus",
            "Apakah anda yakin ingin menghapus skill ini?",
            async () => {
                try {
                    await axios.delete(`/skills/${skillId}`);
                    showAlert("Skill deleted successfully", "success");
                    fetchSkills();
                    return true;
                } catch (error) {
                    console.error("Error deleting skill:", error);
                    showAlert("Failed to delete skill", "error");
                    return false;
                }
            },
            "Ya",
            "Batal",
            "Data berhasil dihapus!",
            "Gagal menghapus data!",
        );
    };

    const deleteUserSkill = (pivotId: number | undefined) => {
        if (!pivotId) {
            showAlert("Failed to delete user skill: ID is missing", "error");
            return;
        }
        confirmAlert(
            "Konfirmasi Hapus",
            "Apakah anda yakin ingin menghapus skill user ini?",
            async () => {
                try {
                    await axios.delete(`/user-skills/${pivotId}`);
                    showAlert("User skill deleted successfully", "success");
                    if (userDetails) viewUserDetails(userDetails.id);
                    return true;
                } catch (error) {
                    console.error("Error deleting user skill:", error);
                    showAlert("Failed to delete user skill", "error");
                    return false;
                }
            },
            "Ya",
            "Batal",
            "Data berhasil dihapus!",
            "Gagal menghapus data!",
        );
    };

    const viewUserDetails = async (userId: number) => {
        try {
            const response = await axios.get(`/users/${userId}`);
            setUserDetails(response.data.user);
            setIsViewingUserDetails(true);
        } catch (error) {
            console.error("Error fetching user details:", error);
            showAlert("Failed to fetch user details", "error");
        }
    };

    return (
        <>
            <Head title="Simlatek - User Management" />
            <Layout currentActive="userskill">
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto">
                        <header className="mb-10">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white border-b-2 border-cyan-500 pb-3">
                                User & Skill Management
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                Kelola pengguna dan keahlian dengan antarmuka
                                yang elegan dan efisien
                            </p>
                        </header>

                        {alertMessage && (
                            <div
                                className={`mb-6 p-4 rounded-lg shadow-md ${
                                    alertMessage.type === "success"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                }`}
                            >
                                {alertMessage.message}
                            </div>
                        )}

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-200">
                            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                                <button
                                    className={`py-2 px-6 font-medium ${
                                        activeTab === "users"
                                            ? "border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                                            : "text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
                                    }`}
                                    onClick={() => setActiveTab("users")}
                                >
                                    Manage Users
                                </button>
                                <button
                                    className={`py-2 px-6 font-medium ${
                                        activeTab === "skills"
                                            ? "border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                                            : "text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
                                    }`}
                                    onClick={() => setActiveTab("skills")}
                                >
                                    Manage Skills
                                </button>
                            </div>

                            {isViewingUserDetails ? (
                                <div>
                                    <button
                                        onClick={() =>
                                            setIsViewingUserDetails(false)
                                        }
                                        className="mb-6 bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-200"
                                    >
                                        Back
                                    </button>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                        User Details: {userDetails?.name}
                                    </h2>
                                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
                                        <p className="text-gray-800 dark:text-gray-200">
                                            <strong>Name:</strong>{" "}
                                            {userDetails?.name}
                                        </p>
                                        <p className="text-gray-800 dark:text-gray-200">
                                            <strong>Email:</strong>{" "}
                                            {userDetails?.email}
                                        </p>
                                        <p className="text-gray-800 dark:text-gray-200">
                                            <strong>Role:</strong>{" "}
                                            {userDetails?.role.name}
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                User Skills
                                            </h3>
                                            <button
                                                onClick={() =>
                                                    openUserSkillModal(
                                                        userDetails,
                                                    )
                                                }
                                                className="bg-cyan-600 dark:bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-600 transition-all duration-200"
                                            >
                                                Add Skill
                                            </button>
                                        </div>
                                        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-gray-700">
                                                    <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-medium">
                                                        Skill Name
                                                    </th>
                                                    <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-medium">
                                                        Category
                                                    </th>
                                                    <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-medium">
                                                        Level
                                                    </th>
                                                    <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-medium">
                                                        Experience Since
                                                    </th>
                                                    <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-medium">
                                                        Notes
                                                    </th>
                                                    <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-medium">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {userDetails?.skills &&
                                                userDetails.skills.length >
                                                    0 ? (
                                                    userDetails.skills.map(
                                                        (userSkill) => (
                                                            <tr
                                                                key={
                                                                    userSkill.id
                                                                }
                                                                className="border-b border-gray-200 dark:border-gray-700"
                                                            >
                                                                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                                                                    {
                                                                        userSkill.name
                                                                    }
                                                                </td>
                                                                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                                                                    {
                                                                        userSkill.category
                                                                    }
                                                                </td>
                                                                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                                                                    {
                                                                        userSkill
                                                                            .pivot
                                                                            ?.level
                                                                    }
                                                                </td>
                                                                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                                                                    {userSkill
                                                                        .pivot
                                                                        ?.experience_since ||
                                                                        "-"}
                                                                </td>
                                                                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                                                                    {userSkill
                                                                        .pivot
                                                                        ?.notes ||
                                                                        "-"}
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <button
                                                                        onClick={() =>
                                                                            openUserSkillModal(
                                                                                userDetails,
                                                                                userSkill,
                                                                            )
                                                                        }
                                                                        className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-500 mr-3"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            deleteUserSkill(
                                                                                userSkill
                                                                                    .pivot
                                                                                    ?.id,
                                                                            )
                                                                        }
                                                                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-500"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan={6}
                                                            className="py-4 px-4 text-center text-gray-600 dark:text-gray-400"
                                                        >
                                                            No skills found for
                                                            this user.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {activeTab === "users" && (
                                        <div>
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                    Users
                                                </h2>
                                                <button
                                                    onClick={() =>
                                                        openUserModal()
                                                    }
                                                    className="bg-cyan-600 dark:bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-600 transition-all duration-200"
                                                >
                                                    Add User
                                                </button>
                                            </div>
                                            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                                        <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-medium">
                                                            Name
                                                        </th>
                                                        <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-medium">
                                                            Email
                                                        </th>
                                                        <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-medium">
                                                            Role
                                                        </th>
                                                        <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-medium">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {users.map((user) => (
                                                        <tr
                                                            key={user.id}
                                                            className="border-b border-gray-200 dark:border-gray-700"
                                                        >
                                                            <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                                                                {user.name}
                                                            </td>
                                                            <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                                                                {user.email}
                                                            </td>
                                                            <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                                                                {user.role.name}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <button
                                                                    onClick={() =>
                                                                        viewUserDetails(
                                                                            user.id,
                                                                        )
                                                                    }
                                                                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-500 mr-3"
                                                                >
                                                                    View
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        openUserModal(
                                                                            user,
                                                                        )
                                                                    }
                                                                    className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-500 mr-3"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        deleteUser(
                                                                            user.id,
                                                                        )
                                                                    }
                                                                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-500"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {activeTab === "skills" && (
                                        <div>
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                    Skills
                                                </h2>
                                                <button
                                                    onClick={() =>
                                                        openSkillModal()
                                                    }
                                                    className="bg-cyan-600 dark:bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-600 transition-all duration-200"
                                                >
                                                    Add Skill
                                                </button>
                                            </div>
                                            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                                        <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-medium">
                                                            Name
                                                        </th>
                                                        <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-medium">
                                                            Category
                                                        </th>
                                                        <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-medium">
                                                            Description
                                                        </th>
                                                        <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-medium">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {skills.map((skill) => (
                                                        <tr
                                                            key={skill.id}
                                                            className="border-b border-gray-200 dark:border-gray-700"
                                                        >
                                                            <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                                                                {skill.name}
                                                            </td>
                                                            <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                                                                {skill.category}
                                                            </td>
                                                            <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                                                                {skill.description ||
                                                                    "-"}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <button
                                                                    onClick={() =>
                                                                        viewUsersWithSkill(
                                                                            skill,
                                                                        )
                                                                    }
                                                                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-500 mr-3"
                                                                >
                                                                    View
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        openSkillModal(
                                                                            skill,
                                                                        )
                                                                    }
                                                                    className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-500 mr-3"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        deleteSkill(
                                                                            skill.id,
                                                                        )
                                                                    }
                                                                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-500"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* User Modal */}
                    {isUserModalOpen && (
                        <>
                            <div
                                className="fixed inset-0 bg-black opacity-50 z-40"
                                onClick={() => setIsUserModalOpen(false)}
                            ></div>
                            <div className="fixed inset-0 z-50 overflow-y-auto">
                                <div className="flex min-h-full items-center justify-center p-4">
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                            {selectedUser
                                                ? "Edit User"
                                                : "Add User"}
                                        </h2>
                                        <form onSubmit={handleUserSubmit}>
                                            <div className="mb-4">
                                                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                                    Name
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
                                                    value={userForm.name}
                                                    onChange={(e) =>
                                                        setUserForm({
                                                            ...userForm,
                                                            name: e.target
                                                                .value,
                                                        })
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
                                                    value={userForm.email}
                                                    onChange={(e) =>
                                                        setUserForm({
                                                            ...userForm,
                                                            email: e.target
                                                                .value,
                                                        })
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                                    Password{" "}
                                                    {selectedUser &&
                                                        "(Leave blank to keep current)"}
                                                </label>
                                                <input
                                                    type="password"
                                                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
                                                    value={userForm.password}
                                                    onChange={(e) =>
                                                        setUserForm({
                                                            ...userForm,
                                                            password:
                                                                e.target.value,
                                                        })
                                                    }
                                                    required={!selectedUser}
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                                    Role
                                                </label>
                                                <select
                                                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
                                                    value={userForm.role_id}
                                                    onChange={(e) =>
                                                        setUserForm({
                                                            ...userForm,
                                                            role_id:
                                                                e.target.value,
                                                        })
                                                    }
                                                    required
                                                >
                                                    {roles.map((role) => (
                                                        <option
                                                            key={role.id}
                                                            value={role.id}
                                                        >
                                                            {role.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex justify-end gap-3 mt-6">
                                                <button
                                                    type="button"
                                                    className="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-200"
                                                    onClick={() =>
                                                        setIsUserModalOpen(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="bg-cyan-600 dark:bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-600 transition-all duration-200"
                                                >
                                                    {selectedUser
                                                        ? "Update"
                                                        : "Create"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Skill Modal */}
                    {isSkillModalOpen && (
                        <>
                            <div
                                className="fixed inset-0 bg-black opacity-50 z-40"
                                onClick={() => setIsSkillModalOpen(false)}
                            ></div>
                            <div className="fixed inset-0 z-50 overflow-y-auto">
                                <div className="flex min-h-full items-center justify-center p-4">
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                            {selectedSkill
                                                ? "Edit Skill"
                                                : "Add Skill"}
                                        </h2>
                                        <form onSubmit={handleSkillSubmit}>
                                            <div className="mb-4">
                                                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                                    Name
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
                                                    value={skillForm.name}
                                                    onChange={(e) =>
                                                        setSkillForm({
                                                            ...skillForm,
                                                            name: e.target
                                                                .value,
                                                        })
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                                    Category
                                                </label>
                                                <select
                                                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
                                                    value={skillForm.category}
                                                    onChange={(e) =>
                                                        setSkillForm({
                                                            ...skillForm,
                                                            category:
                                                                e.target.value,
                                                        })
                                                    }
                                                    required
                                                >
                                                    <option value="Development">
                                                        Development
                                                    </option>
                                                    <option value="Tester">
                                                        Tester
                                                    </option>
                                                    <option value="Management">
                                                        Management
                                                    </option>
                                                    <option value="Other">
                                                        Other
                                                    </option>
                                                </select>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
                                                    value={
                                                        skillForm.description
                                                    }
                                                    onChange={(e) =>
                                                        setSkillForm({
                                                            ...skillForm,
                                                            description:
                                                                e.target.value,
                                                        })
                                                    }
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="flex justify-end gap-3 mt-6">
                                                <button
                                                    type="button"
                                                    className="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-200"
                                                    onClick={() =>
                                                        setIsSkillModalOpen(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="bg-cyan-600 dark:bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-600 transition-all duration-200"
                                                >
                                                    {selectedSkill
                                                        ? "Update"
                                                        : "Create"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* User Skill Modal */}
                    {isUserSkillModalOpen && (
                        <>
                            <div
                                className="fixed inset-0 bg-black opacity-50 z-40"
                                onClick={() => setIsUserSkillModalOpen(false)}
                            ></div>
                            <div className="fixed inset-0 z-50 overflow-y-auto">
                                <div className="flex min-h-full items-center justify-center p-4">
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                            {selectedUserSkill
                                                ? "Edit User Skill"
                                                : "Add User Skill"}
                                        </h2>
                                        <form onSubmit={handleUserSkillSubmit}>
                                            {!selectedUserSkill && (
                                                <div className="mb-4">
                                                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                                        Skill
                                                    </label>
                                                    <select
                                                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
                                                        value={
                                                            userSkillForm.skill_id
                                                        }
                                                        onChange={(e) =>
                                                            setUserSkillForm({
                                                                ...userSkillForm,
                                                                skill_id:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        required
                                                    >
                                                        {skills
                                                            .filter(
                                                                (skill) =>
                                                                    !userDetails?.skills?.some(
                                                                        (
                                                                            userSkill,
                                                                        ) =>
                                                                            userSkill.id ===
                                                                            skill.id,
                                                                    ),
                                                            )
                                                            .map((skill) => (
                                                                <option
                                                                    key={
                                                                        skill.id
                                                                    }
                                                                    value={
                                                                        skill.id
                                                                    }
                                                                >
                                                                    {skill.name}{" "}
                                                                    (
                                                                    {
                                                                        skill.category
                                                                    }
                                                                    )
                                                                </option>
                                                            ))}
                                                    </select>
                                                </div>
                                            )}
                                            <div className="mb-4">
                                                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                                    Level
                                                </label>
                                                <select
                                                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
                                                    value={userSkillForm.level}
                                                    onChange={(e) =>
                                                        setUserSkillForm({
                                                            ...userSkillForm,
                                                            level: e.target
                                                                .value,
                                                        })
                                                    }
                                                    required
                                                >
                                                    <option value="Beginner">
                                                        Beginner
                                                    </option>
                                                    <option value="Intermediate">
                                                        Intermediate
                                                    </option>
                                                    <option value="Advanced">
                                                        Advanced
                                                    </option>
                                                    <option value="Expert">
                                                        Expert
                                                    </option>
                                                </select>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                                    Experience Since (Year)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1900"
                                                    max={new Date().getFullYear()}
                                                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
                                                    value={
                                                        userSkillForm.experience_since
                                                    }
                                                    onChange={(e) =>
                                                        setUserSkillForm({
                                                            ...userSkillForm,
                                                            experience_since:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="e.g. 2020"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                                    Notes
                                                </label>
                                                <textarea
                                                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
                                                    value={userSkillForm.notes}
                                                    onChange={(e) =>
                                                        setUserSkillForm({
                                                            ...userSkillForm,
                                                            notes: e.target
                                                                .value,
                                                        })
                                                    }
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="flex justify-end gap-3 mt-6">
                                                <button
                                                    type="button"
                                                    className="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-200"
                                                    onClick={() =>
                                                        setIsUserSkillModalOpen(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="bg-cyan-600 dark:bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-600 transition-all duration-200"
                                                >
                                                    {selectedUserSkill
                                                        ? "Update"
                                                        : "Add"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    {isViewUsersModalOpen && (
                        <>
                            <div
                                className="fixed inset-0 bg-black opacity-50 z-40"
                                onClick={() => setIsViewUsersModalOpen(false)}
                            ></div>
                            <div className="fixed inset-0 z-50 overflow-y-auto">
                                <div className="flex min-h-full items-center justify-center p-4">
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                            Users with Skill:{" "}
                                            {selectedSkillForView?.name}
                                        </h2>
                                        <div className="max-h-96 overflow-y-auto">
                                            {usersWithSkill.length > 0 ? (
                                                <table className="min-w-full">
                                                    <thead>
                                                        <tr className="bg-gray-50 dark:bg-gray-700">
                                                            <th className="py-2 px-4 text-left text-gray-700 dark:text-gray-200 font-medium">
                                                                Name
                                                            </th>
                                                            <th className="py-2 px-4 text-left text-gray-700 dark:text-gray-200 font-medium">
                                                                Level
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {usersWithSkill.map(
                                                            (user) => (
                                                                <tr
                                                                    key={
                                                                        user.id
                                                                    }
                                                                    className="border-b border-gray-200 dark:border-gray-700"
                                                                >
                                                                    <td className="py-2 px-4 text-gray-800 dark:text-gray-200">
                                                                        {
                                                                            user.name
                                                                        }
                                                                    </td>
                                                                    <td className="py-2 px-4 text-gray-800 dark:text-gray-200">
                                                                        {user
                                                                            .pivot
                                                                            ?.level ||
                                                                            "-"}
                                                                    </td>
                                                                </tr>
                                                            ),
                                                        )}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                                                    No users found with this
                                                    skill.
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex justify-end mt-6">
                                            <button
                                                type="button"
                                                className="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-200"
                                                onClick={() =>
                                                    setIsViewUsersModalOpen(
                                                        false,
                                                    )
                                                }
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Layout>
        </>
    );
}
