import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ChangePassword() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleChange = (key, value) => {
        setPasswordData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("New passwords do not match!");
        }

        setIsLoading(true);
        try {
            const res = await axios.post("http://localhost:8000/api/user/change-password", passwordData, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });

            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/profile");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred while changing the password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 min-h-[70vh] mt-8">
            <h1 className="text-2xl font-bold mb-4 text-center">Change Password</h1>
            <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col gap-4 max-w-2xl mx-auto"
            >
                <div className="mb-2">
                    <label className="block text-gray-700 font-bold mb-2">Old Password</label>
                    <input
                        type="password"
                        value={passwordData.oldPassword}
                        onChange={(e) => handleChange("oldPassword", e.target.value)}
                        className="rounded w-full py-2 px-3 text-gray-700 leading-tight focus:shadow-outline bg-gray-100"
                    />
                </div>
                <div className="mb-2">
                    <label className="block text-gray-700 font-bold mb-2">New Password</label>
                    <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => handleChange("newPassword", e.target.value)}
                        className="rounded w-full py-2 px-3 text-gray-700 leading-tight focus:shadow-outline bg-gray-100"
                    />
                </div>
                <div className="mb-2">
                    <label className="block text-gray-700 font-bold mb-2">Confirm Password</label>
                    <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        className="rounded w-full py-2 px-3 text-gray-700 leading-tight focus:shadow-outline bg-gray-100"
                    />
                </div>
                <div>
                    <button
                        disabled={isLoading}
                        type="submit"
                        onClick={handleSubmit}
                        className="bg-[#2A3B5F] hover:bg-[#0B1930] transition-all duration-200 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        {isLoading ? "Changing Password..." : "Change Password"}
                    </button>
                </div>
            </form>
        </div>
    );
}