import React, { useState, useEffect, FormEvent } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface LoginResponse {
    success: boolean;
}

interface ErrorResponse {
    response?: {
        data?: {
            message?: string;
        };
    };
}

export default function Login() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [isExiting, setIsExiting] = useState<boolean>(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [isEmailFocused, setIsEmailFocused] = useState<boolean>(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setIsDarkMode(savedTheme === "dark");
        } else {
            // Set based on system preference
            const prefersDark = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;
            setIsDarkMode(prefersDark);
            localStorage.setItem("theme", prefersDark ? "dark" : "light");
        }
    }, []);

    const toggleTheme = (): void => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        localStorage.setItem("theme", newTheme ? "dark" : "light");
    };

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post<LoginResponse>("/login", {
                email,
                password,
            });

            if (response.data.success) {
                setIsExiting(true);
                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 1000);
            }
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            setError(
                error.response?.data?.message ||
                    "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                staggerChildren: 0.07,
                ease: [0.22, 1, 0.36, 1],
            },
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            y: 10,
            transition: {
                duration: 0.4,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    const shimmerEffect =
        "animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent";

    // Modern, elegant styling with floating labels
    const bgStyle: string = isDarkMode
        ? "bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900"
        : "bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200";

    const cardStyle: string = isDarkMode
        ? "bg-gray-900/20 backdrop-blur-xl text-white shadow-2xl border border-gray-700/20"
        : "bg-white/20 backdrop-blur-xl text-gray-900 shadow-xl border border-gray-200/20";

    const titleGradient: string = isDarkMode
        ? "bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"
        : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600";

    const inputStyle: string = isDarkMode
        ? "w-full bg-gray-700/30 text-white border-b-2 border-gray-500 focus:border-indigo-400 pt-6 pb-2 px-4 rounded-t-lg peer focus:outline-none"
        : "w-full bg-white/30 text-gray-900 border-b-2 border-gray-300 focus:border-indigo-500 pt-6 pb-2 px-4 rounded-t-lg peer focus:outline-none";

    const labelStyle: string = isDarkMode
        ? "absolute left-4 transition-all duration-300 pointer-events-none text-gray-400 peer-focus:text-indigo-400"
        : "absolute left-4 transition-all duration-300 pointer-events-none text-gray-500 peer-focus:text-indigo-500";

    const floatingLabelStyle = (isFocused: boolean, value: string) => {
        const baseStyle = labelStyle;
        if (isFocused || value) {
            return `${baseStyle} text-xs top-2`;
        }
        return `${baseStyle} top-4`;
    };

    const buttonStyle: string = isDarkMode
        ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/20"
        : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-600/20";

    const errorStyle: string = isDarkMode
        ? "bg-red-900/30 border-red-500/50 text-red-300"
        : "bg-red-100/70 border-red-400/50 text-red-600";

    const toggleThumbStyle: string = isDarkMode
        ? "translate-x-6 bg-white"
        : "translate-x-0 bg-white";

    const toggleTrackStyle: string = isDarkMode
        ? "bg-indigo-600"
        : "bg-gray-200";

    return (
        <AnimatePresence>
            <Head title="Simlatek - Login" />
            <div
                className={`min-h-screen flex items-center justify-center ${bgStyle} p-4`}
            >
                <motion.div
                    className={`max-w-md w-full p-8 ${cardStyle} rounded-2xl relative overflow-hidden`}
                    variants={containerVariants}
                    initial="hidden"
                    animate={isExiting ? "exit" : "visible"}
                    exit="exit"
                >
                    {/* Decorative elements */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl"></div>

                    <motion.div
                        className="flex justify-center mb-8"
                        variants={itemVariants}
                    >
                        <img
                            src="/images/logosidoarjo.png"
                            alt="Logo Sidoarjo"
                            className="h-20 w-auto drop-shadow-md"
                        />
                    </motion.div>

                    <motion.div
                        className="text-center mb-8"
                        variants={itemVariants}
                    >
                        <h2
                            className={`text-3xl font-bold text-transparent bg-clip-text ${titleGradient}`}
                        >
                            Sign In
                        </h2>
                        <p
                            className={`mt-2 text-lg ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                        >
                            Sistem Informasi Manajemen
                        </p>
                        <p
                            className={`text-lg ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                        >
                            Layanan Teknologi
                        </p>
                    </motion.div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`mb-6 p-4 ${errorStyle} rounded-lg border text-sm flex items-center`}
                        >
                            <svg
                                className="w-5 h-5 mr-2 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                            {error}
                        </motion.div>
                    )}

                    <motion.form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div
                            variants={itemVariants}
                            className="relative"
                        >
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => setEmail(e.target.value)}
                                onFocus={() => setIsEmailFocused(true)}
                                onBlur={() => setIsEmailFocused(false)}
                                className={`${inputStyle}`}
                                required
                            />
                            <label
                                htmlFor="email"
                                className={floatingLabelStyle(
                                    isEmailFocused,
                                    email
                                )}
                            >
                                Email
                            </label>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="relative"
                        >
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => setPassword(e.target.value)}
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => setIsPasswordFocused(false)}
                                className={`${inputStyle}`}
                                required
                            />
                            <label
                                htmlFor="password"
                                className={floatingLabelStyle(
                                    isPasswordFocused,
                                    password
                                )}
                            >
                                Password
                            </label>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <button
                                type="submit"
                                className={`w-full ${buttonStyle} font-medium py-4 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-500 disabled:opacity-70 text-base relative overflow-hidden group`}
                                disabled={loading}
                            >
                                <span className="relative z-10 flex items-center justify-center">
                                    {loading && (
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                    )}
                                    {loading ? "Signing in..." : "Sign In"}
                                </span>
                                <span
                                    className={`absolute inset-0 ${shimmerEffect} skew-x-12 transition-all duration-1000 -translate-x-full group-hover:translate-x-full ease-out`}
                                ></span>
                            </button>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="flex justify-between items-center pt-2"
                        >
                            <div className="flex items-center space-x-3">
                                <span
                                    className={
                                        isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                    }
                                >
                                    {isDarkMode ? "Dark" : "Light"}
                                </span>
                                <button
                                    type="button"
                                    onClick={toggleTheme}
                                    className={`w-12 h-6 rounded-full relative ${toggleTrackStyle} transition-colors duration-300 focus:outline-none`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-300 ${toggleThumbStyle}`}
                                    >
                                        {isDarkMode ? (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 m-0.5 text-indigo-600"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                            </svg>
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 m-0.5 text-amber-500"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
