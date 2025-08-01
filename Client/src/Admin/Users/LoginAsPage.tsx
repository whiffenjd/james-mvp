
"use client";

import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import toast from "react-hot-toast";
import { useLoginAsUser } from "../../API/Endpoints/Admin/admin";
import { useAuth } from "../../Context/AuthContext";

function LoginAsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const loginAsUser = useLoginAsUser();

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    useEffect(() => {
        if (!id || !token) {
            toast.error("Invalid user ID or token");
            navigate("/admin/users");
            return;
        }

        loginAsUser.mutate({ userId: id, token }, {
            onSuccess: (response) => {
                if (!response.user.isEmailVerified) {
                    toast.error("Email not verified. Please verify the user's email first.");
                    navigate("/admin/users");
                    return;
                }

                toast.success("Signed in successfully!");
                login({
                    user: response.user,
                    token: response.token,
                });
                navigate("/dashboard");
            },
            onError: (error: any) => {
                navigate("/admin/users");
            },
        });
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-theme-primary-text">Logging in...</h2>
                <p className="text-theme-secondary-text">Please wait while we sign you in as the selected user.</p>
            </div>
        </div>
    );
}
export default LoginAsPage;
