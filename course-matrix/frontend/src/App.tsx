import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login/LoginPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import SignupPage from "./pages/Signup/SignUpPage";
import AuthRoute from "./components/auth-route";
import SignupSuccessfulPage from "./pages/Signup/SignupSuccessfulPage";

function App() {
  return (
    <div className="w-full">
      <Routes>
            <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="signup-success" element={<SignupSuccessfulPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard/*"
          element={<AuthRoute component={Dashboard} />}
        />
      </Routes>
    </div>
  );
}

export default App;
