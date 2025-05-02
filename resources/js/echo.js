import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    scheme: import.meta.env.VITE_REVERB_SCHEME,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === "https",
    enabledTransports: ["ws", "wss"],
    authEndpoint: "/broadcasting/auth",
    auth: {
        headers: {
            "X-CSRF-TOKEN":
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "",
        },
    },
});

export default echo;
