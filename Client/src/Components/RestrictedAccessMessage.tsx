import React from "react";
import { useAuth } from "../Context/AuthContext"; // Adjust import path
import { useNavigate } from "react-router-dom";

const RestrictedAccessMessage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (user?.onboardingStatus?.status !== "complete_later") {
        return null;
    }

    return (
        <div className="flex items-center justify-center p-4 mt-6">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6 text-center space-y-4">
                <h2 className="text-2xl font-semibold text-theme-primary-text">
                    Access Restricted
                </h2>
                <p className="text-xl text-theme-secondary-text">
                    To access this page, please complete your onboarding by uploading your
                    AML/KYC documents on the{" "}
                    <span className="font-medium text-teal-600">AML/KYC Documents</span>{" "}
                    page in your dashboard.
                </p>

                <button
                    onClick={() => navigate("/investor/dashboard/documents")}
                    className="px-6 py-3 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 transition"
                >
                    Go to AML/KYC Documents
                </button>
            </div>
        </div>
    );
};

export default RestrictedAccessMessage;
