import React from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { PiBellSimpleRingingLight } from "react-icons/pi";
import { FaUser } from "react-icons/fa";
import {Link} from 'react-router-dom'

const Nav = ({user,darkMode}) => {
  return (
    <div className={`w-full z-50 h-16 ${darkMode?"bg-neutral-900 text-white":"bg-white"} flex items-center justify-between shadow-md px-3 sm:px-5`}>
      {/* name of the web */}
      <div className='ml-0 sm:ml-5 font-bold text-xl sm:text-2xl md:text-3xl'>
        Circle
      </div>

      <div className="h-full flex gap-6 font-bold items-center justify-between">
        <Link className='cursor-pointer' to={'/home'}>
          Feed
        </Link>
        <Link className='cursor-pointer' to={`/home/profile/${user?._id}`}>
          Profile
        </Link>
        <Link className='cursor-pointer' to={'/home/settings'}>
          Settings
        </Link>
        <Link className='cursor-pointer' to={'/home/notification'}>
          Notifications
        </Link>
        <Link className='cursor-pointer' to={'/home/friends'}>
          Friends
        </Link>
      </div>
       
      {/* account and notifications */}
      <div className='w-auto sm:w-[15%] h-10 mr-2 sm:mr-20 flex justify-between gap-2 sm:gap-3'>
         
        {/* profile */}
        <Link to={`/home/profile/${user?._id}`} className='h-full flex-1 flex items-center justify-start overflow-hidden gap-2 sm:gap-3 cursor-pointer'>
          <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-200'>
            {user&&user.avatar ? (
              <img src={user.avatar} className='w-full h-full rounded-full object-cover' />
            ) : (
              <div className='w-full text-xl sm:text-3xl h-full flex justify-center items-center mt-1 rounded-full'>
                <FaUser className='rounded-b-2xl'/>
              </div>
            )}
          </div>
          <div className='font-semibold hidden sm:block text-sm sm:text-base'>
            {user&&user.username&&user.firstname}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Nav;