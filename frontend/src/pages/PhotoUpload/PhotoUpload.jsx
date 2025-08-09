import axios from 'axios';
import React, { useState } from 'react'
import { FaPlus } from "react-icons/fa6";
import { Link, useNavigate } from 'react-router-dom';

const PhotoUpload = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const navigate = useNavigate();
    
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Create preview
            const previewUrl = URL.createObjectURL(selectedFile);
            setPreview(previewUrl);
        }
    };

    const uploadAvatar = async (e) => {
        e.preventDefault();
        
        if (!file) {
            console.log("No file selected");
            return;
        }
        
        // Create FormData object
        const formData = new FormData();
        formData.append('upload', file);
        formData.append('firstname', 'User'); // Add other required fields
        formData.append('lastname', 'Name');
        formData.append('email', 'user@example.com');
        formData.append('password', 'password123');
        
        try {
            const response = await axios.post(
                "http://localhost:8000/signup", 
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true
                }
            );
            
            if (!response.data.error) {
                navigate('/home');
            }
        } catch(error) {
            console.log("Upload error:", error);
        }
    };

    return (
        <div className='w-screen p-10 text-white h-screen bg-white to-yellow-200 flex justify-center items-center'>
            <div className='h-full justify-center items-center border border-gray-300 shadow-2xl text-black p-10 rounded-xl w-200 flex '>
                <div className='w-1/2 h-full flex justify-center items-center'>
                    <div className='flex flex-col gap-5 mt-8 items-center'>
                        <div className='text-2xl font-bold'>Upload your Image</div>
                        <button 
                            onClick={uploadAvatar}
                            disabled={!file}
                            className={`w-40 flex justify-center items-center h-10 rounded-full ${!file ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'} transition-all duration-200`}
                        >
                            Upload
                        </button>
                        <div className='w-40 flex hover:bg-gray-500 transition-all duration-200 justify-center items-center h-10 rounded-full bg-gray-400'>
                            <Link to="/home" className='w-full flex justify-center items-center h-full rounded-full'>
                                Skip
                            </Link>
                        </div>
                    </div>
                </div>
                <div className='w-1/2 h-full flex items-center justify-center'>
                   
                </div>
                
            
            </div>
        </div>
    );
};

export default PhotoUpload;