import React from 'react'
import { FaUser } from 'react-icons/fa'
import Modal from 'react-modal'
import { Link } from 'react-router-dom'

const LikesModal = ({isLikesModalOpen , setIsLikesModalOpen , post}) => {
  return (
     <Modal
        isOpen={isLikesModalOpen}
        onRequestClose={()=>{
            setIsLikesModalOpen(false)
        }}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        className={`w-140 h-100 bg-white p-3 rounded-xl shadow-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none`}
        overlayClassName={`fixed inset-0 bg-gray-500/50 z-50 flex justify-center items-center`}
        >
          <div className='w-full h-full'>
            {post?.likes?.length>0?(
              <div className="w-full h-full overflow-y-auto hide-scrollbar">
                {post?.likes?.map(like=>(
                  <div className="border-b border-neutral-400 h-12 flex items-center gap-2">

                    <Link to={`/home/profile/${like?.user?._id}`} className="w-10 inline-block overflow-hidden h-10 rounded-full border border-neutral-800">
                      {like.avatar?(
                        <div className="w-full h-full flex justify-center items-center">
                          <img src={like.avatar} className='w-full h-ull object-contain' alt="" />
                        </div>
                      ):(
                        <div className="w-full overflow-hidden flex justify-center items-end h-full">
                          <FaUser size={30}/>
                        </div>
                      )}
                    </Link>

                    <div className="font-semibold">{like?.username}</div>

                  </div>
                ))}
              </div>
            ):(
              <div className="w-full font-bold h-full flex justify-center items-center">
                No Likes Yet
              </div>
            )}
          </div>
      </Modal>
  )
}

export default LikesModal