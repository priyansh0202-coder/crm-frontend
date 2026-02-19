import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoutes = () => {
    const { token, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>; 
    }

    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;
