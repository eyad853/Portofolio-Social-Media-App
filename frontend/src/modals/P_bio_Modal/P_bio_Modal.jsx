import axios from 'axios'
import React, { useEffect, useState } from 'react'
import Modal from 'react-modal'
import { FaCheck } from "react-icons/fa6";

const P_bio_Modal = ({isBioModalOpen,setIsBioModalOpen,user, setUser}) => {
    const [bio , setBio]=useState('')

    const handleAddBio = async()=>{
        try{
          setUser(prev=>({...prev , bio}))
          setIsBioModalOpen(false)
          const response = await axios.patch(`http://localhost:8000/updateUserProfile` , {bio} , {withCredentials:true})
          if (response){
            console.log(response.data);
          }
        }catch(err){
          console.log(`bio error : ${err}`)
        }
    }

    useEffect(()=>{
      setBio(user.bio||"")
    },[user])

  return (
    <Modal
        isOpen={isBioModalOpen}
        onRequestClose={()=>{
            setIsBioModalOpen(false)
        }}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        className={`w-180 min-h-50 select-none bg-white p-5 rounded-xl shadow-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none`}
        overlayClassName={`fixed inset-0 bg-gray-500/50 z-50 flex justify-center items-center`}
        >
        <div className="w-full h-full flex gap-2 flex-col">
            <div className="font-semibold">Bio :</div>
            <textarea 
            type="text" 
            value={bio}
            onChange={({target})=>{
              setBio(target.value)
            }}
            className='w-full min-h-20 max-h-20 p-1 rounded-md border border-neutral-300 outline-none' 
            placeholder='write your bio ...'/>

            <div className="flex h-6 mt-3 px-3 w-full items-center justify-center">
              <div 
              onClick={()=>{
                handleAddBio()
              }}
              className="w-full h-ful bg-blue-600 flex justify-center items-center rounded-2xl cursor-pointer transform hover:scale-105 transition-all duration-300 text-white py-2">Add a Bio</div>
            </div>
        </div>
    </Modal>
  )
}

export default P_bio_Modal