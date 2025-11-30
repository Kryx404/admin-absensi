import { Navigate } from "react-router";
import { isAuthenticated } from "../../api/auth";

interface PublicRouteProps {
    children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    if (isAuthenticated()) {
        // Redirect ke dashboard jika sudah login
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
