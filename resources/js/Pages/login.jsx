import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [glitchText, setGlitchText] = useState("LOGIN");
    const [isExiting, setIsExiting] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Initialize theme from localStorage on component mount
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setIsDarkMode(savedTheme === "dark");
        }
    }, []);

    // Effect for glitching text animation - only in dark mode
    useEffect(() => {
        let glitchInterval;

        if (isDarkMode) {
            glitchInterval = setInterval(() => {
                const characters =
                    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";

                const generateGlitchText = () => {
                    const randomIndex = Math.floor(Math.random() * 5);
                    const randomChar = characters.charAt(
                        Math.floor(Math.random() * characters.length)
                    );
                    let newText = "LOGIN".split("");
                    newText[randomIndex] = randomChar;
                    return newText.join("");
                };

                setGlitchText(generateGlitchText());

                setTimeout(() => {
                    setGlitchText(generateGlitchText());
                    setTimeout(() => {
                        setGlitchText("LOGIN");
                    }, 100);
                }, 100);
            }, 2000);
        } else {
            setGlitchText("Login");
        }

        return () => clearInterval(glitchInterval);
    }, [isDarkMode]);

    // Toggle theme and save to localStorage
    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        localStorage.setItem("theme", newTheme ? "dark" : "light");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post("/login", {
                email,
                password,
            });

            if (response.data.success) {
                setIsExiting(true);
                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 1000);
            }
        } catch (err) {
            setError(
                err.response?.data?.message || "Login gagal. Silakan coba lagi."
            );
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 1,
                staggerChildren: 0.1,
            },
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            transition: {
                duration: 0.5,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
            },
        },
    };

    // Light mode (Elegant) / Dark mode (Cyberpunk) conditional styling
    const bgStyle = isDarkMode
        ? "bg-black bg-gradient-to-br from-gray-900 to-black"
        : "bg-gray-50 bg-gradient-to-br from-white to-gray-100";

    const cardStyle = isDarkMode
        ? "bg-gray-900 bg-opacity-80 border-cyan-500 shadow-cyan-500/20"
        : "bg-white border-indigo-200 shadow-lg";

    const gridBgStyle = isDarkMode
        ? "opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDBmZmZmIiBzdHJva2Utd2lkdGg9IjAuNSI+PHBhdGggZD0iTTAgMGgxMDB2MTAwSDB6Ii8+PC9nPjwvc3ZnPg==')]"
        : "opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzMzMzMzIiBzdHJva2Utd2lkdGg9IjAuMiI+PHBhdGggZD0iTTAgMGgxMDB2MTAwSDB6Ii8+PC9nPjwvc3ZnPg==')]";

    const titleGradient = isDarkMode
        ? "bg-gradient-to-r from-cyan-400 to-purple-500"
        : "bg-gradient-to-r from-indigo-500 to-blue-600";

    const titleFont = isDarkMode ? "font-mono" : "font-sans";
    const bodyFont = isDarkMode ? "font-mono" : "font-sans";

    const titleTextColor = isDarkMode ? "text-cyan-400" : "text-indigo-700";
    const subtitleTextColor = isDarkMode ? "text-cyan-300" : "text-indigo-600";

    const inputStyle = isDarkMode
        ? "bg-gray-800 bg-opacity-50 text-cyan-100 border-cyan-500 focus:border-purple-500 font-mono"
        : "bg-gray-50 text-gray-800 border-indigo-200 focus:border-indigo-500 font-sans";

    const labelStyle = isDarkMode
        ? "text-cyan-300 font-mono tracking-wide"
        : "text-indigo-600 font-sans";

    const labelPrefix = isDarkMode ? "> " : "";

    const buttonStyle = isDarkMode
        ? "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 font-mono tracking-wider"
        : "bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 font-sans";

    const buttonText = isDarkMode
        ? (loading ? "AUTHENTICATING..." : "AUTHENTICATE")
        : (loading ? "Memproses..." : "Masuk");

    const footerTextStyle = isDarkMode ? "text-cyan-300 font-mono" : "text-indigo-500 font-sans";

    const logoContainerStyle = isDarkMode
        ? "bg-gray-800 border-cyan-400"
        : "bg-gray-50 border-indigo-200";

    const borderStyle = isDarkMode ? "border-cyan-500" : "border-indigo-200";

    const errorStyle = isDarkMode
        ? "bg-red-900 bg-opacity-50 border-red-500 text-red-300 font-mono"
        : "bg-red-50 border-red-200 text-red-600 font-sans";

    const errorPrefix = isDarkMode ? "[ERROR] " : "";

    return (
        <AnimatePresence>
            <Helmet>
                <title>Login</title>
            </Helmet>
            <div className={`min-h-screen flex items-center justify-center ${bgStyle} overflow-hidden`}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isDarkMode ? 0.2 : 0.05 }}
                    transition={{ duration: 1 }}
                    className={`absolute inset-0 z-0 ${gridBgStyle}`}
                />

                <motion.div
                    className={`max-w-md w-full z-10 p-8 ${cardStyle} backdrop-blur-sm rounded-lg border shadow-lg`}
                    variants={containerVariants}
                    initial="hidden"
                    animate={isExiting ? "exit" : "visible"}
                    exit="exit"
                >
                    <motion.div
                        className={`relative border-b ${borderStyle} pb-6 mb-6`}
                        variants={itemVariants}
                    >
                        <motion.div
                            className={`absolute -top-24 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full ${logoContainerStyle} border-2 flex items-center justify-center overflow-hidden`}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 1.5, type: "spring" }}
                        >
                            <img
                                src="/images/logosidoarjo.png"
                                alt="Logo Sidoarjo"
                                className="h-20 w-auto"
                            />
                        </motion.div>

                        <motion.div
                            className="text-center"
                            variants={itemVariants}
                        >
                            <h2 className={`text-3xl font-bold text-transparent bg-clip-text ${titleGradient} ${titleFont}`}>
                                {glitchText}
                            </h2>

                            <motion.div
                                className="flex-col justify-center space-x-2 mt-2"
                                variants={itemVariants}
                            >
                                <p className={`text-xl font-bold text-transparent bg-clip-text ${titleGradient} ${titleFont}`}>
                                    {isDarkMode ? "SISTEM INFORMASI MANAJEMEN" : "Sistem Informasi Manajemen"}
                                </p>
                                <p className={`text-xl font-bold text-transparent bg-clip-text ${titleGradient} ${titleFont}`}>
                                    {isDarkMode ? "LAYANAN TEKNOLOGI" : "Layanan Teknologi"}
                                </p>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`mb-4 p-3 ${errorStyle} rounded text-sm border`}
                        >
                            {errorPrefix}{error}
                        </motion.div>
                    )}

                    <motion.form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div variants={itemVariants}>
                            <label className={`block text-xs font-medium ${labelStyle} mb-1`}>
                                {labelPrefix}{isDarkMode ? "EMAIL_ID" : "Email"}
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full ${inputStyle} px-4 py-2 border-0 border-b-2 focus:ring-0 focus:outline-none transition-colors duration-300`}
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className={`block text-xs font-medium ${labelStyle} mb-1`}>
                                {labelPrefix}{isDarkMode ? "SECURE_KEY" : "Password"}
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className={`w-full ${inputStyle} px-4 py-2 border-0 border-b-2 focus:ring-0 focus:outline-none transition-colors duration-300`}
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <button
                                type="submit"
                                className={`w-full relative overflow-hidden group ${buttonStyle} text-white font-bold py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-offset-2 transition-all duration-300`}
                                disabled={loading}
                            >
                                <span className="relative z-10">
                                    {buttonText}
                                </span>
                                {isDarkMode && (
                                    <div className="absolute inset-0 w-full h-full opacity-50 group-hover:opacity-0">
                                        <div className="absolute h-1/2 w-1 bg-white top-1/4 left-1 opacity-50 animate-pulse"></div>
                                        <div className="absolute h-1/2 w-1 bg-white top-1/4 right-1 opacity-50 animate-pulse"></div>
                                    </div>
                                )}
                            </button>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className={`flex justify-between items-center ${footerTextStyle} text-xs mt-4 opacity-60`}
                        >
                            <span>{isDarkMode ? "&lt;/&gt; SECURE CONNECTION ESTABLISHED" : ""}</span>

                            {/* Theme Toggle Switch */}
                            <div className="flex items-center space-x-2">
                                <span className="text-xs">{isDarkMode ? "DARK" : "Light"}</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={!isDarkMode}
                                        onChange={toggleTheme}
                                        className="sr-only peer"
                                    />
                                    <div className={`w-9 h-5 rounded-full peer
                                        ${isDarkMode ? 'bg-gray-700' : 'bg-indigo-200'}
                                        peer-checked:after:translate-x-full
                                        peer-checked:after:border-white
                                        after:content-['']
                                        after:absolute
                                        after:top-[2px]
                                        after:left-[2px]
                                        after:bg-white
                                        after:border-gray-300
                                        after:border
                                        after:rounded-full
                                        after:h-4
                                        after:w-4
                                        after:transition-all
                                        ${isDarkMode ? 'after:bg-cyan-500' : 'after:bg-indigo-500'}`}>
                                    </div>
                                </label>
                            </div>
                        </motion.div>
                    </motion.form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
