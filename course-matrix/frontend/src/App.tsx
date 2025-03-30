import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login/LoginPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import SignupPage from "./pages/Signup/SignUpPage";
import AuthRoute from "./components/auth-route";
import SignupSuccessfulPage from "./pages/Signup/SignupSuccessfulPage";
import LoginRoute from "./components/login-route";
import { Toaster } from "./components/ui/toaster";

/**
 * App Component
 *
 * The main entry point for the application. Sets up the routing for different pages, including login, signup,
 * dashboard, and the signup success page. The routes are protected using the `AuthRoute` component for accessing
 * the dashboard to ensure the user is authenticated.
 *
 * Features:
 * - **Routing**: Uses `react-router-dom` to manage navigation between different pages of the app.
 *   - `/login`: The login page for users to authenticate.
 *   - `/signup`: The page for new users to register.
 *   - `/signup-success`: Confirmation page shown after successful account creation.
 *   - `/dashboard/*`: The protected dashboard route that requires authentication.
 * - **Redirects**: Redirects all unknown routes (`*`) and the root route `/` to the login page.
 *
 * Components:
 * - `Routes`, `Route`, `Navigate` for routing and redirection.
 * - `AuthRoute` to protect the dashboard route and ensure the user is authenticated before accessing it.
 * - `LoginPage`, `SignupPage`, `SignupSuccessfulPage`, `Dashboard` for different page components.
 *
 * @returns {JSX.Element} The rendered app with routing and navigation.
 */

function App() {
  return (
    <div className="w-full">
      <Routes>
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="signup-success" element={<SignupSuccessfulPage />} />
        <Route path="/login" element={<LoginRoute component={LoginPage} />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard/*"
          element={<AuthRoute component={Dashboard} />}
        />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
