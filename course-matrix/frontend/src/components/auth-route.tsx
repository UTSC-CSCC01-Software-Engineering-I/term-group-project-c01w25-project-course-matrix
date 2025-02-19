import { useGetSessionQuery } from "@/api/authApiSlice";
import { Navigate } from "react-router-dom";
import LoadingPage from "@/pages/Loading/LoadingPage";

interface AuthRouteProps {
  component: React.ComponentType; // Type for the component prop
}

/**
 * Login Route
 * 
 * Checks if a user is logged in (session exists). If not then redirect to login.
 */
const AuthRoute: React.FC<AuthRouteProps> = ({ component: Component }) => {
  const { data, isLoading, error } = useGetSessionQuery();

  if (isLoading) {
    return <LoadingPage />;
  }

  return data?.user ? <Component /> : <Navigate to="/login" replace />;
};

export default AuthRoute;
