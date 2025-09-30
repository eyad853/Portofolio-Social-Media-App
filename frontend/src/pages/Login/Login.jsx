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
    const [error, setError] = useState(""); // For displaying errors to the user
    const [loadings , setLoadings]=useState(false)


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

        setError(""); // Clear any previous error messages

        try {
            setLoadings(true)
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
                setError(error.response.data.message || "Login failed. Please try again.");
        }finally{
            setLoadings(false)
        }
    };
    // -------------------------------------------------------------

    return (
        <div className='w-full h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex justify-center items-center p-2 sm:p-4'>
                <div className='bg-white shadow-2xl rounded-2xl overflow-hidden w-full max-w-5xl flex flex-col lg:flex-row lg:min-h-[400px]'>
                    
                    {/* Left side - Ecommerce Image */}
                    <div className='w-full lg:w-1/2 h-48 sm:h-64 lg:h-auto lg:flex-1 bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-900 relative overflow-hidden lg:flex-shrink-0'>
                        <div className='absolute inset-0 bg-black/20'></div>
                        <div className='relative z-10 h-full flex flex-col justify-center items-center text-white p-4 sm:p-8'>
                            <div className='text-center mb-4 sm:mb-8'>
                                <h1 className='text-xl sm:text-2xl lg:text-4xl font-bold mb-2 sm:mb-4'>Join Our Community</h1>
                                <p className='text-sm sm:text-base lg:text-lg opacity-90'>Discover new friends and start sharing today</p>
                            </div>
                            
                            {/* Ecommerce Icons/Graphics */}
                            <div className='flex items-center space-x-4 sm:space-x-8 text-3xl sm:text-5xl lg:text-7xl opacity-80'>
                                <div className='transform hover:scale-110 transition-transform duration-300'>👥</div>
                                <div className='transform hover:scale-110 transition-transform duration-300'>💬</div>
                                <div className='transform hover:scale-110 transition-transform duration-300'>🌐</div>
                                <div className='transform hover:scale-110 transition-transform duration-300'>📸</div>
                            </div>
                            
                            {/* Floating elements */}
                            <div className='absolute top-20 left-10 w-3 h-3 bg-white/30 rounded-full animate-pulse'></div>
                            <div className='absolute bottom-32 right-16 w-2 h-2 bg-white/40 rounded-full animate-pulse delay-300'></div>
                            <div className='absolute top-40 right-8 w-4 h-4 bg-white/20 rounded-full animate-pulse delay-700'></div>
                        </div>
                    </div>
        
                    {/* Right side - Signup Form */}
                    <div className='w-full lg:w-1/2 flex flex-col justify-center p-4 sm:p-6 lg:p-8 lg:h-full'>
                        
                        {/* Header */}
                        <div className='text-center mb-3 lg:mb-4'>
                            <h2 className='text-xl sm:text-2xl lg:text-2xl font-bold text-gray-800 mb-1 lg:mb-2'>Log In Account</h2>
                            <p className='text-sm sm:text-base lg:text-sm text-gray-600'>Login and to connect and share your world</p>
                        </div>
        
                        {/* Social Sign-up */}
                        <div className="mb-3 lg:mb-4 pb-3 lg:pb-4 border-b border-gray-200">
                            <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
                                <button
                                    type="button"
                                    onClick={handleSignUpWithGoogle}
                                    className='flex-1 h-10 sm:h-10 py-1 transform transition-all duration-200 hover:scale-105 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white flex justify-center items-center gap-2 shadow-md hover:shadow-lg text-sm font-medium'
                                >
                                    <FaGoogle />
                                    Google
                                </button>
        
                                <button
                                    type="button"
                                    onClick={handleSignUpWithGithub}
                                    className='flex-1 h-10 sm:h-10 py-1 transform transition-all duration-200 hover:scale-105 rounded-lg bg-gradient-to-r from-gray-700 to-gray-800 text-white flex justify-center items-center gap-2 shadow-md hover:shadow-lg text-sm font-medium'
                                >
                                    <FaGithub />
                                    Github
                                </button>
                            </div>
                        </div>
        
                        {/* Normal Signup Form */}
                        <form onSubmit={handleLocalLogin} encType="multipart/form-data" className='flex-1 space-y-2 lg:space-y-3'>
                            {/* Email Input */}
                            <div>
                                <label className='block text-xs sm:text-sm lg:text-xs font-semibold text-gray-700 mb-1'>Email Address</label>
                                <div className='relative'>
                                    <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
                                        <MdOutlineEmail size={16} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={({ target }) => setEmail(target.value)}
                                        className='w-full pl-10 pr-4 py-2 lg:py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 text-sm'
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>
        
                            {/* Password Input */}
                            <div>
                                <label className='block text-xs sm:text-sm lg:text-xs font-semibold text-gray-700 mb-1'>Password</label>
                                <div className='relative'>
                                    <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
                                        <IoLockClosedOutline size={16} />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={password}
                                        onChange={({ target }) => setPassword(target.value)}
                                        className='w-full pl-10 pr-4 py-2 lg:py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 text-sm'
                                        placeholder="Create a password"
                                        required
                                    />
                                </div>
                            </div>
        
                            {/* Action Buttons */}
                            <div className='space-y-2 pt-2 lg:pt-3'>
                                <button
                                    type='submit'
                                    disabled={loadings}
                                    className='w-full py-2 lg:py-2.5 bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-900 hover:from-neutral-800 hover:to-neutral-700 text-white font-semibold rounded-lg transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none text-sm'
                                >
                                    {loadings ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>
        
                            {/* Login Link */}
                            <div className='text-center pt-2'>
                                <p className='text-xs sm:text-sm lg:text-xs text-gray-600'>
                                    don't have an account? {' '}
                                    <Link to="/" className='text-blue-600 hover:text-purple-600 font-semibold transition-colors duration-200'>
                                        Sign Up
                                    </Link>
                                </p>
                            </div>

                            {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs sm:text-sm">
                            {error}
                        </div>
                    )}
        
                        </form>
                    </div>
                </div>
        
                {/* Loading Overlay */}
                {loadings && (
                    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4"></div>
                            <p className="text-gray-700 font-medium">logging into your account...</p>
                        </div>
                    </div>
                )}
            </div>
    );
};

export default Login;