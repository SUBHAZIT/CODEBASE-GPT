import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initWebContainer } from "./lib/webcontainer";

initWebContainer();

createRoot(document.getElementById("root")!).render(<App />);
