// src/utils/sweetAlert.js
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// Create React SweetAlert instance
const MySwal = withReactContent(Swal);

// Function to get current theme from localStorage
const getTheme = () => {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
};

// Create themed SweetAlert
const createThemedSwal = () => {
    const isDark = getTheme() === "dark";

    // Theme color schemes
    const colors = {
        light: {
            primary: "#4f46e5", // indigo-600
            secondary: "#3b82f6", // blue-500
            background: "#ffffff",
            text: "#1e293b", // slate-800
            border: "#e2e8f0", // slate-200
            buttonText: "#ffffff",
            secondaryButtonBg: "#f1f5f9", // slate-100
            secondaryButtonText: "#475569", // slate-600
            dangerButtonBg: "#ef4444", // red-500
            dangerButtonText: "#ffffff",
            boxShadow: "0 4px 12px rgba(148, 163, 184, 0.2)", // slate-400 with opacity
        },
        dark: {
            primary: "#00f2ff", // neon cyan
            secondary: "#2d2d3d", // neon pink (assuming typo, adjusted to grayish)
            background: "#121221",
            text: "#f0f0f0",
            border: "#00f2ff",
            buttonText: "#000000",
            secondaryButtonBg: "#2d2d3d",
            secondaryButtonText: "#00f2ff",
            dangerButtonBg: "#ff0055",
            dangerButtonText: "#ffffff",
            boxShadow: "0 0 10px #00f2ff, 0 0 20px rgba(0, 242, 255, 0.5)",
        },
    };

    const theme = isDark ? colors.dark : colors.light;

    // Font family based on theme
    const fontFamily = isDark ? "font-mono" : "font-sans";

    // Custom class for button styling based on theme
    const buttonClass = isDark
        ? "cyberpunk-btn-primary px-6 py-2 rounded font-bold uppercase text-sm tracking-wider transition-all duration-200 mx-2"
        : "elegant-btn-primary px-6 py-2 rounded font-medium text-sm transition-all duration-200 mx-2";

    const secondaryButtonClass = isDark
        ? "cyberpunk-btn-secondary px-6 py-2 rounded font-bold uppercase text-sm tracking-wider transition-all duration-200 mx-2"
        : "elegant-btn-secondary px-6 py-2 rounded font-medium text-sm transition-all duration-200 mx-2";

    const dangerButtonClass = isDark
        ? "cyberpunk-btn-danger px-6 py-2 rounded font-bold uppercase text-sm tracking-wider transition-all duration-200 mx-2"
        : "elegant-btn-danger px-6 py-2 rounded font-medium text-sm transition-all duration-200 mx-2";

    return MySwal.mixin({
        customClass: {
            container: fontFamily,
            popup: isDark
                ? "cyberpunk-popup rounded-md border-2 shadow-xl"
                : "elegant-popup rounded-lg shadow-xl",
            header: isDark
                ? "border-b-2 border-opacity-40"
                : "border-b border-opacity-20 pb-2",
            title: isDark
                ? "text-xl font-black uppercase tracking-wider"
                : "text-xl font-semibold",
            closeButton: "focus:outline-none hover:text-secondary",
            content: "py-4",
            confirmButton: buttonClass,
            cancelButton: secondaryButtonClass,
            denyButton: dangerButtonClass,
            footer: isDark
                ? "border-t-2 border-opacity-40 pt-3"
                : "border-t border-opacity-20 pt-3",
        },
        buttonsStyling: false,
        focusConfirm: false,
        reverseButtons: true,
        // Animation
        showClass: {
            popup: "animate__animated animate__fadeIn animate__faster",
        },
        hideClass: {
            popup: "animate__animated animate__fadeOut animate__faster",
        },
        // Add custom CSS to inject theme
        didOpen: (popup) => {
            const style = document.createElement("style");
            style.textContent = `
                /* Base styles for both themes */
                .elegant-popup {
                    background-color: ${theme.background} !important;
                    color: ${theme.text} !important;
                    border-color: ${theme.border} !important;
                    box-shadow: ${theme.boxShadow} !important;
                }

                .elegant-btn-primary {
                    background-color: ${theme.primary} !important;
                    color: ${theme.buttonText} !important;
                    border: 1px solid ${theme.primary} !important;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                }
                .elegant-btn-primary:hover {
                    filter: brightness(110%);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                }

                .elegant-btn-secondary {
                    background-color: ${theme.secondaryButtonBg} !important;
                    color: ${theme.secondaryButtonText} !important;
                    border: 1px solid ${theme.border} !important;
                }
                .elegant-btn-secondary:hover {
                    background-color: ${theme.border} !important;
                    transform: translateY(-1px);
                }

                .elegant-btn-danger {
                    background-color: ${theme.dangerButtonBg} !important;
                    color: ${theme.dangerButtonText} !important;
                    border: 1px solid ${theme.dangerButtonBg} !important;
                }
                .elegant-btn-danger:hover {
                    filter: brightness(110%);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                }

                /* Cyberpunk specific styles (only applied in dark mode) */
                .cyberpunk-popup {
                    background-color: ${theme.background} !important;
                    color: ${theme.text} !important;
                    border-color: ${theme.border} !important;
                    box-shadow: ${theme.boxShadow} !important;
                    position: relative;
                }
                .cyberpunk-popup::before {
                    content: '';
                    position: absolute;
                    top: -2px;
                    left: -2px;
                    right: -2px;
                    bottom: -2px;
                    border: 1px solid ${theme.secondary};
                    border-radius: 6px;
                    opacity: 0.5;
                    pointer-events: none;
                }
                .cyberpunk-popup::after {
                    content: '/////';
                    position: absolute;
                    top: 0;
                    right: 10px;
                    color: ${theme.secondary};
                    font-weight: bold;
                    opacity: 0.3;
                    pointer-events: none;
                }
                .cyberpunk-btn-primary {
                    background-color: ${theme.primary} !important;
                    color: ${theme.buttonText} !important;
                    border: 1px solid ${theme.secondary} !important;
                    box-shadow: 0 0 5px ${theme.primary} !important;
                    position: relative;
                    overflow: hidden;
                }
                .cyberpunk-btn-primary:hover {
                    box-shadow: 0 0 15px ${theme.primary} !important;
                    transform: translateY(-2px);
                }
                .cyberpunk-btn-primary::after {
                    content: '';
                    position: absolute;
                    top: -10px;
                    left: -10px;
                    width: 10px;
                    height: 10px;
                    background-color: ${theme.secondary};
                    opacity: 0.5;
                    filter: blur(5px);
                    animation: glitch 2s infinite linear;
                }
                .cyberpunk-btn-secondary {
                    background-color: ${theme.secondaryButtonBg} !important;
                    color: ${theme.secondaryButtonText} !important;
                    border: 1px solid ${theme.primary} !important;
                }
                .cyberpunk-btn-secondary:hover {
                    box-shadow: 0 0 10px ${theme.primary} !important;
                    transform: translateY(-2px);
                }
                .cyberpunk-btn-danger {
                    background-color: ${theme.dangerButtonBg} !important;
                    color: ${theme.dangerButtonText} !important;
                    border: 1px solid ${theme.secondary} !important;
                }
                .cyberpunk-btn-danger:hover {
                    box-shadow: 0 0 10px ${theme.dangerButtonBg} !important;
                    transform: translateY(-2px);
                }
                @keyframes glitch {
                    0% { transform: translate(0, 0); opacity: 0.75; }
                    20% { transform: translate(8px, 5px); opacity: 0.5; }
                    40% { transform: translate(-8px, -5px); opacity: 0.7; }
                    60% { transform: translate(3px, 2px); opacity: 0.5; }
                    80% { transform: translate(-3px, -2px); opacity: 0.7; }
                    100% { transform: translate(0, 0); opacity: 0.75; }
                }
            `;
            document.head.appendChild(style);

            return () => {
                document.head.removeChild(style);
            };
        },
    });
};

// Listen for theme changes
const setupThemeListener = () => {
    const themeChangeListener = () => {
        customSwal = createThemedSwal();
    };

    window.addEventListener("storage", (event) => {
        if (event.key === "theme") {
            themeChangeListener();
        }
    });

    window.addEventListener("themeChanged", themeChangeListener);
};

// Initialize SweetAlert with theme
let customSwal = createThemedSwal();
setupThemeListener();

// Predefined alert types
export const successAlert = (title, text) => {
    customSwal = createThemedSwal();
    const isDark = getTheme() === "dark";

    return customSwal.fire({
        icon: "success",
        title: isDark ? title || "OPERATION COMPLETE" : title || "Berhasil",
        text: isDark
            ? text || "Process successfully executed."
            : text || "Proses berhasil dijalankan.",
        timer: 2000,
        timerProgressBar: true,
        iconColor: isDark ? "#00f2ff" : "#4f46e5",
    });
};

export const errorAlert = (title, text) => {
    customSwal = createThemedSwal();
    const isDark = getTheme() === "dark";

    return customSwal.fire({
        icon: "error",
        title: isDark ? title || "SYSTEM FAILURE" : title || "Gagal",
        text: isDark
            ? text || "Error detected in operation."
            : text || "Terjadi kesalahan dalam proses.",
        iconColor: isDark ? "#ff00aa" : "#ef4444",
    });
};

export const warningAlert = (title, text) => {
    customSwal = createThemedSwal();
    const isDark = getTheme() === "dark";

    return customSwal.fire({
        icon: "warning",
        title: isDark ? title || "WARNING" : title || "Peringatan",
        text: isDark
            ? text || "Please complete all required fields."
            : text || "Harap lengkapi semua field yang diperlukan.",
        iconColor: isDark ? "#ffaa00" : "#f59e0b", // Neon orange for dark, amber for light
    });
};

export const confirmAlert = (
    title,
    text,
    callback,
    confirmButtonText = "Ya",
    cancelButtonText = "Batal",
    callbackSuccess = "Data berhasil dihapus.",
    callbackError = "Terjadi kesalahan.",
    icon = "question"
) => {
    customSwal = createThemedSwal();
    const isDark = getTheme() === "dark";

    return customSwal
        .fire({
            icon: icon,
            title: isDark ? title || "CONFIRM ACTION" : title || "Konfirmasi",
            text: isDark
                ? text || "Do you wish to proceed with this operation?"
                : text || "Apakah Anda yakin ingin melanjutkan?",
            showCancelButton: true,
            confirmButtonText: isDark ? confirmButtonText : confirmButtonText,
            cancelButtonText: isDark ? cancelButtonText : cancelButtonText,
            iconColor: isDark ? "#00f2ff" : "#4f46e5",
        })
        .then(async (result) => {
            if (result.isConfirmed) {
                loadingAlert("Sedang Memproses...");
                try {
                    // Execute callback function that returns a promise
                    const success = await callback();

                    // Show success message only if callback doesn't handle its own alerts
                    if (success !== false) {
                        successAlert("Berhasil!", callbackSuccess);
                    }
                    return true;
                } catch (error) {
                    console.error("Error in confirmAlert callback:", error);
                    errorAlert("Gagal!", callbackError);

                    return false;
                }
            }
            return false;
        });
};

export const loadingAlert = (title) => {
    customSwal = createThemedSwal();
    const isDark = getTheme() === "dark";

    return customSwal.fire({
        title: isDark ? title || "PROCESSING..." : title || "Memproses...",
        html: isDark
            ? '<div class="cyberpunk-loading">System computing...</div>'
            : '<div class="elegant-loading">Mohon tunggu sebentar...</div>',
        didOpen: (popup) => {
            MySwal.showLoading();

            const style = document.createElement("style");
            const primaryColor = isDark ? "#00f2ff" : "#4f46e5";

            style.textContent = `
                .cyberpunk-loading {
                    position: relative;
                    padding-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: bold;
                }
                .cyberpunk-loading::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 2px;
                    width: 100%;
                    background: linear-gradient(90deg, transparent, ${primaryColor}, transparent);
                    animation: scan 2s infinite;
                }
                .elegant-loading {
                    position: relative;
                    padding-bottom: 10px;
                    font-weight: normal;
                }
                .elegant-loading::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 2px;
                    width: 30%;
                    background-color: ${primaryColor};
                    animation: progress 1.5s infinite ease-in-out;
                    border-radius: 2px;
                }
                @keyframes scan {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }
                @keyframes progress {
                    0% { left: 0; width: 0; }
                    50% { width: 30%; }
                    100% { left: 100%; width: 0; }
                }
            `;
            document.head.appendChild(style);

            MySwal.showLoading();

            return () => {
                document.head.removeChild(style);
            };
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        showConfirmButton: false,
    });
};

// Toast notification
export const toastNotification = (icon, title) => {
    customSwal = createThemedSwal();

    const isDark = getTheme() === "dark";
    const backgroundColor = isDark ? "#121221" : "#ffffff";
    const textColor = isDark ? "#f0f0f0" : "#1e293b";
    const borderColor = isDark ? "#00f2ff" : "#4f46e5";

    const Toast = customSwal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);

            const style = document.createElement("style");
            style.textContent = `
                .swal2-toast {
                    background-color: ${backgroundColor} !important;
                    color: ${textColor} !important;
                    border-left: 3px solid ${borderColor} !important;
                    box-shadow: ${
                        isDark
                            ? `0 0 10px ${borderColor}`
                            : "0 4px 6px rgba(0, 0, 0, 0.1)"
                    } !important;
                }
                .swal2-title {
                    color: ${textColor} !important;
                    ${
                        isDark
                            ? "text-transform: uppercase; letter-spacing: 1px;"
                            : ""
                    }
                }
            `;
            document.head.appendChild(style);

            return () => {
                document.head.removeChild(style);
            };
        },
    });

    return Toast.fire({
        icon: icon || "success",
        title: isDark ? title || "NOTIFICATION" : title || "Notifikasi",
        iconColor: isDark
            ? icon === "error"
                ? "#ff00aa"
                : "#00f2ff"
            : icon === "error"
            ? "#ef4444"
            : "#4f46e5",
    });
};

// Theme toggler function
export const toggleTheme = () => {
    const currentTheme = localStorage.getItem("theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", newTheme);

    window.dispatchEvent(new Event("themeChanged"));

    return newTheme;
};

// Export the base SweetAlert instance for custom configurations
export default customSwal;
