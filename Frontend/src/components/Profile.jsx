import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import useGetUserProfile from '../hooks/getUserProfile';
import { Loader2 } from 'lucide-react';

const Profile = () => {
    const params = useParams();
    const userId = params.id;

    useGetUserProfile(userId);

    const { user } = useSelector(store => store.auth);

    if (!user) {
        return (
            <p className="min-w-full min-h-[80vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10" />
            </p>
        );
    }

    const formattedDate = user?.createdAt ? user.createdAt.toDate().toLocaleDateString() : '';

    return (
        <div className="min-h-[70vh] w-full items-center grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4">
            <div className="flex flex-col items-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">My Profile</h1>
                <img src={user?.profilePicture || '/user.png'} alt="Profile Picture" className="rounded-full w-52 h-52 mx-auto" />
                <Link to={`edit`}>
                    <button className="bg-[#2A3B5F] hover:bg-[#0B1930] transition-all duration-200 text-white py-2 px-4 rounded mt-4">
                        Edit Profile
                    </button>
                </Link>
            </div>

            <div className="flex flex-col gap-2">
                <div className="mb-4">
                    <p className="block text-gray-700 text-2xl font-bold mb-2">Full Name:</p>
                    <p className="text-gray-900 text-xl font-normal">{user?.username}</p>
                </div>
                <div className="mb-4">
                    <p className="block text-gray-700 text-2xl font-bold mb-2">Email:</p>
                    <p className="text-gray-900 text-xl font-normal">{user?.email}</p>
                </div>
                <div className="mb-4">
                    <p className="block text-gray-700 text-2xl font-bold mb-2">Joined On:</p>
                    <p className="text-gray-900 text-xl font-normal">{formattedDate || 'N/A'}</p>
                </div>

                <div className="flex space-x-4">
                    <Link to={'/history'}>
                        <button className="bg-[#2A3B5F] hover:bg-[#0B1930] transition-all duration-200 text-white font-bold py-2 px-4 rounded">
                            History
                        </button>
                    </Link>
                    <Link to={'/change-password'}>
                        <button className="bg-[#2A3B5F] hover:bg-[#0B1930] transition-all duration-200 text-white font-bold py-2 px-4 rounded">
                            Change Password
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Profile;