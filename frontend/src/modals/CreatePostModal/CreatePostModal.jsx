import React, { useState, useRef } from 'react'
import Modal from 'react-modal'
import { IoIosLink, IoMdClose } from "react-icons/io";
import { PiImageSquareBold } from 'react-icons/pi';
import axios from 'axios';

const CreatePostModal = ({darkMode,user, isOpen, setIsOpen, isImageOrVideo, setIsImageOrVideo, isAttachment, setIsAttachment}) => {
    const [content, setContent] = useState('')
    const [media, setMedia] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [filePreview, setFilePreview] = useState(null)
    const [fileData, setFileData] = useState(null)
    const fileInputRef = useRef(null)

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Set file data for upload
        setFileData(file)

        // Create a preview URL for the file
        if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setFilePreview(e.target.result)
            }
            reader.readAsDataURL(file)
        } else if (file.type.startsWith('video/')) {
            const url = URL.createObjectURL(file)
            setFilePreview(url)
        } else {
            // For other file types, just show the name
            setFilePreview(null)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            handleFileSelection(file)
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    const handleFileSelection = (file) => {
        // Set file data for upload
        setFileData(file)

        // Create a preview URL for the file
        if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setFilePreview(e.target.result)
            }
            reader.readAsDataURL(file)
        } else if (file.type.startsWith('video/')) {
            const url = URL.createObjectURL(file)
            setFilePreview(url)
        } else {
            // For other file types, just show the name
            setFilePreview(null)
        }
    }

    const removeFile = () => {
        setFileData(null)
        setFilePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const getFileType = (file) => {
        if (!file) return null
        if (file.type.startsWith('image/')) return 'image'
        if (file.type.startsWith('video/')) return 'video'
        return 'file' // Default to file for other types
    }

    const handleCreatePost = async () => {
        if (!content.trim() && !fileData) {
            setError('Please add some content or attach a file to your post')
            return
        }

        // Check if user exists and has an ID
        if (!user || !user._id) {
            setError('User information is missing. Please log in again.')
            console.log("User object:", user);
            return
        }

        setLoading(true)
        setError('')
        
        try {
            // Create a FormData object to handle the file upload
            const formData = new FormData()
            formData.append('content', content)
            formData.append('user', user._id)
            
            // Add file if exists
            if (fileData) {
                formData.append('file', fileData)
                formData.append('fileType', getFileType(fileData))
            }
            
            const response = await axios.post(
                'http://localhost:8000/post/create', 
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )
            
            if (response && response.data) {
                setIsOpen(false)
                setContent('')
                setMedia('')
                setFileData(null)
                setFilePreview(null)
                setIsImageOrVideo(false)
                setIsAttachment(false)
            }
        } catch (err) {
            console.log("Error response:", err.response?.data)
            console.log("User ID being sent:", user._id)
            setError(err.response?.data?.message || err.response?.data?.messgae || 'Failed to create post')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
        isOpen={isOpen}
        onRequestClose={()=>{
            setIsOpen(false)
            setIsImageOrVideo(false)
            setIsAttachment(false)
            removeFile()
        }}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        className={`w-[95%] max-w-lg sm:w-140 ${isImageOrVideo===false && isAttachment===false && !filePreview ? "h-auto sm:h-100" : "h-auto sm:h-135"} ${darkMode ? "bg-neutral-800 text-white" : "bg-white"} p-3 sm:p-4 rounded-xl shadow-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none max-h-[90vh] overflow-y-auto`}
        overlayClassName={`fixed inset-0 ${darkMode ? "bg-black/60" : "bg-gray-500/50"} z-50 flex justify-center items-center`}
        >
            <div className='w-full h-full flex flex-col'>
                <div className="w-full h-12 sm:h-14 flex justify-center items-center relative mb-3">
                    <div className={`text-lg sm:text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        Create a Post
                    </div>
                    <div 
                    onClick={()=>{
                        setIsOpen(false)
                        removeFile()
                    }}
                    className={`absolute right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full ${darkMode ? "bg-neutral-600 hover:bg-neutral-500" : "bg-neutral-200 hover:bg-neutral-400"} transition-all duration-200 flex justify-center items-center cursor-pointer`}>
                        <IoMdClose className="text-sm sm:text-base" />
                    </div>
                </div>

                <div className='w-full h-14 sm:h-16 mb-3 flex items-center gap-2 sm:gap-3 justify-start px-2 sm:px-3'>
                    <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-500'>
                        {user && user.avatar ? (
                            <img src={user.avatar} className='w-full h-full rounded-full object-cover' alt="User avatar" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white text-sm sm:text-lg font-bold">
                                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                            </div>
                        )}
                    </div>
                    <div className='flex flex-col'>
                        <div className={`font-bold text-sm sm:text-base ${darkMode ? "text-white" : "text-gray-900"}`}>{user?.username}</div>
                        <div className={`font-bold text-xs ${darkMode ? "text-neutral-400" : "text-gray-600"}`}>{user?.email}</div>
                    </div>
                </div>
                
                {/* Post content input */}
                <div className={`w-full h-24 sm:h-32 border overflow-auto hide-scrollbar ${darkMode ? "border-neutral-600" : "border-neutral-300"} mb-3 rounded-md`}>
                    <textarea 
                    value={content}
                    onChange={({target})=>{
                        setContent(target.value)
                    }}
                    type="text"  
                    className={`outline-none w-full overflow-auto h-24 sm:h-32 p-2 hide-scrollbar resize-none text-sm sm:text-base ${darkMode ? "bg-neutral-800 text-white placeholder:text-neutral-400" : "bg-white text-gray-900 placeholder:text-gray-500"}`}
                    placeholder='What is on your mind?' />
                </div>

                {error && (
                    <div className={`w-full p-2 mb-2 text-red-500 text-xs sm:text-sm ${darkMode ? "bg-red-900/30 border-red-600" : "bg-red-50 border-red-200"} rounded border`}>
                        {error}
                    </div>
                )}

                {/* File upload area */}
                {(isImageOrVideo || isAttachment || filePreview) ? (
                    <div 
                        className={`w-full relative h-32 sm:h-40 p-2 border ${darkMode ? "border-neutral-600" : "border-neutral-300"} rounded-md mb-3`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className='w-full z-50 h-full opacity-0 absolute top-0 left-0 cursor-pointer' 
                            onChange={handleFileChange}
                            accept={isImageOrVideo ? "image/*,video/*" : "*/*"}
                        />
                        
                        {filePreview ? (
                            <div className="w-full h-full relative flex justify-center items-center">
                                {fileData?.type?.startsWith('image/') ? (
                                    <img 
                                        src={filePreview} 
                                        alt="Preview" 
                                        className="max-h-full max-w-full object-contain" 
                                    />
                                ) : fileData?.type?.startsWith('video/') ? (
                                    <video 
                                        src={filePreview} 
                                        controls 
                                        className="max-h-full max-w-full"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <div className="text-center">
                                            <IoIosLink className="text-3xl sm:text-4xl mx-auto text-blue-500" />
                                            <p className={`mt-2 text-sm ${darkMode ? "text-neutral-300" : "text-gray-700"}`}>{fileData?.name}</p>
                                            <p className={`text-xs ${darkMode ? "text-neutral-400" : "text-gray-500"}`}>
                                                {(fileData?.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={`absolute text-sm sm:text-xl font-bold inset-2 ${darkMode ? "bg-neutral-700 hover:bg-neutral-600 text-neutral-300" : "bg-neutral-100 hover:bg-neutral-200"} transition-all duration-200 rounded-md flex justify-center items-center text-center px-2`}>
                                {isImageOrVideo ? 'Drag your image or video here' : 'Drag your file here'}
                            </div>
                        )}
                        
                        <div 
                        onClick={() => {
                            if (filePreview) {
                                removeFile()
                            } else {
                                setIsImageOrVideo(false)
                                setIsAttachment(false)
                            }
                        }}
                        className={`absolute top-2 sm:top-3 left-2 sm:left-3 w-7 h-7 sm:w-9 sm:h-9 ${darkMode ? "hover:bg-neutral-500 bg-neutral-600" : "hover:bg-neutral-400 bg-neutral-300"} rounded-full flex justify-center items-center cursor-pointer z-50`}>
                            <IoMdClose className="text-sm sm:text-base" />
                        </div>
                    </div>
                ) : null}

                {/* Action buttons for adding media */}
                <div className={`w-full h-12 sm:h-14 flex items-center rounded-2xl justify-between px-2 sm:px-3 border ${darkMode ? "border-neutral-600" : "border-neutral-300"}`}>
                    <div className={`font-semibold text-sm sm:text-base ${darkMode ? "text-white" : "text-gray-900"}`}>Add to your Post:</div>
                    <div className="flex gap-2 sm:gap-4 items-center">
                        <div 
                        onClick={()=>{
                            setIsImageOrVideo(true)
                            setIsAttachment(false)
                        }}
                        className={`w-8 h-8 sm:w-10 sm:h-10 cursor-pointer flex justify-center items-center text-lg sm:text-2xl ${darkMode ? "hover:bg-neutral-600 bg-neutral-700" : "hover:bg-neutral-400 bg-neutral-200"} transition-all duration-200 rounded-full`}>
                            <PiImageSquareBold/>
                        </div>
                        <div 
                        onClick={()=>{
                            setIsAttachment(true)
                            setIsImageOrVideo(false)
                        }}
                        className={`w-8 h-8 sm:w-10 sm:h-10 cursor-pointer flex justify-center items-center text-lg sm:text-2xl ${darkMode ? "hover:bg-neutral-600 bg-neutral-700" : "hover:bg-neutral-400 bg-neutral-200"} transition-all duration-200 rounded-full`}>
                            <IoIosLink/>
                        </div>
                    </div>
                </div>

                {/* Submit button */}
                <button 
                onClick={handleCreatePost}
                disabled={loading}
                className={`w-32 sm:w-40 mt-4 sm:mt-5 h-9 sm:h-10 text-lg sm:text-2xl text-white flex justify-center items-center font-bold mx-auto transform hover:scale-105 transition-all duration-300 cursor-pointer rounded-md bg-gradient-to-bl from-blue-500 to-blue-600 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    {loading ? 'Posting...' : 'Post'}
                </button>
            </div>
        </Modal>
    )
}

export default CreatePostModal