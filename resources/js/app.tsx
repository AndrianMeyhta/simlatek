import "./bootstrap";
import "../css/app.css";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob<Record<string, () => Promise<{ default: React.ComponentType<any> }>>>(
            "./Pages/**/*.tsx",
            { eager: true }
        );
        return pages[`./Pages/${name}.tsx`]?.default;
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <QueryClientProvider client={queryClient}>
                <App {...props} />
            </QueryClientProvider>
        );
    },
});
