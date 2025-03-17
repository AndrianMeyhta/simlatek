// src/utils/sweetAlert.tsx
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// Create React SweetAlert instance
const MySwal = withReactContent(Swal);

// Define theme type
type Theme = "dark" | "light";

// Interface for color schemes
interface ColorScheme {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
    buttonText: string;
    secondaryButtonBg: string;
    secondaryButtonText: string;
    dangerButtonBg: string;
    dangerButtonText: string;
    boxShadow: string;
}

// Function to get current theme from localStorage
const getTheme = (): Theme => {
    return (
        localStorage.getItem("theme") === "dark" ? "dark" : "light"
    ) as Theme;
};

// Create themed SweetAlert
const createThemedSwal = () => {
    const isDark: boolean = getTheme() === "dark";

    // Elegant color schemes for both themes
    const colors: Record<Theme, ColorScheme> = {
        light: {
            primary: "#4f46e5", // Soft indigo
            secondary: "#6b7280", // Cool gray
            background: "#f9fafb", // Light gray-white
            text: "#1f2937", // Dark gray
            border: "#d1d5db", // Light gray border
            buttonText: "#ffffff",
            secondaryButtonBg: "#e5e7eb", // Very light gray
            secondaryButtonText: "#374151", // Medium gray
            dangerButtonBg: "#dc2626", // Soft red
            dangerButtonText: "#ffffff",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Subtle shadow
        },
        dark: {
            primary: "#818cf8", // Soft purple-blue
            secondary: "#9ca3af", // Light gray
            background: "#1f2937", // Dark slate
            text: "#e5e7eb", // Light gray
            border: "#4b5563", // Darker gray border
            buttonText: "#ffffff",
            secondaryButtonBg: "#374151", // Medium slate
            secondaryButtonText: "#d1d5db", // Light gray
            dangerButtonBg: "#ef4444", // Vibrant yet elegant red
            dangerButtonText: "#ffffff",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)", // Deeper shadow
        },
    };

    const theme: ColorScheme = isDark ? colors.dark : colors.light;
    const fontFamily: string = "font-sans"; // Elegant sans-serif for both themes

    const buttonClass: string =
        "elegant-btn-primary px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 mx-2";
    const secondaryButtonClass: string =
        "elegant-btn-secondary px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 mx-2";
    const dangerButtonClass: string =
        "elegant-btn-danger px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 mx-2";

    return MySwal.mixin({
        customClass: {
            container: fontFamily,
            popup: "elegant-popup rounded-lg shadow-xl",
            title: "text-xl font-semibold",
            htmlContainer: "py-4 text-base", // Replaces 'content'
            closeButton: "focus:outline-none hover:text-secondary",
            confirmButton: buttonClass,
            cancelButton: secondaryButtonClass,
            denyButton: dangerButtonClass,
            footer: "border-t pt-3 text-sm text-gray-500",
        },
        buttonsStyling: false,
        focusConfirm: false,
        reverseButtons: true,
        showClass: {
            popup: "animate__animated animate__fadeIn animate__faster",
        },
        hideClass: {
            popup: "animate__animated animate__fadeOut animate__faster",
        },
        didOpen: (popup: HTMLElement) => {
            const style = document.createElement("style");
            style.textContent = `
        .elegant-popup {
          background-color: ${theme.background} !important;
          color: ${theme.text} !important;
          border: 1px solid ${theme.border} !important;
          box-shadow: ${theme.boxShadow} !important;
        }
        .elegant-btn-primary {
          background-color: ${theme.primary} !important;
          color: ${theme.buttonText} !important;
          border: 1px solid ${theme.primary} !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        }
        .elegant-btn-primary:hover {
          filter: brightness(105%);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
        }
        .elegant-btn-secondary {
          background-color: ${theme.secondaryButtonBg} !important;
          color: ${theme.secondaryButtonText} !important;
          border: 1px solid ${theme.border} !important;
        }
        .elegant-btn-secondary:hover {
          background-color: ${isDark ? "#4b5563" : "#d1d5db"} !important;
          transform: translateY(-1px);
        }
        .elegant-btn-danger {
          background-color: ${theme.dangerButtonBg} !important;
          color: ${theme.dangerButtonText} !important;
          border: 1px solid ${theme.dangerButtonBg} !important;
        }
        .elegant-btn-danger:hover {
          filter: brightness(105%);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
        }
        .swal2-header {
          border-bottom: 1px solid ${theme.border} !important;
          padding-bottom: 0.75rem;
        }
        .swal2-footer {
          border-top: 1px solid ${theme.border} !important;
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

    window.addEventListener("storage", (event: StorageEvent) => {
        if (event.key === "theme") {
            themeChangeListener();
        }
    });

    window.addEventListener(
        "themeChanged",
        themeChangeListener as EventListener
    );
};

// Initialize SweetAlert with theme
let customSwal = createThemedSwal();
setupThemeListener();

// Predefined alert types
export const successAlert = (title?: string, text?: string) => {
    customSwal = createThemedSwal();
    const isDark: boolean = getTheme() === "dark";

    return customSwal.fire({
        icon: "success",
        title: title || "Berhasil",
        text: text || "Proses berhasil dijalankan.",
        timer: 2000,
        timerProgressBar: true,
        iconColor: isDark ? "#818cf8" : "#4f46e5",
    });
};

export const errorAlert = (title?: string, text?: string) => {
    customSwal = createThemedSwal();
    const isDark: boolean = getTheme() === "dark";

    return customSwal.fire({
        icon: "error",
        title: title || "Gagal",
        text: text || "Terjadi kesalahan dalam proses.",
        iconColor: isDark ? "#ef4444" : "#dc2626",
    });
};

export const warningAlert = (title?: string, text?: string) => {
    customSwal = createThemedSwal();
    const isDark: boolean = getTheme() === "dark";

    return customSwal.fire({
        icon: "warning",
        title: title || "Peringatan",
        text: text || "Harap lengkapi semua field yang diperlukan.",
        iconColor: isDark ? "#f59e0b" : "#d97706",
    });
};

export const confirmAlert = (
    title?: string,
    text?: string,
    callback?: () => Promise<boolean | void>,
    confirmButtonText: string = "Ya",
    cancelButtonText: string = "Batal",
    callbackSuccess: string = "Data berhasil dihapus.",
    callbackError: string = "Terjadi kesalahan.",
    icon: "success" | "error" | "warning" | "info" | "question" = "question"
): Promise<boolean> => {
    customSwal = createThemedSwal();

    return customSwal
        .fire({
            icon,
            title: title || "Konfirmasi",
            text: text || "Apakah Anda yakin ingin melanjutkan?",
            showCancelButton: true,
            confirmButtonText,
            cancelButtonText,
            iconColor: "#4f46e5",
        })
        .then(async (result) => {
            if (result.isConfirmed && callback) {
                loadingAlert("Sedang Memproses...");
                try {
                    const success = await callback();
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

export const loadingAlert = (title?: string) => {
    customSwal = createThemedSwal();
    const isDark: boolean = getTheme() === "dark";

    return customSwal.fire({
        title: title || "Memproses...",
        html: '<div class="elegant-loading">Mohon tunggu sebentar...</div>',
        didOpen: (popup: HTMLElement) => {
            MySwal.showLoading();

            const style = document.createElement("style");
            const primaryColor = isDark ? "#818cf8" : "#4f46e5";

            style.textContent = `
        .elegant-loading {
          position: relative;
          padding-bottom: 10px;
          font-weight: normal;
          color: ${isDark ? "#e5e7eb" : "#1f2937"};
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
export const toastNotification = (
    icon?: "success" | "error" | "warning" | "info" | "question",
    title?: string
) => {
    customSwal = createThemedSwal();

    const isDark: boolean = getTheme() === "dark";
    const backgroundColor: string = isDark ? "#1f2937" : "#f9fafb";
    const textColor: string = isDark ? "#e5e7eb" : "#1f2937";
    const borderColor: string = isDark ? "#818cf8" : "#4f46e5";

    const Toast = customSwal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast: HTMLElement) => {
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
                  ? "0 4px 8px rgba(0, 0, 0, 0.3)"
                  : "0 4px 6px rgba(0, 0, 0, 0.1)"
          } !important;
        }
        .swal2-title {
          color: ${textColor} !important;
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
        title: title || "Notifikasi",
        iconColor: isDark
            ? icon === "error"
                ? "#ef4444"
                : "#818cf8"
            : icon === "error"
            ? "#dc2626"
            : "#4f46e5",
    });
};

// Theme toggler function
export const toggleTheme = (): Theme => {
    const currentTheme: Theme = getTheme();
    const newTheme: Theme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", newTheme);

    window.dispatchEvent(new Event("themeChanged"));

    return newTheme;
};

// Export the base SweetAlert instance for custom configurations
export default customSwal;
