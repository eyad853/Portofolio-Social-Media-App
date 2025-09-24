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
        {/* Sidebar - Enhanced */}
        <div className={`w-full lg:w-1/5 pt-4 sm:pt-6 h-auto lg:h-screen border-b lg:border-r lg:border-b-0 ${
            darkMode 
                ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-700' 
                : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'
        } shadow-xl lg:shadow-2xl backdrop-blur-sm`}>
            <div className='flex text-2xl sm:text-3xl lg:text-4xl font-bold justify-center mb-6 sm:mb-8 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent'>
                Circle
            </div>

            {/* Navigation - Enhanced with icons and animations */}
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 px-3 lg:px-0">
                <div className={`w-28 sm:w-36 lg:w-full h-14 lg:h-[10vh] flex-shrink-0 relative flex justify-center items-center font-semibold text-sm sm:text-base lg:text-xl transition-all duration-300 hover:scale-105 ${
                    darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-blue-50'
                } cursor-pointer rounded-xl lg:rounded-r-none lg:rounded-l-xl group`}>
                    <Link to={`/home`} className='absolute inset-0'/>
                    <span className="group-hover:text-blue-500 transition-colors">📱 Feed</span>
                </div>
                <div className={`w-28 sm:w-36 lg:w-full h-14 lg:h-[10vh] flex-shrink-0 relative flex justify-center items-center font-semibold text-sm sm:text-base lg:text-xl transition-all duration-300 hover:scale-105 ${
                    darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-purple-50'
                } cursor-pointer rounded-xl lg:rounded-r-none lg:rounded-l-xl group`}>
                    <Link to={`/home/profile/${user._id}`} className='absolute inset-0'/>
                    <span className="group-hover:text-purple-500 transition-colors">👤 Profile</span>
                </div>
                <div className={`w-28 sm:w-36 lg:w-full h-14 lg:h-[10vh] flex-shrink-0 relative flex justify-center items-center font-semibold text-sm sm:text-base lg:text-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white cursor-pointer rounded-xl lg:rounded-r-none lg:rounded-l-xl shadow-lg hover:shadow-xl transform hover:scale-105`}>
                    <Link to={`/home/settings`} className='absolute inset-0'/>
                    <span>⚙️ Settings</span>
                </div>
                <div className={`w-32 sm:w-40 lg:w-full h-14 lg:h-[10vh] flex-shrink-0 relative flex justify-center items-center font-semibold text-sm sm:text-base lg:text-xl transition-all duration-300 hover:scale-105 ${
                    darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-yellow-50'
                } cursor-pointer rounded-xl lg:rounded-r-none lg:rounded-l-xl group`}>
                    <Link to={`/home/notification`} className='absolute inset-0'/>
                    <span className="lg:hidden group-hover:text-yellow-500 transition-colors">🔔 Notif</span>
                    <span className="hidden lg:inline group-hover:text-yellow-500 transition-colors">🔔 Notifications</span>
                </div>
                <div className={`w-28 sm:w-36 lg:w-full h-14 lg:h-[10vh] flex-shrink-0 relative flex justify-center items-center font-semibold text-sm sm:text-base lg:text-xl transition-all duration-300 hover:scale-105 ${
                    darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-green-50'
                } cursor-pointer rounded-xl lg:rounded-r-none lg:rounded-l-xl group`}>
                    <Link to={`/home/friends`} className='absolute inset-0'/>
                    <span className="group-hover:text-green-500 transition-colors">👥 Friends</span>
                </div>
            </div>
        </div>

        {/* Main Content - Enhanced */}
        <div className={`flex-1 overflow-auto ${
            darkMode 
                ? 'text-white bg-gradient-to-br from-slate-900 to-slate-800' 
                : 'bg-gradient-to-br from-gray-50 to-blue-50'
        }`}>
            {/* Message Box - Enhanced */}
            {isMessageVisible && (
                <div className="fixed top-16 sm:top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 sm:px-6 py-3 rounded-xl shadow-2xl z-50 text-sm sm:text-base font-medium backdrop-blur-sm border border-white/20 animate-pulse">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">✅</span>
                        {message}
                    </div>
                </div>
            )}

            <div className="w-full h-full flex overflow-auto">
                {/* Settings Content - Enhanced */}
                <div className={`overflow-auto py-6 sm:py-8 px-6 sm:px-8 lg:px-12 flex-1 ${
                    darkMode ? 'bg-slate-900/50' : 'bg-white/50'
                } backdrop-blur-sm`}>
                    <div className='w-full h-full max-w-4xl mx-auto'>

                        {/* Header */}
                        <div className="mb-8 sm:mb-12">
                            <div className="font-bold text-3xl sm:text-4xl lg:text-5xl mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Account Settings
                            </div>
                            <div className={`text-sm sm:text-base ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                Manage your account preferences and security settings
                            </div>
                        </div>

                        {/* Profile Section - Enhanced */}
                        <div className={`${
                            darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
                        } rounded-2xl border p-6 sm:p-8 mb-8 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300`}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                                {/* Profile Picture - Enhanced */}
                                <div className="relative group">
                                    <div className={`w-28 h-28 sm:w-36 sm:h-36 cursor-pointer rounded-full relative border-4 ${
                                        darkMode ? 'border-slate-600' : 'border-gray-300'
                                    } overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105`}>
                                        <input
                                            type="file"
                                            name="avatar"
                                            className='absolute inset-0 opacity-0 cursor-pointer z-10'
                                            onChange={handleImageChange}
                                        />
                                        {user && user?.avatar ? (
                                            <img src={user.avatar} className='w-full h-full object-cover' alt="User Avatar" />
                                        ) : (
                                            <div className={`w-full h-full flex justify-center items-center ${
                                                darkMode ? 'bg-slate-700' : 'bg-gray-100'
                                            }`}>
                                                <FaUser size={window.innerWidth < 640 ? 80 : 110} className={darkMode ? 'text-slate-400' : 'text-gray-400'} />
                                            </div>
                                        )}
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">📷 Change Photo</span>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                        <MdEdit className="text-white text-sm" />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="font-bold text-xl sm:text-2xl mb-2">Profile Information</div>
                                    <div className={`text-sm sm:text-base ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                        Update your profile picture and personal details
                                    </div>
                                </div>
                            </div>

                            {/* User Info Section - Enhanced */}
                            <div className="space-y-6">
                                {/* Username Row - Enhanced */}
                                <div className={`${
                                    darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'
                                } rounded-xl border p-4 sm:p-6 hover:shadow-lg transition-all duration-300`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <div className="font-semibold text-base sm:text-lg flex items-center gap-2">
                                                <span>👤</span> Username
                                            </div>
                                            <div className="text-blue-600 font-medium text-lg">{user?.username}</div>
                                        </div>
                                        <div
                                            onClick={() => setIsNameModalOpen(true)}
                                            className={`w-10 h-10 sm:w-12 sm:h-12 flex justify-center cursor-pointer rounded-full transition-all duration-300 ${
                                                darkMode ? 'hover:bg-slate-600 border-slate-500' : 'hover:bg-blue-100 border-blue-200'
                                            } border-2 items-center group hover:scale-110`}>
                                            <MdEdit className='cursor-pointer text-lg group-hover:text-blue-500 transition-colors' />
                                        </div>
                                    </div>
                                </div>

                                {/* Email Row - Enhanced */}
                                <div className={`${
                                    darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'
                                } rounded-xl border p-4 sm:p-6 hover:shadow-lg transition-all duration-300`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <div className="font-semibold text-base sm:text-lg flex items-center gap-2">
                                                <span>📧</span> Email
                                            </div>
                                            <div className="text-blue-600 font-medium text-sm sm:text-base break-all sm:break-normal">{user?.email}</div>
                                        </div>
                                        <div
                                            onClick={() => setIsEmailModalOpen(true)}
                                            className={`w-10 h-10 sm:w-12 sm:h-12 flex justify-center cursor-pointer rounded-full transition-all duration-300 ${
                                                darkMode ? 'hover:bg-slate-600 border-slate-500' : 'hover:bg-blue-100 border-blue-200'
                                            } border-2 items-center group hover:scale-110`}>
                                            <MdEdit className='cursor-pointer text-lg group-hover:text-blue-500 transition-colors' />
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons - Enhanced */}
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <div
                                        onClick={() => setIsPasswordModalOpen(true)}
                                        className="flex-1 min-w-48 flex justify-center items-center cursor-pointer transform hover:scale-105 transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-12 sm:h-14 rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl">
                                        🔐 Change Password
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone - Enhanced */}
                        <div className={`${
                            darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
                        } rounded-2xl border p-6 sm:p-8 mb-8 shadow-xl backdrop-blur-sm`}>
                            <div className="mb-6">
                                <div className="font-bold text-xl sm:text-2xl mb-2 text-red-600 flex items-center gap-2">
                                    ⚠️ Danger Zone
                                </div>
                                <div className={`text-sm sm:text-base ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                                    These actions cannot be undone. Please proceed with caution.
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div
                                    onClick={handleDeleteAccount}
                                    className="flex-1 flex justify-center items-center cursor-pointer transform hover:scale-105 transition-all duration-300 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white h-12 sm:h-14 rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl">
                                    🗑️ Delete Account
                                </div>
                                <div
                                    onClick={handleLogout}
                                    className="flex-1 flex justify-center items-center cursor-pointer transform hover:scale-105 transition-all duration-300 border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white h-12 sm:h-14 rounded-xl font-semibold text-sm sm:text-base ">
                                    🚪 Logout
                                </div>
                            </div>
                        </div>

                        {/* Display Settings - Enhanced */}
                        <div className={`${
                            darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
                        } rounded-2xl border p-6 sm:p-8 mb-8 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300`}>
                            <div className="mb-6">
                                <div className="font-bold text-xl sm:text-2xl mb-2 flex items-center gap-2">
                                    🎨 Display Settings
                                </div>
                                <div className={`text-sm sm:text-base ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                    Customize your visual experience
                                </div>
                            </div>
                            
                            <div className={`${
                                darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'
                            } rounded-xl border p-4 sm:p-6`}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="font-semibold text-base sm:text-lg flex items-center gap-2">
                                            {darkMode ? '🌙' : '☀️'} Dark Mode
                                        </div>
                                        <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                            {darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                                        </div>
                                    </div>
                                    <div
                                        onClick={handleDarkModeToggle}
                                        className={`w-16 sm:w-20 h-8 sm:h-10 rounded-full relative cursor-pointer transition-all duration-500 shadow-inner ${
                                            darkMode 
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/50' 
                                                : 'bg-gradient-to-r from-gray-300 to-gray-400 shadow-gray-300/50'
                                        } hover:shadow-lg`}>
                                        <div className={`absolute top-1 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-white shadow-lg transition-all duration-500 flex items-center justify-center ${
                                            darkMode 
                                                ? 'left-[36px] sm:left-[44px] transform rotate-180' 
                                                : 'left-1 transform rotate-0'
                                        }`}>
                                            <span className="text-xs">
                                                {darkMode ? '🌙' : '☀️'}
                                            </span>
                                        </div>
                                    </div>
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