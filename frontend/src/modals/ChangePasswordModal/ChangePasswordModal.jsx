import axios from 'axios';
import React, { useState } from 'react';
import { FaCheck } from 'react-icons/fa'; // Only FaCheck is imported now
import Modal from 'react-modal';

const ChangePasswordModal = ({ isOpen, setIsOpen, setUser, darkMode, showMessage, user }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    // isOldPSeen and isNewPSeen states are no longer needed as there's no eye icon to toggle visibility
    const [error, setError] = useState('');
    const [isCurrentPasswordSeen , setIsCurrentPasswordSeen]=useState(false)
    const [isNewPasswordSeen , setIsNewPasswordSeen]=useState(false)

    // Determine if the user is logged in via a social provider (Google or GitHub)
    const isSocialLogin = user && (user.googleId || user.githubId);

    const updatePassword = async () => {
        setError(''); // Clear previous errors
        try {
            const body = {};

            if (!isSocialLogin) {
                // If not a social login, old password is required
                if (!oldPassword.trim()) {
                    setError("Old password is required.");
                    return;
                }
                body.currentPassword = oldPassword;
            }

            if (!newPassword.trim()) {
                setError("New password cannot be empty.");
                return;
            }
            body.newPassword = newPassword;

            const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/settings/updateUserInfo`, body, { withCredentials: true });
            showMessage(response.data.message || 'Password updated successfully!');
            setIsOpen(false);
            setOldPassword("");
            setNewPassword("");
        } catch (err) {
            console.error('Error updating password:', err);
            setError(err.response?.data?.message || 'Failed to update password. Please try again.');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => {
                setIsOpen(false);
                setError(''); // Clear error on close
                setOldPassword("");
                setNewPassword("");
                setIsCurrentPasswordSeen(false)
                setIsNewPasswordSeen(false)
            }}
            shouldCloseOnOverlayClick={true}
            shouldCloseOnEsc={true}
            className={`w-[90vw] sm:w-96 md:w-180 max-w-md sm:max-w-lg h-auto select-none ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-3 sm:p-5 rounded-xl shadow-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none mx-4 sm:mx-0`}
            overlayClassName={`fixed inset-0 bg-gray-500/50 z-50 flex justify-center items-center px-4 sm:px-0`}
        >
            <div className="flex w-full h-full flex-col gap-3 sm:gap-5 justify-center items-center">
                {!isSocialLogin && (
                    <div className={`w-full relative h-10 sm:h-12 border ${darkMode ? 'border-neutral-600' : 'border-neutral-300'} px-2 sm:px-3 flex items-center rounded-md`}>
                        <input
                            type={isCurrentPasswordSeen?"text":"password"} // Always password type, no toggle
                            className={`flex-1 outline-none rounded-md bg-transparent text-sm sm:text-base ${darkMode ? 'text-white' : 'text-black'}`}
                            placeholder='Enter Old Password'
                            value={oldPassword}
                            onChange={({ target }) => setOldPassword(target.value)}
                        />
                        {/* Removed eye/eye-slash icons and their click handler */}
                        {oldPassword.trim() && <FaCheck onClick={()=>{setIsCurrentPasswordSeen(prev=>!prev)}} className={`${isCurrentPasswordSeen?"text-green-500":"text-red-500"} ml-2 cursor-pointer text-sm sm:text-base`} />} {/* Added margin for spacing */}
                    </div>
                )}
                <div className={`w-full relative h-10 sm:h-12 border ${darkMode ? 'border-neutral-600' : 'border-neutral-300'} px-2 sm:px-3 flex items-center rounded-md`}>
                    <input
                        type={isNewPasswordSeen?"text":"password"} // Always password type, no toggle
                        className={`flex-1 outline-none rounded-md bg-transparent text-sm sm:text-base ${darkMode ? 'text-white' : 'text-black'}`}
                        placeholder='Enter New Password'
                        value={newPassword}
                        onChange={({ target }) => setNewPassword(target.value)}
                    />
                    {/* Removed eye/eye-slash icons and their click handler */}
                    {newPassword.trim() && <FaCheck onClick={()=>{setIsNewPasswordSeen(prev=>!prev)}} className={`${isNewPasswordSeen?"text-green-500":"text-red-500"} ml-2 cursor-pointer text-sm sm:text-base`} />} {/* Added margin for spacing */}
                </div>
                {error && <div className="text-red-500 text-xs sm:text-sm px-1">{error}</div>}
                <div
                    onClick={updatePassword}
                    className="w-full h-10 sm:h-12 flex justify-center items-center bg-blue-600 text-white text-sm sm:text-base rounded-md cursor-pointer hover:bg-blue-700 transition-colors duration-300"
                >
                    Update
                </div>
            </div>
        </Modal>
    );
};

export default ChangePasswordModal;