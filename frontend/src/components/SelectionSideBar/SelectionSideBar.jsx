import React, { useState } from 'react'
import { FaHome, FaUserFriends } from 'react-icons/fa'
import { IoIosNotifications, IoIosSettings } from "react-icons/io";
import { RxAvatar } from "react-icons/rx";
import { useNavigate } from 'react-router-dom';
 
const SelectionSideBar = ({user , darkMode,notificationsCount}) => {
    const [selectedPage , setSelectedPage]=useState('feed')
    const navigate = useNavigate()
  return (
    <div className={`w-full h-auto lg:h-[70%] ${darkMode?"bg-neutral-700 text-white":"bg-white"} rounded-2xl mt-2 sm:mt-5 p-2 sm:p-3 flex lg:flex-col flex-row overflow-x-auto lg:overflow-x-visible gap-2 lg:gap-0`}>
        <div 
        onClick={()=>{
            setSelectedPage('feed')
            navigate('/home')
        }}
        className={`w-auto lg:w-full flex-shrink-0 ${selectedPage==="feed"?"bg-blue-500 text-white":darkMode?"bg-neutral-700 hover:bg-neutral-800":"bg-white hover:bg-blue-50"} rounded-xl pl-2 transition-all duration-300 h-12 sm:h-16 lg:h-16 flex gap-2 sm:gap-3 cursor-pointer items-center font-semibold text-sm sm:text-base px-3 lg:px-2`}>
            <div className="text-lg sm:text-xl">
                < FaHome />
            </div>
            <div className="whitespace-nowrap">
                Feed
            </div>
        </div>
        <div 
        onClick={()=>{
            setSelectedPage('profile')
            navigate(`/home/profile/${user?._id}`)
        }}
        className={`w-auto lg:w-full flex-shrink-0 ${selectedPage==="profile"?"bg-blue-500 text-white":darkMode?"bg-neutral-700 hover:bg-neutral-800":"bg-white hover:bg-blue-50"} rounded-xl pl-2 transition-all duration-300 h-12 sm:h-16 lg:h-16 flex gap-2 sm:gap-3 cursor-pointer items-center font-semibold text-sm sm:text-base px-3 lg:px-2`}>
            <div className="text-lg sm:text-xl">
                < RxAvatar/>
            </div>
            <div className="whitespace-nowrap">
                Profile
            </div>
        </div>
        <div 
        onClick={()=>{
            setSelectedPage('settings')
            navigate('/home/settings')
        }}
        className={`w-auto lg:w-full flex-shrink-0 ${selectedPage==="settings"?"bg-blue-500 text-white":darkMode?"bg-neutral-700 hover:bg-neutral-800":"bg-white hover:bg-blue-50"} rounded-xl pl-2 transition-all duration-300 h-12 sm:h-16 lg:h-16 flex gap-2 sm:gap-3 cursor-pointer items-center font-semibold text-sm sm:text-base px-3 lg:px-2`}>
            <div className="text-lg sm:text-xl">
                <IoIosSettings  />
            </div>
            <div className="whitespace-nowrap">
                Settings
            </div>
        </div>
        <div 
        onClick={()=>{
            setSelectedPage('notifications')
            navigate('/home/notification')
        }}
        className={`w-auto lg:w-full flex-shrink-0 ${selectedPage==="notifications"?"bg-blue-500 text-white":darkMode?"bg-neutral-700 hover:bg-neutral-800":"bg-white hover:bg-blue-50"} rounded-xl pl-2 transition-all duration-300 h-12 sm:h-16 lg:h-16 flex gap-2 sm:gap-3 cursor-pointer items-center font-semibold text-sm sm:text-base px-3 lg:px-2`}>
            <div className="text-lg sm:text-xl">
                < IoIosNotifications />
            </div>
            <div className="whitespace-nowrap">
                Notifications
            </div>
        </div>
        <div 
        onClick={()=>{
            setSelectedPage('friends')
            navigate('/home/friends')
        }}
        className={`w-auto lg:w-full flex-shrink-0 ${selectedPage==="friends"?"bg-blue-500 text-white":darkMode?"bg-neutral-700 hover:bg-neutral-800":"bg-white hover:bg-blue-50"} rounded-xl pl-2 transition-all cursor-pointer duration-200 h-12 sm:h-16 lg:h-16 flex gap-2 sm:gap-3 items-center font-semibold text-sm sm:text-base px-3 lg:px-2`}>
            <div className="text-lg sm:text-xl">
                < FaUserFriends />
            </div>
            <div className="whitespace-nowrap">
                Friends
            </div>
        </div>
    </div>
  )
}

export default SelectionSideBar;