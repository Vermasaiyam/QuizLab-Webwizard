import { useState } from "react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [profilePicture, setProfilePicture] = useState(user.profilePicture);
    const [data, setData] = useState({
        username: user?.username ?? "",
        email: user?.email ?? "",
        profilePicture: profilePicture,
    });

    const handleData = (key, value) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setProfilePicture(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("username", data.username);
        formData.append("email", data.email);
        if (data.profilePicture) {
            formData.append("profilePicture", data.profilePicture);
        }

        try {
            const res = await axios.post('http://localhost:8000/api/user/edit', formData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
            })
            if (res.data.success) {
                const updatedUserData = {
                    ...user,
                    username: res.data.user?.username,
                    email: res.data.user?.email,
                    profilePicture: res.data.user?.profilePicture,
                };
                dispatch(setAuthUser(updatedUserData));
                navigate(`/profile/${user?._id}`);
                toast.success(res.data.message);
            }
            setIsLoading(false);
        } catch (error) {
            toast.error(error.message || "An error occurred while changing the password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 min-h-[70vh] mt-8">
            <h1 className="text-2xl font-bold mb-4 text-center">Edit Profile</h1>
            <div>
                <div className="flex flex-col items-center gap-3">
                    <label className="relative cursor-pointer">
                        <img src={profilePicture || "/user.png"} alt="Profile" className="w-24 h-24 rounded-full object-cover border" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleProfilePictureChange} />
                    </label>
                </div>
            </div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                }}
                className="flex flex-col gap-4 max-w-2xl mx-auto"
            >
                <div className="mb-2">
                    <label htmlFor="displayName" className="block text-gray-700 font-bold mb-2">
                        Name
                    </label>
                    <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        value={data.username}
                        onChange={(e) => handleData("username", e.target.value)}
                        className="rounded w-full py-2 px-3 text-gray-700 leading-tight focus:shadow-outline bg-gray-100"
                    />
                </div>
                <div className="mb-2">
                    <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={data.email}
                        disabled={true}
                        onChange={(e) => handleData("email", e.target.value)}
                        className="rounded w-full py-2 px-3 text-gray-700 leading-tight focus:shadow-outline bg-gray-100"
                    />
                </div>
                <div>
                    <button
                        disabled={isLoading}
                        type="submit"
                        onClick={(e) => {
                            e.preventDefault();
                            handleSubmit();
                        }}
                        className="bg-[#2A3B5F] hover:bg-[#0B1930] transition-all duration-200 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        {isLoading ? "Saving Changes" : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}