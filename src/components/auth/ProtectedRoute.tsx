import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { isAuthenticated, logout } from "../../api/auth";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

// Session timeout: 30 menit (dalam milidetik)
const SESSION_TIMEOUT = 30 * 60 * 1000;

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const location = useLocation();
    const [isAuth, setIsAuth] = useState(isAuthenticated());

    useEffect(() => {
        // Cek authentication status
        const checkAuth = () => {
            const authenticated = isAuthenticated();
            setIsAuth(authenticated);

            if (!authenticated) {
                return;
            }

            // Cek last activity time
            const lastActivity = localStorage.getItem("lastActivity");
            if (lastActivity) {
                const timeSinceLastActivity =
                    Date.now() - parseInt(lastActivity);

                if (timeSinceLastActivity > SESSION_TIMEOUT) {
                    // Session expired, auto logout
                    console.log("Session expired, auto logout");
                    handleAutoLogout();
                }
            }
        };

        checkAuth();

        // Update last activity time
        const updateLastActivity = () => {
            localStorage.setItem("lastActivity", Date.now().toString());
        };

        // Set initial last activity
        updateLastActivity();

        // Track user activity
        const events = [
            "mousedown",
            "keydown",
            "scroll",
            "touchstart",
            "click",
        ];
        events.forEach((event) => {
            document.addEventListener(event, updateLastActivity);
        });

        // Check session every minute
        const interval = setInterval(checkAuth, 60000);

        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, updateLastActivity);
            });
            clearInterval(interval);
        };
    }, []);

    const handleAutoLogout = async () => {
        await logout();
        setIsAuth(false);
        alert("Sesi Anda telah berakhir. Silakan login kembali.");
    };

    if (!isAuth) {
        // Redirect ke halaman login dengan menyimpan lokasi sebelumnya
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
