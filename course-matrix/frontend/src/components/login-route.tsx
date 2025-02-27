import { useGetSessionQuery } from "@/api/authApiSlice";
import { Navigate } from "react-router-dom";
import LoadingPage from "@/pages/Loading/LoadingPage";

interface AuthRouteProps {
  component: React.ComponentType; // Type for the component prop
}

/**
 * Login Route
 *
 * Checks if a user session exists in localstorage. If so then redirect to dashboard.
 */
const LoginRoute: React.FC<AuthRouteProps> = ({ component: Component }) => {
  const userInfo = localStorage.getItem("userInfo");
  const { data, isLoading, error } = useGetSessionQuery();

  return data?.user && userInfo ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Component />
  );
};

export default LoginRoute;
