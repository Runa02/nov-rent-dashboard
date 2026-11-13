import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import ReportFormPage from "./pages/ReportFormPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import AdminReportPage from "./pages/admin/reports/Index.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/lapor" element={<ReportFormPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/reports" element={<AdminReportPage />} />
      <Route path="*" element={<App />} />
    </Routes>
  </BrowserRouter>,
);

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href="#lapor"]');
  if (link) {
    event.preventDefault();
    window.location.assign("/lapor");
  }
});
