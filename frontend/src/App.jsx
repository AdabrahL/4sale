import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import MainLayout from "./layouts/MainLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import MyProperties from "./components/MyProperties";
import CreateProperty from "./pages/CreateProperty";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import PostBlog from "./pages/PostBlog";
import EditBlog from "./pages/EditBlog";
import Insights from "./pages/Insights";
import Agents from "./pages/Agents";
import AgentProfile from "./pages/AgentProfile";
import Profile from "./pages/Profile";
import Messenger from "./pages/Messenger";
import BlogDetail from "./pages/BlogDetail";
import Favorites from "./pages/Favorites";
import AdminPendingProperties from "./pages/AdminPendingProperties";
import ManageUsers from "./pages/ManageUsers";
import Notifications from "./pages/Notifications";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import DesignShowcase from "./pages/DesignShowcase";



function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
        {/* Auth pages: no navbar/footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />




        {/* All other pages use MainLayout (Navbar + Footer) */}
        <Route element={<MainLayout />}>
          {/* index = /  */}
          <Route index element={<Home />} />

          {/* other public pages */}
          <Route path="/home" element={<Home />} />
          <Route path="properties" element={<Properties />} />
          <Route path="properties/:id" element={<PropertyDetails />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/post" element={<PostBlog />} />
          <Route path="/blog/edit/:id" element={<EditBlog />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          
          {/* Admin routes */}
          <Route path="/admin/pending" element={<AdminPendingProperties />} />
          <Route path="/admin/users" element={<ManageUsers />} />

          {/* Notifications */}
          <Route path="/notifications" element={<Notifications />} />

          {/* user pages */}
          <Route path="my-properties" element={<MyProperties />} />
          <Route path="my-properties/:id" element={<PropertyDetails />} />
          {/* agent pages */}
          <Route path="agents/:id" element={<AgentProfile />} />
          <Route path="agents" element={<Agents />} />

          {/* Messages pages */}
          <Route path="/messenger" element={<Messenger />} />
          <Route path="/saved" element={<Favorites />} />
          
          {/* Design Showcase - Remove this in production */}
          <Route path="/design-showcase" element={<DesignShowcase />} />



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
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;