import React from 'react'
import { useState } from 'react'
import { FaUser } from 'react-icons/fa';
import { FaEllipsis } from 'react-icons/fa6';
import Modal from "react-modal"
import { Link } from 'react-router-dom';

const CommensModal = ({isCommentsModalOpen, content, setContent, setIsCommentsModalOpen, addComment, post, darkMode}) => {
  const [settingsList, setSettingsList] = useState(false)
  return (
    <Modal
        isOpen={isCommentsModalOpen}
        onRequestClose={()=>{
            setIsCommentsModalOpen(false)
        }}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        className={`w-[95%] max-w-lg sm:w-140 h-[90vh] sm:h-100 ${darkMode ? "bg-neutral-800 text-white" : "bg-white"} p-3 sm:p-4 rounded-xl shadow-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none`}
        overlayClassName={`fixed inset-0 ${darkMode ? "bg-black/60" : "bg-gray-500/50"} z-50 flex justify-center items-center`}
        >
        <div className='w-full h-full'>

          {/* comments */}
          <div className="h-5/6 w-full">
            {post?.comments?.length?(
              <div className="w-full h-full overflow-y-auto hide-scrollbar">
                {post.comments.map(comment=>(
                  <div 
                  key={comment._id}
                  className={`py-2 sm:py-3 ${darkMode ? "border-neutral-600" : "border-neutral-300"} border-b flex`}>
                    {/* the image */}
                    <div className="h-full w-9 sm:w-11 flex-shrink-0">
                      <Link to={`/home/profile/${comment.user._id}`} className="w-8 h-8 sm:w-10 sm:h-10 inline-block cursor-pointer overflow-hidden border border-neutral-300 rounded-full">
                        {comment?.user?.avatar?(
                          <div className="w-full cursor-pointer h-full flex justify-center items-center">
                            <img src={comment.user.avatar} className='w-full h-full object-cover rounded-full' alt="" />
                          </div>
                        ):(
                          <div className={`w-full cursor-pointer overflow-hidden flex justify-center items-end h-full ${darkMode ? "bg-neutral-600" : "bg-gray-100"}`}>
                            <FaUser size={window.innerWidth < 640 ? 20 : 30} className={darkMode ? "text-neutral-400" : "text-gray-500"}/>
                          </div>
                        )}
                      </Link>
                    </div>

                    <div className="flex-1 ml-1 sm:ml-0.5 flex-col gap-2 sm:gap-3 min-w-0">
                      <div className="gap-1 sm:gap-2 cursor-pointer flex items-center">
                        <div className={`font-semibold text-sm sm:text-base ${darkMode ? "text-white" : "text-gray-900"} truncate`}>
                          {comment.user.username}
                        </div>
                        <div className={`font-medium text-xs flex items-center ${darkMode ? "text-neutral-400" : "text-gray-500"} flex-shrink-0`}>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-1.5 ${darkMode ? "bg-neutral-700" : "bg-neutral-200"} rounded-2xl flex items-center justify-between`}>
                        <div className={`flex-1 text-sm sm:text-base ${darkMode ? "text-white" : "text-gray-900"} break-words`}>
                          {comment.content}
                        </div>
                        <div className="flex items-center justify-center h-full relative flex-shrink-0 ml-2">
                          <FaEllipsis 
                          onClick={()=>{
                            
                          }} 
                          className={`cursor-pointer text-sm sm:text-base ${darkMode ? "text-neutral-400 hover:text-neutral-200" : "text-gray-600 hover:text-gray-800"} transition-colors`}/>

                          {settingsList&&(
                            <div className={`absolute w-28 sm:w-32 h-48 sm:h-60 border ${darkMode ? "bg-neutral-700 border-neutral-600" : "bg-white border-neutral-300"} rounded-md shadow-lg top-6 right-0 z-10`}>
                              {/* Settings options can go here */}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ):(
              <div className={`w-full h-full flex justify-center items-center font-bold text-base sm:text-lg ${darkMode ? "text-neutral-400" : "text-gray-600"}`}>
                No Comments Yet
              </div>
            )}
          </div>

          {/* add a comment */}
          <div className={`h-1/6 w-full border-t px-3 sm:px-8 ${darkMode ? "border-neutral-600" : "border-neutral-300"} flex items-center`}>
            <input 
            type="text" 
            value={content}
            onChange={({target})=>{
              setContent(target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && content.trim()) {
                addComment(post._id);
              }
            }}
            className={`flex-1 h-8 sm:h-10 px-3 sm:px-4 outline-none border-y border-l rounded-l-full text-sm sm:text-base ${
              darkMode 
                ? "border-neutral-500 bg-neutral-700 text-white placeholder:text-neutral-400 focus:border-blue-400" 
                : "border-neutral-400 bg-white focus:border-blue-500"
            }`}
            placeholder='Add a Comment' />
            <div 
            onClick={()=>{
              if (content.trim()) {
                addComment(post._id)
              }
            }}
            className={`rounded-r-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white h-8 sm:h-10 flex justify-center items-center w-16 sm:w-20 text-sm sm:text-base font-medium transition-colors ${
              !content.trim() ? "opacity-50 cursor-not-allowed" : ""
            }`}>
              Add
            </div>
          </div>
        </div>
    </Modal>
  )
}

export default CommensModal