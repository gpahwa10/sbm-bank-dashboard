import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import { useAuthStore } from "@/lib/auth";

const apiBase = import.meta.env.VITE_API_BASE_URL?.trim();
if (apiBase) {
  setBaseUrl(apiBase.replace(/\/+$/, ""));
}

// Wire up the auth token so every API call includes the Bearer token
setAuthTokenGetter(() => useAuthStore.getState().token);

createRoot(document.getElementById("root")!).render(<App />);
