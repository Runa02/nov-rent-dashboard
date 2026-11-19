import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import FleetManagementPage from "./pages/admin/cars/Index.jsx";
import FleetFormPage from "./pages/admin/cars/form.jsx";
import OrderManagementPage from "./pages/admin/orders/Index.jsx";
import OrderConfirmationPage from "./pages/admin/orders/confirmation.jsx";
import ManajemenDriver from "./pages/admin/drivers/Index.jsx";
import DriverLayout from "./pages/admin/drivers/DriverLayout.jsx";
import DriverForm from "./pages/admin/drivers/DriverForm.jsx";
import "./index.css";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

      <Route path="/admin/cars" element={<FleetManagementPage />} />

      <Route path="/admin/cars/create" element={<FleetFormPage />} />

      <Route path="/admin/cars/:id/edit" element={<FleetFormPage />} />

      <Route path="/admin/orders" element={<OrderManagementPage />} />

      <Route
        path="/admin/orders/:id/confirm"
        element={<OrderConfirmationPage />}
      />

      <Route path="/admin/drivers" element={<DriverLayout />}>
        <Route index element={<ManajemenDriver />} />
        <Route path="create" element={<DriverForm />} />
      </Route>

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
