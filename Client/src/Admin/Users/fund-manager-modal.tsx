
import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { useCheckSubdomain, useCreateFundManager } from "../../API/Endpoints/Admin/admin"
import { Eye, EyeOff } from "lucide-react"
interface FundManagerModalProps {
    isOpen: boolean
    onClose: () => void
}

export function FundManagerModal({ isOpen, onClose }: FundManagerModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        subdomain: "",
    })
    const [showPassword, setShowPassword] = useState(false)

    const [subdomainStatus, setSubdomainStatus] = useState<{
        isChecking: boolean
        isAvailable: boolean | null
        error: string | null
    }>({
        isChecking: false,
        isAvailable: null,
        error: null,
    })

    const { checkSubdomain } = useCheckSubdomain();
    const { mutate: createFundManager, isPending: isCreating } = useCreateFundManager()
    // Create a ref to store the debounce timer
    const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);
    const checkSubdomainAvailability = async (subdomain: string) => {
        if (!subdomain || subdomain.length < 3) {
            setSubdomainStatus({ isChecking: false, isAvailable: null, error: null });
            return;
        }

        setSubdomainStatus({ isChecking: true, isAvailable: null, error: null });

        try {
            const data = await checkSubdomain(subdomain);
            setSubdomainStatus({
                isChecking: false,
                isAvailable: data.isAvailable,
                error: null,
            });
        } catch (error) {
            setSubdomainStatus({
                isChecking: false,
                isAvailable: null,
                error: "Failed to check subdomain",
            });
        }
    };

    // Stable debounced function using useCallback
    const debouncedCheckSubdomain = useCallback((subdomain: string) => {
        // Clear any existing timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set a new timer
        debounceTimer.current = setTimeout(() => {
            checkSubdomainAvailability(subdomain);
        }, 500);
    }, []); // Empty dependency array means this is created once

    useEffect(() => {
        if (formData.subdomain) {
            debouncedCheckSubdomain(formData.subdomain);
        }

        // Cleanup function to clear the timer when component unmounts
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [formData.subdomain, debouncedCheckSubdomain]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!subdomainStatus.isAvailable) {
            return
        }

        createFundManager(formData, {
            onSuccess: () => {
                setFormData({ name: "", email: "", password: "", subdomain: "" })
                setSubdomainStatus({ isChecking: false, isAvailable: null, error: null })
                onClose()
            },
        })
    }

    const isFormValid =
        formData.name && formData.email && formData.password && formData.subdomain && subdomainStatus.isAvailable === true

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Create Fund Manager</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="relative">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-2 top-11 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-0 flex items-center"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>


                    <div>
                        <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-1">
                            Subdomain
                        </label>

                        <input
                            type="text"
                            id="subdomain"
                            name="subdomain"
                            value={formData.subdomain}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${subdomainStatus.isAvailable === false
                                ? "border-red-300"
                                : subdomainStatus.isAvailable === true
                                    ? "border-green-300"
                                    : "border-gray-300"
                                }`}
                            placeholder="your-subdomain"
                            required
                        />

                        {/* Full URL Preview */}
                        <p className="mt-2 text-sm text-gray-600">
                            Site will be available at:{" "}
                            <span className="font-medium text-gray-800">
                                https://{formData.subdomain || "your-subdomain"}.
                                {import.meta.env.VITE_FRONTEND_URL.replace(/^https?:\/\//, '')}
                            </span>
                        </p>

                        {/* Availability & Errors */}
                        {subdomainStatus.isAvailable === true && (
                            <p className="text-sm text-green-600 mt-1">✓ Subdomain is available</p>
                        )}
                        {subdomainStatus.isAvailable === false && (
                            <p className="text-sm text-red-600 mt-1">✗ Subdomain is not available</p>
                        )}
                        {subdomainStatus.error && <p className="text-sm text-red-600 mt-1">{subdomainStatus.error}</p>}
                    </div>



                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-md font-medium transition bg-gray-200 text-gray-800 hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isFormValid || isCreating}
                            className={`flex-1 px-4 py-2 rounded-md font-medium transition ${isFormValid && !isCreating
                                ? "bg-primary text-white hover:bg-primary/90"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                        >
                            {isCreating ? "Creating..." : "Create Fund Manager"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

