import React, { useState } from 'react'
import { PiImageSquareBold } from "react-icons/pi";
import { IoIosLink } from 'react-icons/io';
import CreatePostModal from '../../modals/CreatePostModal/CreatePostModal';
import { FaUser } from 'react-icons/fa';

const CreatePostPart = ({user , darkMode}) => {
    const [isOpen , setIsOpen]=useState(false)
    const [isImageOrVideo , setIsImageOrVideo]=useState(false)
    const [isAttachment , setIsAttachment]=useState(false)
  return (
    <div className={`w-full h-20 sm:h-24 ${darkMode?"bg-neutral-700 text-white":"bg-white"} rounded-2xl`}>
        {/* first part */}
        <div className="w-full h-6/10 border-b border-neutral-300 flex items-center px-2 sm:px-3 gap-2 sm:gap-4">
            <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-300'>
                {user&&user.avatar?(
                    <img src={user.avatar} className='w-full h-full rounded-full object-cover' alt="" />
                ):(
                    <div className='w-full text-xl sm:text-3xl h-full flex justify-center items-center mt-1 rounded-full'>
                        <FaUser className='rounded-b-2xl'/>
                    </div>
                )}
            </div>
            <div 
            onClick={()=>{
                setIsOpen(true)
            }}
            className={`h-8 sm:h-10 flex-1 ${darkMode?"bg-neutral-800 hover:bg-neutral-900 text-white":"bg-gray-100 hover:bg-neutral-300"} transition-all duration-200 rounded-full flex`}>
                <div className='h-full w-3 sm:w-5 rounded-l-full'></div>
                <div type="text" className='flex-1 h-full outline-none rounded-r-full text-gray-500 flex items-center cursor-pointer text-sm sm:text-base px-2'>what on you mind ?</div>
            </div>
        </div>
         
        {/* second part */}
        <div className="w-full px-2 sm:px-3 h-4/10 flex items-center justify-between">
            <div className='flex items-center gap-2 sm:gap-2.5'>
                <div 
                onClick={()=>{
                    setIsOpen(true)
                    setIsImageOrVideo(true)
                }}
                className="flex gap-1 sm:gap-3 items-center cursor-pointer">
                    <div className="text-sm sm:text-base"><PiImageSquareBold/></div>
                    <div className='font-semibold text-neutral-500 text-xs sm:text-sm'>image/video</div>
                </div>
                <div 
                onClick={()=>{
                    setIsOpen(true)
                    setIsAttachment(true)
                }}
                className="flex gap-1 items-center cursor-pointer">
                    <div className='mt-1 text-base sm:text-xl'><IoIosLink /></div>
                    <div className='font-semibold text-neutral-500 text-xs sm:text-sm'>attachment</div>
                </div>
            </div>
            <div className="flex items-center">
                <div></div>
                <div></div>
            </div>
        </div>
         
        <CreatePostModal 
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isImageOrVideo={isImageOrVideo}
        setIsImageOrVideo={setIsImageOrVideo}
        isAttachment={isAttachment}
        setIsAttachment={setIsAttachment}
        user={user}
        darkMode={darkMode}
        />
    </div>
  )
}

export default CreatePostPart;