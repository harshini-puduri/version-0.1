
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import "./styles/tailwind.css";
  import "./styles/theme.css";
  import { getAllEntries } from "./app/utils/journalStorage";
  import { getUserSettings } from "./app/utils/userSettings";

  // Initialize all dummy data on app startup
  getAllEntries();
  getUserSettings();

  createRoot(document.getElementById("root")!).render(<App />);
  