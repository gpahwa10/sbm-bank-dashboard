import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useAuthStore } from "@/lib/auth";

// Wire up the auth token so every API call includes the Bearer token
setAuthTokenGetter(() => useAuthStore.getState().token);

createRoot(document.getElementById("root")!).render(<App />);
