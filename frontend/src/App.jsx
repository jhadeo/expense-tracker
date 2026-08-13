import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Expenses } from "./pages/Expenses";
import { Incomes } from "./pages/Incomes";
import { Categories } from "./pages/Categories";
import { Register } from "./pages/auth/Register";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />}/>
      <Route path="/register" element={<Register />}/>

      <Route element={<ProtectedRoute/>}>
        <Route element={<AuthLayout/>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/incomes" element={<Incomes />} />
           <Route path="/categories" element={<Categories />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
