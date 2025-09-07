import React from 'react'
import { FaUser } from 'react-icons/fa'

const UserBox = ({user , darkMode,userFollowing,userFollowers,posts}) => {
    const postCount = posts?.filter(p=>p?.user?._id===user?._id)
  return (
    <div className={`w-full h-32 sm:h-36 md:h-40 ${darkMode?"bg-neutral-700 text-white":"bg-white"} rounded-2xl p-2 sm:p-3`}>
        <div className={`w-full h-full rounded-2xl ${darkMode?"bg-neutral-800 text-white":"bg-gray-100"} flex flex-col p-2 sm:p-3`}>
            {/* first part */}
            <div className='w-full h-1/2 flex justify-start items-center'>
            {/* user avatar */}
                <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-300'>
                    {user&&user.avatar?(
                        <img src={user.avatar} className='w-full h-full rounded-full object-cover' alt="" />
                    ):(
                        <div className='w-full text-xl sm:text-3xl h-full flex justify-center items-center mt-1 rounded-full'>
                                        <FaUser className='rounded-b-2xl'/>
                        </div>
                    )}
                </div>
            {/* user name and email*/}
                <div className='flex flex-1 text-xs font-bold flex-col ml-2 sm:ml-3'>
                    {/* name */}
                    <div className='text-xs sm:text-sm'>{user&&user.username&&user.username}</div>
                    {/* email */}
                    <div className='text-neutral-500 line-clamp-1 text-xs'>{user&&user.email&&user.email}</div>
                </div>
            </div>
            {/* second part */}
            <div className='w-full h-1/2 flex justify-between items-center'>
                <div className='h-full w-12 sm:w-16 flex flex-col items-center justify-center'>
                    <div className='font-bold text-xs sm:text-sm'>{userFollowers?.length}</div>
                    <div className='text-xs text-neutral-500'>Follower</div>
                </div>
                <div className='h-full w-12 sm:w-16 flex flex-col items-center justify-center'>
                    <div className='font-bold text-xs sm:text-sm'>{userFollowing?.length}</div>
                    <div className='text-xs text-neutral-500'>Following</div>
                </div>
                <div className='h-full w-12 sm:w-16 flex flex-col items-center justify-center'>
                    <div className='font-bold text-xs sm:text-sm'>{postCount?.length}</div>
                    <div className='text-xs text-neutral-500'>Post</div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default UserBox;
