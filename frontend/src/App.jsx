// src/App.jsx
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import MyProperties from "./pages/MyProperties";
import CreateProperty from "./pages/CreateProperty";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Auth pages: no navbar/footer */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* All other pages use MainLayout (Navbar + Footer) */}
      <Route element={<MainLayout />}>
        {/* index = /  */}
        <Route index element={<Properties />} />

        {/* other public pages */}
        <Route path="properties" element={<Properties />} />
        <Route path="properties/:id" element={<PropertyDetails />} />

        {/* user pages */}
        <Route path="my-properties" element={<MyProperties />} />

        {/* Protected page (wrap with your ProtectedRoute) */}
        <Route
          path="properties/create"
          element={
            <ProtectedRoute>
              <CreateProperty />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Optional: 404 fallback (keeps layout) */}
      {/* <Route path="*" element={<MainLayout><NotFound /></MainLayout>} /> */}
    </Routes>
  );
}

export default App;
