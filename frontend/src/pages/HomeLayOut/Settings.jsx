import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { MdEdit } from 'react-icons/md';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import ChangeEmailModal from '../../modals/ChangeEmailModal/ChangeEmailModal';
import ChangeNameModal from '../../modals/ChangeNameModal/ChangeNameModal';
import ChangePasswordModal from '../../modals/ChangePasswordModal/ChangePasswordModal';

const SettingsPage = ({ darkMode, setUser, user, setDarkMode , privateAccount,setPrivateAccount,hiddenSeen,setHiddenSeen }) => {
    const [isNameModalOpen, setIsNameModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [message, setMessage] = useState(''); // For success/error messages
    const [isMessageVisible, setIsMessageVisible] = useState(false); // To control message visibility
    const navigate = useNavigate();

    // Function to display messages
    const showMessage = (msg) => {
        setMessage(msg);
        setIsMessageVisible(true);
        setTimeout(() => {
            setIsMessageVisible(false);
            setMessage('');
        }, 3000); // Message disappears after 3 seconds
    };

    // Handle profile image upload
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file); // 'profileImage' should match your backend's expected field name

        try {
            // Assuming your backend /settings/updateUserInfo can handle multipart/form-data for image upload
            const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/settings/updateUserInfo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });
            // Assuming the backend returns the updated user object with the new avatar URL
            setUser(prevUser => ({ ...prevUser, avatar: response.data.user.avatar }));
            showMessage('Profile image updated successfully!');
        } catch (error) {
            console.error('Error updating profile image:', error);
            showMessage(`Error updating profile image: ${error.response?.data?.message || error.message}`);
        }
    };

    // Handle delete account
    const handleDeleteAccount = async () => {
            try {
              setUser(null); // Clear user state
              setDarkMode(false); // Reset dark mode
                await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/settings/deleteAccount`, { withCredentials: true });
                showMessage('Account deleted successfully!');
                navigate('/signup')
            } catch (error) {
                console.error('Error deleting account:', error);
                showMessage(`Error deleting account: ${error.response?.data?.message || error.message}`);
            }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
          setUser(null); // Clear user state
          setDarkMode(false); // Reset dark mode
          await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/settings/logoutAccount`, { withCredentials: true });
          showMessage('Logged out successfully!');
          navigate('/login')
        } catch (error) {
            console.error('Error logging out:', error);
            showMessage(`Error logging out: ${error.response?.data?.message || error.message}`);
        }
    };

    // Handle dark mode toggle
    const handleDarkModeToggle = async () => {
        const newDarkModeState = !darkMode;
        try {
          setDarkMode(prev=>!prev); // Update state instantly
          showMessage(`Dark mode ${newDarkModeState ? 'enabled' : 'disabled'}`);
            await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/settings/darkMode`, { darkMode: newDarkModeState }, { withCredentials: true });
        } catch (error) {
            console.error('Error updating dark mode:', error);
            showMessage(`Error updating dark mode: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className="w-screen h-screen overflow-auto flex flex-col lg:flex-row">
            {/* Sidebar - Responsive */}
            <div className={`w-full lg:w-1/5 pt-2 sm:pt-4 h-auto lg:h-screen border-b lg:border-r lg:border-b-0 ${darkMode?"bg-neutral-700 text-white border-neutral-600":'bg-neutral-100 border-neutral-300'} shadow-lg lg:shadow-2xl`}>
                <div className='flex text-2xl sm:text-3xl lg:text-4xl font-bold justify-center mb-2 sm:mb-4'>Circle</div>

                {/* Navigation - Mobile horizontal scroll, Desktop vertical */}
                <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 px-2 lg:px-0">
                    <div className={`w-24 sm:w-32 lg:w-full h-12 lg:h-[10vh] flex-shrink-0 relative flex justify-center items-center font-semibold text-sm sm:text-lg lg:text-2xl transition-all duration-300 ${darkMode?"hover:bg-gray-700":"hover:bg-neutral-200"} cursor-pointer rounded lg:rounded-none`}>
                        <Link to={`/home`} className='absolute inset-0'/>
                        Feed
                    </div>
                    <div className={`w-24 sm:w-32 lg:w-full h-12 lg:h-[10vh] flex-shrink-0 relative flex justify-center items-center font-semibold text-sm sm:text-lg lg:text-2xl transition-all duration-300 ${darkMode?"hover:bg-gray-700":"hover:bg-neutral-200"} cursor-pointer rounded lg:rounded-none`}>
                        <Link to={`/home/profile/${user._id}`} className='absolute inset-0'/>
                        Profile
                    </div>
                    <div className={`w-24 sm:w-32 lg:w-full h-12 lg:h-[10vh] flex-shrink-0 relative flex justify-center items-center font-semibold text-sm sm:text-lg lg:text-2xl transition-all duration-300 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer rounded lg:rounded-none`}>
                        <Link to={`/home/settings`} className='absolute inset-0'/>
                        Settings
                    </div>
                    <div className={`w-32 sm:w-36 lg:w-full h-12 lg:h-[10vh] flex-shrink-0 relative flex justify-center items-center font-semibold text-sm sm:text-lg lg:text-2xl transition-all duration-300 ${darkMode?"hover:bg-gray-700":"hover:bg-neutral-200"} cursor-pointer rounded lg:rounded-none`}>
                        <Link to={`/home/notification`} className='absolute inset-0'/>
                        <span className="lg:hidden">Notif</span>
                        <span className="hidden lg:inline">Notifications</span>
                    </div>
                    <div className={`w-24 sm:w-32 lg:w-full h-12 lg:h-[10vh] flex-shrink-0 relative flex justify-center items-center font-semibold text-sm sm:text-lg lg:text-2xl transition-all duration-300 ${darkMode?"hover:bg-gray-700":"hover:bg-neutral-200"} cursor-pointer rounded lg:rounded-none`}>
                        <Link to={`/home/friends`} className='absolute inset-0'/>
                        Friends
                    </div>
                </div>
            </div>

            {/* Main Content - Responsive */}
            <div className={`flex-1 overflow-auto ${darkMode ? 'text-white' : ''}`}>
                {/* Message Box - Responsive positioning */}
                {isMessageVisible && (
                    <div className="fixed top-16 sm:top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 sm:px-4 py-2 rounded-md shadow-lg z-50 text-sm sm:text-base">
                        {message}
                    </div>
                )}

                <div className="w-full h-full flex overflow-auto">
                    {/* Settings Content - Responsive */}
                    <div className={`overflow-auto py-3 sm:py-5 px-4 sm:px-6 lg:px-10 flex-1 ${darkMode ? 'bg-neutral-800' : 'bg-white'}`}>
                        <div className='w-full h-full'>

                            {/* Account Settings */}
                            <div className="">
                                <div className="font-bold text-2xl sm:text-3xl mb-4 sm:mb-6">Account Settings</div>

                                {/* Profile Picture - Responsive */}
                                <div className={`w-24 h-24 sm:w-32 sm:h-32 cursor-pointer rounded-full relative border border-neutral-300 mb-4 sm:mb-6`}>
                                    <input
                                        type="file"
                                        name="avatar"
                                        className='absolute inset-0 opacity-0 cursor-pointer'
                                        onChange={handleImageChange}
                                    />
                                    {user && user?.avatar ? (
                                        <img src={user.avatar} className='w-full h-full rounded-full object-cover' alt="User Avatar" />
                                    ) : (
                                        <div className='w-full text-2xl sm:text-3xl h-full cursor-pointer overflow-hidden flex justify-center items-end mt-1 rounded-full '>
                                            <FaUser size={window.innerWidth < 640 ? 80 : 110} />
                                        </div>
                                    )}
                                </div>

                                {/* User Info Section - Responsive */}
                                <div className="flex flex-col gap-3 sm:gap-4">
                                    <div className="font-semibold text-lg sm:text-xl">User Info</div>
                                    
                                    {/* Username Row */}
                                    <div className="flex flex-col sm:flex-row sm:ml-5 font-medium sm:items-center gap-1 sm:gap-0">
                                        <div className="text-sm sm:text-base">UserName :</div>
                                        <div className="flex items-center">
                                            <div className="text-blue-600 text-sm sm:text-base ml-0 sm:ml-0.5">{user?.username}</div>
                                            <div
                                                onClick={() => setIsNameModalOpen(true)}
                                                className={`w-8 h-8 sm:w-10 sm:h-10 flex justify-center cursor-pointer rounded-full transition-all duration-300 ${darkMode ? 'hover:bg-neutral-900' : 'hover:bg-neutral-200'} items-center ml-1`}>
                                                <MdEdit className='cursor-pointer text-sm sm:text-base' />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email Row */}
                                    <div className="flex flex-col sm:flex-row sm:ml-5 font-medium sm:items-center gap-1 sm:gap-0">
                                        <div className="text-sm sm:text-base">Email :</div>
                                        <div className="flex items-center">
                                            <div className="text-blue-600 text-sm sm:text-base ml-0 sm:ml-0.5 break-all sm:break-normal">{user?.email}</div>
                                            <div
                                                onClick={() => setIsEmailModalOpen(true)}
                                                className={`w-8 h-8 sm:w-10 sm:h-10 flex justify-center cursor-pointer rounded-full transition-all duration-300 ${darkMode ? 'hover:bg-neutral-900' : 'hover:bg-neutral-200'} items-center ml-1`}>
                                                <MdEdit className='cursor-pointer text-sm sm:text-base' />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons - Responsive */}
                                    <div className="flex flex-col sm:flex-row sm:ml-5 gap-3 sm:gap-4 mt-2">
                                        <div
                                            onClick={() => setIsPasswordModalOpen(true)}
                                            className="w-full sm:w-40 flex justify-center items-center cursor-pointer transform hover:scale-105 transition-all duration-300 hover:bg-blue-600 hover:text-white h-10 sm:h-12 rounded-md border-2 border-blue-600 text-sm sm:text-base">
                                            Change Password
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:ml-5 gap-3 sm:gap-4">
                                        <div
                                            onClick={handleDeleteAccount}
                                            className="w-full sm:w-40 flex justify-center items-center cursor-pointer transform hover:scale-105 transition-all duration-300 hover:bg-red-600 hover:text-white h-10 sm:h-12 rounded-md border-2 border-red-600 text-sm sm:text-base">
                                            Delete Account
                                        </div>
                                        <div
                                            onClick={handleLogout}
                                            className="w-full sm:w-40 flex justify-center items-center cursor-pointer transform hover:scale-105 transition-all duration-300 hover:bg-red-600 hover:text-white h-10 sm:h-12 rounded-md border-2 border-red-600 text-sm sm:text-base">
                                            Logout
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Display Settings - Responsive */}
                            <div className="mt-8 sm:mt-10 pb-6 sm:pb-10">
                                <div className="font-bold text-2xl sm:text-3xl mb-4">Display Settings</div>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-1 sm:items-center">
                                    <div className="font-bold text-sm sm:text-base">Dark Mode :</div>
                                    <div
                                        onClick={handleDarkModeToggle}
                                        className={`w-12 sm:w-16 border border-neutral-300 h-5 sm:h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${darkMode ? 'bg-blue-600' : 'bg-neutral-400'}`}
                                    >
                                        <div className={`absolute h-full w-5 sm:w-6 rounded-full bg-white shadow-md transition-all duration-300 ${darkMode ? 'left-[28px] sm:left-[40px]' : 'left-0'}`}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Modals */}
                <ChangeNameModal 
                isOpen={isNameModalOpen} 
                setUser={setUser} 
                setIsOpen={setIsNameModalOpen} 
                darkMode={darkMode} 
                showMessage={showMessage} />
                
                <ChangeEmailModal 
                isOpen={isEmailModalOpen} 
                setUser={setUser} 
                setIsOpen={setIsEmailModalOpen} 
                darkMode={darkMode} 
                showMessage={showMessage} />
                
                <ChangePasswordModal 
                user={user} 
                isOpen={isPasswordModalOpen} 
                setUser={setUser} 
                setIsOpen={setIsPasswordModalOpen}
                darkMode={darkMode} 
                showMessage={showMessage} />
            </div>
        </div>
    );
};

export default SettingsPage;