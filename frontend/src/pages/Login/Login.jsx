import React, { useState, useEffect } from 'react';
import { FaGoogle, FaGithub } from "react-icons/fa"; // Removed FaUser, LuUserPlus as they aren't used in login form
import { MdOutlineEmail } from "react-icons/md";
import { IoLockClosedOutline } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import axios from 'axios'; // <-- Make sure to import axios

Modal.setAppElement('#root');

const Login = ({setTrigger}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState(""); // For displaying errors to the user

    // OAuth handlers remain the same
    const handleSignUpWithGoogle = () => {
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
    };

    const handleSignUpWithGithub = () => {
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/github`;
    };

    // --- THIS IS THE KEY NEW/MODIFIED PART FOR LOCAL LOGIN ---
    const handleLocalLogin = async (event) => {
        event.preventDefault(); // <-- Stop the default HTML form submission

        setErrorMessage(""); // Clear any previous error messages

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/login`, {
                // Axios will automatically stringify this JavaScript object into JSON
                // and set the 'Content-Type: application/json' header.
                email,
                password
            }, {
                withCredentials: true // <-- Essential for sending and receiving session cookies
            });

            // If the login is successful (status 200), navigate to home
            if (response.status === 200) {
                setTrigger(prev=>prev+1)
                navigate('/home');
            }else if (response.status===400 ||401 ||500){
                navigate('/')
            }
        } catch (error) {
            console.error("Login failed:", error);
            if (error.response) {
                // The server responded with a status code other than 2xx (e.g., 400, 401, 500)
                setErrorMessage(error.response.data.message || "Login failed. Please try again.");
            } else if (error.request) {
                // The request was made but no response was received (e.g., network error)
                setErrorMessage("No response from server. Please check your network connection.");
            } else {
                // Something else happened in setting up the request
                setErrorMessage("An unexpected error occurred.");
            }
        }
    };
    // -------------------------------------------------------------

    return (
        <div className='w-screen p-4 lg:p-10 text-white min-h-screen flex justify-center items-center'>
            <div className='h-auto lg:h-100 shadow-2xl text-black border border-gray-300 p-4 lg:p-10 rounded-xl w-[90vw] lg:w-150 flex flex-col'>
                {/* Social Sign-up/Login part */}
                <div className="w-full h-20 border-b pb-2 flex flex-col items-center justify-center border-gray-200">
                    <div>
                        Login with: {/* Changed text from "Register with" to "Login with" */}
                    </div>
                    <div className='flex gap-3 mt-3'>
                        <button type="button" onClick={handleSignUpWithGoogle} className='w-32 h-9 transform transition-all duration-200 hover:scale-105 rounded-md bg-gray-500/30 px-16 flex justify-center items-center gap-2'>
                            <FaGoogle /> Google
                        </button>
                        <button type="button" onClick={handleSignUpWithGithub} className='w-32 h-9 transform transition-all duration-200 hover:scale-105 rounded-md bg-gray-500/30 px-16 flex justify-center items-center gap-2'>
                            <FaGithub /> Github
                        </button>
                    </div>
                </div>

                {/* Local Login Form - MODIFIED */}
                <form
                    onSubmit={handleLocalLogin} // <-- IMPORTANT: Added this handler to control submission
                    className='w-full flex flex-1 flex-col' // Adjusted for better flex behavior if needed
                >
                    <div className="flex flex-col w-full h-full">
                        {/* Email Input */}
                        <div className='w-full h-15 flex flex-col mt-4 lg:mt-2'>
                            <div className='mb-1'>Email</div>
                            <div className='flex h-full bg-gray-500/30 rounded-md'>
                                <div className='w-10 h-full flex justify-center items-center'><MdOutlineEmail /></div>
                                <input
                                    type="email"
                                    name="email" // Keep for autofill/accessibility, but value is from state
                                    value={email}
                                    onChange={({ target }) => setEmail(target.value)}
                                    className='w-full outline-none h-full text-sm rounded-r-md px-2 bg-transparent' // Added bg-transparent for consistency
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className='w-full h-15 flex flex-col mt-4 lg:mt-2'>
                            <div className='mb-1'>Password</div>
                            <div className='flex h-full bg-gray-500/30 rounded-md'>
                                <div className='w-10 font-bold h-full flex justify-center items-center'><IoLockClosedOutline /></div>
                                <input
                                    type="password"
                                    name="password" // Keep for autofill/accessibility, but value is from state
                                    value={password}
                                    onChange={({ target }) => setPassword(target.value)}
                                    className='w-full outline-none h-full text-sm rounded-r-md px-2 bg-transparent' // Added bg-transparent for consistency
                                    required
                                />
                            </div>
                        </div>

                        {/* Display error message */}
                        {errorMessage && (
                            <div className="text-red-600 text-sm mt-3 text-center">
                                {errorMessage}
                            </div>
                        )}

                        {/* Login Button */}
                        <div className='w-full flex-1 mt-6'>
                            <button
                                type='submit' // This button now triggers `handleLocalLogin` via form's onSubmit
                                className='w-full bg-gradient-to-b transform transition-all duration-200 hover:scale-105 from-blue-600 to-blue-500 h-8 rounded-md flex justify-center items-center font-bold text-white'
                            >
                                Login {/* Changed button text from "Sign Up" to "Login" */}
                            </button>
                            <div className='w-full flex items-center justify-center mt-5 text-black hover:text-blue-600 transition-all duration-200'>
                                <p className=''>
                                    <Link to="/">Don't have an account? Sign Up</Link> {/* Changed link text */}
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;