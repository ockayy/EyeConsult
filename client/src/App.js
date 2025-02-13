// src/App.js

import "./App.css";
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap CSS is imported

// Importing Components
import HomePage from "./components/pages/HomePage";
import AboutUs from "./components/pages/about";
import SignPatient from "./components/SignPatient";
import SignDoctor from "./components/SignDoctor";
import LoginPatient from "./components/LoginPatient";
import LoginDoctor from "./components/LoginDoctor";
import Dashboard from "./components/pages/Dashboard";
import Scanner from "./components/pages/scanner"
import DoctorDashboard from "./components/pages/DoctorDashboard";
import Blogs from "./components/pages/Blog";
import BlogDisplay from "./components/BlogDisplay";
import Doctors from "./components/pages/Doctors";
import DoctorProfile from "./components/DoctorProfile";
import ViewProfile from "./components/ViewProfile"; // Corrected Import
import DoctorViewProfile from "./components/DoctorViewProfile"; // Corrected Import
import ViewAppointments from "./components/pages/ViewAppointment";
import ExerciseDisplay from "./components/ExerciseDisplay";
import EyeExercises from "./components/pages/eyeexercise";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import PatientViewAppointments from "./components/PatientViewAppointments"; // Corrected Import

// Store Components
import SignUpStoreUser from "./components/SignUpStoreUser";
import LoginStoreUser from "./components/LoginStoreUser";
import StoreHome from "./components/StoreHome";
import MedicineDetail from "./components/MedicineDetail";
import MedicineDetails from "./components/MedicineDetails";
import StoreSearchResults from "./components/StoreSearchResults";

import Cart from "./components/Cart";
import StoreOrders from "./components/StoreOrders";
import LoginStoreOwner from "./components/LoginStoreOwner"; // Newly created
import SignUpStoreOwner from "./components/SignUpStoreOwner"; // Newly created
import StoreOwnerDashboard from "./components/StoreOwnerDashboard"; // Newly created
import StoreOwnerMedicineManagement from "./components/StoreOwnerMedicineManagement"; // Newly created
import StoreOwnerAddMedicine from "./components/StoreOwnerAddMedicine"; // Newly created
import StoreOwnerEditMedicine from "./components/StoreOwnerEditMedicine"; // Newly created
import StoreOwnerOrders from "./components/StoreOwnerOrders"; //
import StoreProfile from "./components/StoreProfile"; // Newly created

// Admin Components
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import MedicineManagement from "./components/MedicineManagement";
import AddMedicine from "./components/AddMedicine";
import EditMedicine from "./components/EditMedicine";
import OrderManagement from "./components/OrderManagement";
import UserManagement from "./components/UserManagement";

// Unauthorized Component
import Unauthorized from "./components/Unauthorized";

// Header Component
import Heading from "./components/Heading";

// ProtectedRoute Component
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/scan-reader" element={<Scanner />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctor/:id" element={<DoctorProfile />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blog/:blogId" element={<BlogDisplay />} />
        <Route path="/eyeexercise" element={<EyeExercises />} />
        <Route path="/eyeexercise/:exerciseId" element={<ExerciseDisplay />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/reset-password/:userType/:token"
          element={<ResetPassword />}
        />
        {/* Authentication Routes */}
        {/* Patient Routes */}
        <Route path="/login/patient" element={<LoginPatient />} />
        <Route path="/signup/patient" element={<SignPatient />} />
        {/* Doctor Routes */}
        <Route path="/login/doctor" element={<LoginDoctor />} />
        <Route path="/signup/doctor" element={<SignDoctor />} />
        {/* Store User Routes */}
        <Route path="/store/signup" element={<SignUpStoreUser />} />
        <Route path="/store/login" element={<LoginStoreUser />} />
        <Route path="/store" element={<StoreHome />} />
        <Route
          path="/store/medicine/:medicineId"
          element={<MedicineDetail />}
        />
        <Route
          path="/store/medicine/details/:medicineId"
          element={<MedicineDetails />}
        />
        {/* Cart and Orders */}
        <Route
          path="/store/cart"
          element={
            <ProtectedRoute
              element={Cart}
              redirectTo="/store/login"
              allowedRoles={["store"]}
            />
          }
        />
        <Route
          path="/store/orders"
          element={
            <ProtectedRoute
              element={StoreOrders}
              redirectTo="/store/login"
              allowedRoles={["store"]}
            />
          }
        />
        <Route
          path="/dashboard/patient/appointments"
          element={<PatientViewAppointments />}
        />
        {/* Store Owner Routes */}
        <Route
          path="/store/owners/signup"
          element={<SignUpStoreOwner />}
        />{" "}
        {/* Updated to plural */}
        <Route path="/store/owners/login" element={<LoginStoreOwner />} />{" "}
        {/* Updated to plural */}
        <Route
          path="/store/owners/dashboard"
          element={
            // Updated to plural
            <ProtectedRoute
              element={StoreOwnerDashboard}
              redirectTo="/store/owners/login"
              allowedRoles={["store_owner"]}
            />
          }
        />
        <Route
          path="/store/owners/medicines"
          element={
            // Updated to plural
            <ProtectedRoute
              element={StoreOwnerMedicineManagement}
              redirectTo="/store/owners/login"
              allowedRoles={["store_owner"]}
            />
          }
        />
        <Route
          path="/store/owners/medicines/add"
          element={
            // Updated to plural
            <ProtectedRoute
              element={StoreOwnerAddMedicine}
              redirectTo="/store/owners/login"
              allowedRoles={["store_owner"]}
            />
          }
        />
        <Route
          path="/store/owners/medicines/edit/:medicineId"
          element={
            // Updated to plural
            <ProtectedRoute
              element={StoreOwnerEditMedicine}
              redirectTo="/store/owners/login"
              allowedRoles={["store_owner"]}
            />
          }
        />
        <Route
          path="/store/owners/orders"
          element={
            // Updated to plural
            <ProtectedRoute
              element={StoreOwnerOrders}
              redirectTo="/store/owners/login"
              allowedRoles={["store_owner"]}
            />
          }
        />
        <Route path="/store/profile/:storeId" element={<StoreProfile />} />
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              element={AdminDashboard}
              redirectTo="/admin/login"
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path="/admin/medicines"
          element={
            <ProtectedRoute
              element={MedicineManagement}
              redirectTo="/admin/login"
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path="/admin/medicines/add"
          element={
            <ProtectedRoute
              element={AddMedicine}
              redirectTo="/admin/login"
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path="/admin/medicines/edit/:medicineId"
          element={
            <ProtectedRoute
              element={EditMedicine}
              redirectTo="/admin/login"
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute
              element={OrderManagement}
              redirectTo="/admin/login"
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute
              element={UserManagement}
              redirectTo="/admin/login"
              allowedRoles={["admin"]}
            />
          }
        />
        {/* Patient Dashboard Routes */}
        <Route
          path="/dashboard/patient"
          element={
            <ProtectedRoute
              element={Dashboard}
              redirectTo="/login/patient"
              allowedRoles={["patient"]}
            />
          }
        />
        <Route
          path="/dashboard/patient/viewprofile"
          element={
            <ProtectedRoute
              element={ViewProfile}
              redirectTo="/login/patient"
              allowedRoles={["patient"]}
            />
          }
        />
        <Route
          path="/dashboard/patient/eyeexercise"
          element={
            <ProtectedRoute
              element={EyeExercises}
              redirectTo="/login/patient"
              allowedRoles={["patient"]}
            />
          }
        />
        <Route
          path="/dashboard/patient/eyeexercise/:exerciseId"
          element={
            <ProtectedRoute
              element={ExerciseDisplay}
              redirectTo="/login/patient"
              allowedRoles={["patient"]}
            />
          }
        />
        <Route
          path="/dashboard/patient/blogs"
          element={
            <ProtectedRoute
              element={Blogs}
              redirectTo="/login/patient"
              allowedRoles={["patient"]}
            />
          }
        />
        <Route
          path="/dashboard/patient/blogs/:blogId"
          element={
            <ProtectedRoute
              element={BlogDisplay}
              redirectTo="/login/patient"
              allowedRoles={["patient"]}
            />
          }
        />
        <Route
          path="/dashboard/patient/aboutus"
          element={
            <ProtectedRoute
              element={AboutUs}
              redirectTo="/login/patient"
              allowedRoles={["patient"]}
            />
          }
        />
        <Route
          path="/dashboard/patient/doctors"
          element={
            <ProtectedRoute
              element={Doctors}
              redirectTo="/login/patient"
              allowedRoles={["patient"]}
            />
          }
        />
        <Route
          path="/dashboard/patient/doctors/:id"
          element={
            <ProtectedRoute
              element={DoctorProfile}
              redirectTo="/login/patient"
              allowedRoles={["patient"]}
            />
          }
        />{" "}
        <Route path="/store/search" element={<StoreSearchResults />} />
        {/* Doctor Dashboard Routes */}
        <Route
          path="/dashboard/doctor"
          element={
            <ProtectedRoute
              element={DoctorDashboard}
              redirectTo="/login/doctor"
              allowedRoles={["doctor"]}
            />
          }
        />
        <Route
          path="/dashboard/doctor/viewprofile"
          element={
            <ProtectedRoute
              element={DoctorViewProfile}
              redirectTo="/login/doctor"
              allowedRoles={["doctor"]}
            />
          }
        />
        <Route
          path="/dashboard/doctor/viewappointment"
          element={
            <ProtectedRoute
              element={ViewAppointments}
              redirectTo="/login/doctor"
              allowedRoles={["doctor"]}
            />
          }
        />
        <Route
          path="/dashboard/doctor/blogs"
          element={
            <ProtectedRoute
              element={Blogs}
              redirectTo="/login/doctor"
              allowedRoles={["doctor"]}
            />
          }
        />
        <Route
          path="/dashboard/doctor/blogs/:blogId"
          element={
            <ProtectedRoute
              element={BlogDisplay}
              redirectTo="/login/doctor"
              allowedRoles={["doctor"]}
            />
          }
        />
        {/* Unauthorized Route */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* Catch-All Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
