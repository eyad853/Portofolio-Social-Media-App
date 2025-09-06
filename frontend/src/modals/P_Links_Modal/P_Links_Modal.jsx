import React, { useEffect, useState } from 'react'
import { FaCheck, FaFacebook, FaLinkedinIn, FaYoutube } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import Modal from 'react-modal'
import { RiInstagramFill } from "react-icons/ri";
import { CgWebsite } from "react-icons/cg";
import axios from 'axios';

const P_Links_Modal = ({isLinksModalOpen , setLinksModalOpen,user , setUser}) => {
  const [selectedLinks , setSelectedLinks] = useState([])
  const [linkValues, setLinkValues] = useState({}) // Store actual input values

  // Define placeholder mapping
  const placeholderMap = {
    youtube: 'https://www.youtube.com/@yourchannel',
    facebook: 'https://www.facebook.com/yourusername',
    X: 'https://twitter.com/yourhandle',
    instagram: 'https://www.instagram.com/yourusername',
    linkedin: 'https://www.linkedin.com/in/yourname',
    website: 'https://www.yourwebsite.com'
  }

  const toggleItem = (item) => {
    if(selectedLinks.includes(item)){
      setSelectedLinks(selectedLinks.filter(Link => Link !== item))
      // Remove the value when deselecting
      const newValues = {...linkValues}
      delete newValues[item]
      setLinkValues(newValues)
    } else {
      setSelectedLinks(prev => [...prev, item])
    }
  }

  const handleInputChange = (linkType, value) => {
    setLinkValues(prev => ({...prev, [linkType]: value}))
  }

  const handleAddSocialLinks = async()=>{
        try{
          setUser(prev=>({...prev , socialLinks:linkValues}))
          setLinksModalOpen(false)
          const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/updateUserProfile` , {socialLinks:linkValues} , {withCredentials:true})
          if (response){
            console.log(response.data);
          }
        }catch(err){
          console.log(`social links error : ${err}`)
        }
    }

    useEffect(() => {
      if (user?.socialLinks) {
        const filledLinks = Object.entries(user.socialLinks)
          .filter(([_, value]) => value) // only keep non-empty values
          .map(([key]) => key) // get the keys (link types)
      
        setSelectedLinks(filledLinks)
        setLinkValues(user.socialLinks)
      }
    }, [user , null])

  return (
    <Modal
      isOpen={isLinksModalOpen}
      onRequestClose={()=>{
          setLinksModalOpen(false)
      }}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      className={`w-180 min-h-40 select-none bg-white p-5 rounded-xl shadow-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none`}
      overlayClassName={`fixed inset-0 bg-gray-500/50 z-50 flex justify-center items-center`}
      >
        <div className='w-full h-full flex flex-col gap-3'>
          <div className="font-bold ">Add Your Social Media Links</div>

          <div className="h-20 flex justify-around items-center">
            <div className={`${selectedLinks.includes('youtube')&&'border-2 border-red-600'} w-16 h-16 rounded-full flex justify-center items-center`}>
                <div 
                  onClick={() => toggleItem("youtube")}
                  className="flex justify-center items-center text-white w-12 h-12 rounded-full bg-red-600 cursor-pointer">
                  <FaYoutube  size={20}/>
                </div>
            </div>

            <div className={`${selectedLinks.includes('facebook')&&'border-2 border-blue-600'} w-16 h-16 rounded-full flex justify-center items-center`}>
                <div 
                  onClick={() => toggleItem("facebook")}
                  className="flex justify-center items-center text-white w-12 h-12 rounded-full bg-blue-600 cursor-pointer">
                  <FaFacebook  size={20}/>
                </div>
            </div>

            <div className={`${selectedLinks.includes('X')&&'border-2 border-black'} w-16 h-16 rounded-full flex justify-center items-center`}>
                <div 
                  onClick={() => toggleItem("X")}
                  className="flex justify-center items-center text-white w-12 h-12 rounded-full bg-black cursor-pointer">
                  <FaXTwitter  size={20}/>
                </div>
            </div>

            <div className={`${selectedLinks.includes('instagram')&&'border-2 border-pink-500'} w-16 h-16 rounded-full flex justify-center items-center`}>
                <div 
                  onClick={() => toggleItem("instagram")}
                  className="flex justify-center items-center text-white w-12 h-12 rounded-full bg-gradient-to-b from-pink-500 via-red-600 to-yellow-300 cursor-pointer">
                  <RiInstagramFill  size={20}/>
                </div>
            </div>

            <div className={`${selectedLinks.includes('linkedin')&&'border-2 border-blue-600'} w-16 h-16 rounded-full flex justify-center items-center`}>
                <div 
                  onClick={() => toggleItem("linkedin")}
                  className="flex justify-center items-center text-white w-12 h-12 rounded-full bg-blue-600 cursor-pointer">
                  <FaLinkedinIn  size={20}/>
                </div>
            </div>

            <div className={`${selectedLinks.includes('website')&&'border-2 border-neutral-600'} w-16 h-16 rounded-full flex justify-center items-center`}>
                <div 
                  onClick={() => toggleItem("website")}
                  className="flex justify-center items-center border border-neutral-600 w-12 h-12 rounded-full bg-white cursor-pointer">
                  <CgWebsite size={20}/>
                </div>
            </div>
          </div>

          {selectedLinks.length > 0 && (
            <div className="flex flex-col gap-2">
              {selectedLinks.map(link => (
                <input 
                  key={link}
                  type="text" 
                  className='px-3 font-semibold w-full h-12 outline-none border border-neutral-300 rounded' 
                  placeholder={placeholderMap[link]}
                  value={linkValues[link] || ''}
                  onChange={(e) => handleInputChange(link, e.target.value)}
                />
              ))}
            </div>
          )}

          {selectedLinks.length>0&&(
          <div className="flex justify-end items-center h-16">
            <div 
            onClick={()=>{
              handleAddSocialLinks()
            }}
            className="w-12 h-12 cursor-pointer flex justify-center items-center hover:bg-neutral-300 rounded-full transition-all duration-300">< FaCheck size={20}/></div>
          </div>)}
        </div>
    </Modal>
  )
}

export default P_Links_Modal