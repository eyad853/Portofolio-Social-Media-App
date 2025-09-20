import React, { useState } from 'react'
import Nav from '../../components/Nav/Nav'
import { FaUser, FaPaperPlane, FaSmile, FaPaperclip } from 'react-icons/fa'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { useEffect } from 'react'
import { useRef } from 'react'
import EmojiPicker from 'emoji-picker-react'
import { FaCaretLeft } from "react-icons/fa";

const Chats = ({user,socket,darkMode}) => {
    const {userId} = useParams()
    const [message, setMessage] = useState('')
    const [messages , setMessages]=useState([])
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const inputRef = useRef(null);
    const emojiRef = useRef(null)
    const [loading , setLoading]=useState(false)
    
    // Find the selected friend based on userId
    const selectedFriend = user?.friends?.find(f => f._id === userId)

    useEffect(()=>{
        const handleMessage = (data) => {
            if (data.sender !== user._id) {
                setMessages((prev) => [...prev, data]);
            }
        };
        
        socket.on('privateMessage', handleMessage);
    
        return () => {
            socket.off('privateMessage', handleMessage);
        };
    },[socket])

    useEffect(()=>{
        const handleClickOutSideEmoji = (event)=>{
            if (emojiRef.current && !emojiRef.current.contains(event.target)){
                setShowEmojiPicker(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutSideEmoji);

        return () => {
            document.removeEventListener('mousedown', handleClickOutSideEmoji);
        };
    },[emojiRef])

    const sendMessageToFriend = async(recieverId)=>{
        try{
            const tempMessage = {
                _id: Date.now(),
                sender: user._id,
                receiver: recieverId,
                message,
                timestamp: new Date().toISOString(),
            };
        
            setMessages((prev) => [...prev, tempMessage]);
            setMessage('');
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/messages/${recieverId}` , {message} , {withCredentials:true})
        }catch(err){
            console.log(err);
        }
    }

    const getMessages = async(friendId)=>{
        try{
            setLoading(true)
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/messages/${friendId}`, {withCredentials:true})
            setMessages(response.data.messages)
        }catch(err){
            console.log(err);
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        getMessages(userId)
    },[userId , null])

    console.log(messages);

    return (
        <div className={`w-screen min-h-screen overflow-hidden ${darkMode ? 'bg-neutral-800' : 'bg-gray-50'}`}>
            <header className='fixed top-0 left-0 right-0 z-10'>
                <Nav user={user} darkMode={darkMode}/>
            </header>

            <div className="w-screen pt-16 h-screen flex flex-col md:flex-row">
                {/* Chat Area */}
                <div className={`w-full md:w-9/12 relative h-full flex flex-col ${darkMode ? 'bg-neutral-800' : 'bg-white'} order-2 md:order-1`}>
                    {/* Chat Header */}
                    <div className={`w-full h-12 sm:h-16 ${darkMode ? 'border-neutral-600 bg-neutral-700' : 'border-gray-200 bg-white'} border-b px-3 sm:px-5 flex items-center shadow-sm`}>
                        <Link to={'/home'} className="mr-3 sm:mr-5 text-2xl sm:text-4xl">
                            <FaCaretLeft className={`cursor-pointer ${darkMode ? 'text-neutral-400' : 'text-gray-600'}`}/>
                        </Link>
                        {selectedFriend ? (
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-300 overflow-hidden">
                                    {selectedFriend.avatar ? (
                                        <img 
                                            src={selectedFriend.avatar} 
                                            className='w-full h-full object-cover' 
                                        />
                                    ) : (
                                        <div className={`w-full h-full flex justify-center items-center ${darkMode ? 'bg-neutral-600' : 'bg-gray-100'}`}>
                                            <FaUser className={`${darkMode ? 'text-neutral-400' : 'text-gray-500'} text-xs sm:text-sm`}/>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} text-sm sm:text-base`}>{selectedFriend.username}</h3>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${darkMode ? 'bg-neutral-600' : 'bg-gray-200'} flex items-center justify-center`}>
                                    <FaUser className={`${darkMode ? 'text-neutral-400' : 'text-gray-400'}`}/>
                                </div>
                                <div>
                                    <h3 className={`font-semibold ${darkMode ? 'text-neutral-400' : 'text-gray-500'} text-sm sm:text-base`}>Select a chat</h3>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Messages Area */}
                    {loading?(
                        <div className="flex-1 flex justify-center items-center">
                            <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full border-y-2 border-blue-600 animate-spin"></div>
                        </div>
                    ):(<div className={`flex-1 overflow-y-auto px-3 sm:px-5 py-3 sm:py-4 ${darkMode ? 'bg-neutral-800' : 'bg-gray-50'}`}>
                        {selectedFriend ? (
                            <div className="flex flex-col gap-3 sm:gap-4">
                                {messages && messages.length > 0 ? (
                                    messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${
                                                msg.sender === user._id ? 'justify-end' : 'justify-start'
                                            }`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                                                    msg.sender === user._id
                                                        ? 'bg-blue-500 text-white rounded-br-none'
                                                        : `${darkMode ? 'bg-neutral-700 text-white border border-neutral-600' : 'bg-white text-gray-800 border border-gray-200'} rounded-bl-none`
                                                }`}
                                            >
                                                <p className="text-xs sm:text-sm break-all">{msg.message}</p>
                                                <p
                                                    className={`text-xs mt-1 ${
                                                        msg.sender === user._id
                                                            ? 'text-blue-100'
                                                            : `${darkMode ? 'text-neutral-400' : 'text-gray-500'}`
                                                    }`}
                                                >
                                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className={`flex flex-col items-center justify-center h-full ${darkMode ? 'text-neutral-400' : 'text-gray-500'}`}>
                                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full ${darkMode ? 'bg-neutral-700' : 'bg-gray-200'} flex items-center justify-center mb-3 sm:mb-4`}>
                                            <FaUser className='text-lg sm:text-2xl'/>
                                        </div>
                                        <p className="text-base sm:text-lg font-medium">{selectedFriend.username}</p>
                                        <p className="text-xs sm:text-sm">Start your conversation</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className={`text-center ${darkMode ? 'text-neutral-400' : 'text-gray-500'}`}>
                                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${darkMode ? 'bg-neutral-700' : 'bg-gray-200'} flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                                        <FaUser className='text-2xl sm:text-3xl'/>
                                    </div>
                                    <p className="text-base sm:text-lg font-medium">Welcome to Chat</p>
                                    <p className="text-xs sm:text-sm">Select a friend to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>)}

                    {/* Message Input */}
                    {selectedFriend && (
                        <div className={`p-3 sm:p-4 ${darkMode ? 'bg-neutral-700 border-neutral-600' : 'bg-white border-gray-200'} border-t`}>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        ref={inputRef}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className={`w-full h-9 sm:h-10 px-3 sm:px-4 pr-10 rounded-full border outline-none ${darkMode ? 'border-neutral-600 bg-neutral-800 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'} text-sm`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                                        className={`absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-neutral-400 hover:text-neutral-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                                    >
                                        <FaSmile />
                                    </button>
                                        {showEmojiPicker && (
                                            <div 
                                            ref={emojiRef}
                                            className="absolute bottom-12 sm:bottom-14 right-2 sm:right-4 z-50">
                                                <EmojiPicker
                                                    onEmojiClick={(emojiData) => {
                                                    setMessage((prev) => prev + emojiData.emoji);
                                                }}
                                                    theme={darkMode ? "dark" : "light"}
                                                    skinTonesDisabled={true}
                                                />
                                            </div>
                                        )}
                                </div>
                                <button
                                onClick={()=>{
                                    sendMessageToFriend(userId)
                                }}
                                    type="submit"
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <FaPaperPlane className="text-xs sm:text-sm" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Friends Sidebar */}
                <div className={`w-full md:w-3/12 h-48 md:h-full ${darkMode ? 'border-neutral-600 bg-neutral-700' : 'border-gray-200 bg-white'} border-l order-1 md:order-2 overflow-y-auto`}>
                    {/* Search Header */}
                    <div className={`w-full h-12 sm:h-16 border-b ${darkMode ? 'bg-neutral-700 border-neutral-600' : 'bg-white border-neutral-300'} flex items-center px-3 sm:px-4`}>
                        <input
                            type="text"
                            className={`w-full h-7 sm:h-8 outline-none rounded-full px-3 border ${darkMode ? 'border-neutral-600 bg-neutral-800 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'} text-sm`}
                            placeholder="Search friends..."
                        />
                    </div>

                    {/* Friends List */}
                    <div className="overflow-y-auto">
                        {user?.friends?.length > 0 ? (
                            user.friends.map(f => (
                                <Link
                                    key={f._id}
                                    to={`/home/chats/${f._id}`}
                                    className={`w-full flex items-center px-3 sm:px-4 py-2 sm:py-3 gap-2 sm:gap-3 border-b ${darkMode ? 'border-neutral-600 hover:bg-neutral-600' : 'border-gray-100 hover:bg-gray-50'} transition-colors ${
                                        userId === f._id ? `${darkMode ? 'bg-neutral-600 border-l-4 border-l-blue-400' : 'bg-blue-50 border-l-4 border-l-blue-500'}` : ''
                                    }`}
                                >
                                    <div className="relative">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-300 overflow-hidden">
                                            {f?.avatar ? (
                                                <img
                                                    src={f.avatar}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className={`w-full h-full flex justify-center items-center ${darkMode ? 'bg-neutral-600' : 'bg-gray-100'}`}>
                                                    <FaUser className={`${darkMode ? 'text-neutral-400' : 'text-gray-500'}`} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} truncate text-sm sm:text-base`}>
                                            {f.username}
                                        </div>
                                        <div className={`text-xs sm:text-sm ${darkMode ? 'text-neutral-400' : 'text-gray-500'} truncate`}>
                                            Last seen recently
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className={`flex flex-col items-center justify-center py-6 sm:py-8 px-4 ${darkMode ? 'text-neutral-400' : 'text-gray-500'}`}>
                                <FaUser className="text-2xl sm:text-3xl mb-2" />
                                <p className="text-xs sm:text-sm text-center">No friends added yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chats