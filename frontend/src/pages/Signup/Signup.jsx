import React, { useState, useEffect } from 'react';
import { FaGoogle, FaGithub, FaUser } from "react-icons/fa";
import { LuUserPlus } from "react-icons/lu";
import { MdOutlineEmail } from "react-icons/md";
import { IoLockClosedOutline } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'

const Signup = ({setTrigger}) => {
    const navigate = useNavigate();
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    // OAuth handlers - these correctly use window.location.href for redirects
    const handleSignUpWithGoogle = () => {
        console.log(import.meta.env.VITE_Backend_Domain);
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`; // Ensure /api prefix
    };

    const handleSignUpWithGithub = () => {
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/github`; // Ensure /api prefix
    };

    // Handle file selection for preview
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const previewUrl = URL.createObjectURL(selectedFile);
            setPreview(previewUrl);
        } else {
            setFile(null);
            setPreview(null);
        }
    };

        const handleNormalSignup = async (e) => {
        e.preventDefault();


        try {
            const formData = new FormData();
            formData.append("firstname", firstname);
            formData.append("lastname", lastname);
            formData.append("email", email);
            formData.append("password", password);
            if (file) formData.append("avatar", file);
        
            const res = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/signup`,
            formData,
            { withCredentials: true }
            );

            if (!res.data.error) {
                setTrigger(prev=>prev+1)
                navigate("/home");
            }
        } catch (error) {
            console.error("Signup failed:", error);
            alert("Something went wrong");
        } 
};

    return (
        <div className='w-screen p-4 lg:p-10 text-white min-h-screen flex justify-center items-center'>
            <div className='h-auto lg:h-125 shadow-2xl text-black border border-gray-300 p-4 lg:p-10 rounded-xl w-[90vw] lg:w-200 flex flex-col'>
                    {/* First part: Social Sign-up */}
                    <div className="w-full lg:w-1/2 h-20 border-b pb-2 flex flex-col items-center justify-center border-gray-200">
                        <div>
                            Register with:
                        </div>
                        <div className='flex gap-3 mt-3'>
                            <button
                                type="button" // Use type="button" to prevent accidental form submission
                                onClick={handleSignUpWithGoogle}
                                className='w-32 h-9 transform transition-all duration-200 hover:scale-105 rounded-md bg-gray-500/30 px-16 flex justify-center items-center gap-2'
                            >
                                <FaGoogle />
                                Google
                            </button>

                            <button
                                type="button" // Use type="button" to prevent accidental form submission
                                onClick={handleSignUpWithGithub}
                                className='w-32 h-9 transform transition-all duration-200 hover:scale-105 rounded-md bg-gray-500/30 px-16 flex justify-center items-center gap-2'
                            >
                                <FaGithub />
                                Github
                            </button>
                        </div>
                    </div>

                    {/* Second part: Normal Signup Form */}
                    {/* IMPORTANT: This form will submit directly to the backend.
                        The `encType` is crucial for file uploads. */}
                    <form
                        onSubmit={handleNormalSignup}
                        encType="multipart/form-data" // Crucial for file uploads
                        className='w-full flex flex-col lg:flex-row flex-1'
                        // No onSubmit handler that calls e.preventDefault()
                    >
                    <div className="flex flex-col w-full lg:w-1/2 h-full">

                        {/* First Name and Last Name */}
                        <div className='w-full h-auto lg:h-16 mt-8 flex flex-col lg:flex-row justify-around gap-3 lg:gap-0'>
                            <div className='w-full lg:w-56 lg:mr-2 h-15 flex flex-col'>
                                <div className='font-md mb-1'>
                                    First Name
                                </div>
                                <div className='rounded-md h-full bg-gray-500/30 flex'>
                                    <div className='w-10 h-full flex justify-center items-center'>
                                        <LuUserPlus />
                                    </div>
                                    <input
                                        type="text"
                                        value={firstname}
                                        name="firstname" // Important: `name` attribute
                                        onChange={({ target }) => setFirstname(target.value)}
                                        className='w-full text-sm rounded-md h-full outline-none px-2'
                                        required
                                    />
                                </div>
                            </div>
                            <div className='w-full lg:w-56 h-15 flex flex-col'>
                                <div className='font-md mb-1'>
                                    Last Name
                                </div>
                                <div className='rounded-md h-full bg-gray-500/30 flex'>
                                    <div className='w-10 h-full flex justify-center items-center'>
                                        <LuUserPlus />
                                    </div>
                                    <input
                                        type="text"
                                        value={lastname}
                                        name='lastname' // Important: `name` attribute
                                        onChange={({ target }) => setLastname(target.value)}
                                        className='w-full text-sm rounded-md h-full outline-none px-2'
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className='w-full h-15 flex flex-col mt-4 lg:mt-2'>
                            <div className='mb-1'>
                                Email
                            </div>
                            <div className='flex h-full bg-gray-500/30 rounded-md'>
                                <div className='w-10 h-full flex justify-center items-center'>
                                    <MdOutlineEmail />
                                </div>
                                <input
                                    type="email"
                                    name="email" // Important: `name` attribute
                                    value={email}
                                    onChange={({ target }) => setEmail(target.value)}
                                    className='w-full outline-none h-full text-sm px-2'
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className='w-full h-15 flex flex-col mt-4 lg:mt-2'>
                            <div className='mb-1'>
                                Password
                            </div>
                            <div className='flex h-full bg-gray-500/30 rounded-md'>
                                <div className='w-10 font-bold h-full flex justify-center items-center'>
                                    <IoLockClosedOutline />
                                </div>
                                <input
                                    type="password"
                                    name="password" // Important: `name` attribute
                                    value={password}
                                    onChange={({ target }) => setPassword(target.value)}
                                    className='w-full outline-none h-full text-sm px-2'
                                    required
                                />
                            </div>
                        </div>

                        {/* Signup Button (type="submit" to submit the form) */}
                        <div className='w-full flex-1 mt-6'>
                            <button
                                type='submit' // This will submit the HTML form
                                className='w-full bg-gradient-to-b transform transition-all duration-200 hover:scale-105 from-blue-600 to-blue-500 h-8 rounded-md flex justify-center items-center font-bold text-white'
                            >
                                Sign Up
                            </button>
                            <div className='mx-auto mt-5 text-black hover:text-blue-600 transition-all duration-200'>
                                <p className=''>
                                    <Link to="/login">Already have an account? Login</Link>
                                </p>
                            </div>
                        </div>
                      </div>
                      {/* Right part: Avatar Preview */}
                      <div className='h-60 lg:h-full w-full lg:w-1/2 flex items-center justify-center '>
                          <div className='w-48 lg:w-80 ml-4 lg:ml-10 relative h-48 lg:h-80 text-white bg-gray-900 hover:bg-gray-950 transition-all duration-200 rounded-full'>
                              <div className='w-full h-full rounded-full text-white flex justify-center items-end overflow-hidden'>
                                  {preview ? (
                                      <img src={preview} alt="Profile Preview" className="w-full h-full object-cover" />
                                  ) : (
                                      <FaUser size={160} className="lg:size-[300px] lg:mt-30" />
                                  )}
                                  <input
                                      type="file"
                                      onChange={handleFileChange}
                                      name='avatar'
                                      className='absolute w-full h-full rounded-full opacity-0 cursor-pointer'
                                  />
                              </div>
                          </div>
                      </div>
                    </form>

            </div>
        </div>
    );
};

export default Signup;