import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

const Client_id =
  "57968665942-ahtdfj3dlte5re88caago6tfuki5ugbn.apps.googleusercontent.com";
createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={Client_id!}>
    <App />
  </GoogleOAuthProvider>,
);
