import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { FaArrowLeft, FaUser } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import Nav from '../../components/Nav/Nav'

const Friends = ({socket , user , darkMode}) => {
  const [users , setUsers]=useState([])
    const [showingUsers , setShowingUsers]=useState([])
    const [requests , setRequests]=useState([])
    const [loading , setLoading]=useState(false)

    const getRequests = async()=>{
        try{
            setLoading(true)
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/getAllRequests`)
            setRequests(response.data.requests)
            console.log(response.data.requestes);
            setLoading(false)
        }catch(err){
            console.log(err);
        }
    }

    const fetchFriends = async()=>{
        try{
            setLoading(true)
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/allUsers` , {withCredentials:true})
            setUsers(response.data.allUsers)
            setLoading(false)
        }catch(err){
            console.log(err);
        }
    }

    useEffect(()=>{
        fetchFriends()
        getRequests()
    },[])

    const hasRequested = (uid) =>requests.some((r) => r.requester._id === user._id && r.recipient._id === uid);

    const sendRequest = async (recipientId) => {
        // Optimistically update UI
        const alreadySent = hasRequested(recipientId);

        if (!alreadySent) {
          // Add to requests immediately
          setRequests((prev) => [
            ...prev,
            { requester: { _id: user._id }, recipient: { _id: recipientId } }
          ]);
        } else {
          // Remove from requests immediately
          setRequests((prev) =>
            prev.filter(
              (r) =>
                !(
                    (r.recipient._id === recipientId && r.requester._id === user._id) ||
                    (r.requester._id === recipientId && r.recipient._id === user._id)
                )
            )
          );
        }
    
        // Then send request to server
        try {
          await axios.post(`${import.meta.env.VITE_BACKEND_URL}/sendRequest/${recipientId}`, {}, {
            withCredentials: true,
          });
        } catch (err) {
          console.log(err);
          // Optional: rollback UI if request failed
          if (!alreadySent) {
            // Remove the one we just added
            setRequests((prev) =>
              prev.filter(
                (r) => !(r.recipient._id === recipientId && r.requester._id === user._id)
              )
            );
            } else {
            // Re-add it if cancel failed
            setRequests((prev) => [
                ...prev,
                { requester: { _id: user._id }, recipient: { _id: recipientId } }
            ]);
            }
        }
    };

    useEffect(() => {
        if (!user || !users?.length) return;

        const currentUserId = user?._id?.toString();

        // Extract _id from populated friend objects
        const friendIds = new Set(user?.friends?.map(friend => friend?._id.toString()));

        const filteredUsers = users?.filter(u => {
          const uid = u?._id.toString();
          return uid !== currentUserId && !friendIds.has(uid);
        });
    
        setShowingUsers(filteredUsers);
    }, [users, user]);
  return (
    <div className='h-screen w-screen'>
      <header className='fixed top-0 left-0 right-0 z-10'>
          <Nav user={user} darkMode={darkMode}/>
      </header>
      {/* SIDEBAR - Now responsive */}
      <div className={`w-full shadow-md border-neutral-300 h-screen fixed pt-16 border-r flex flex-col ${darkMode?"text-white bg-neutral-800 border-neutral-700":"bg-white"}`}>
                  
                  {/* Header Section */}
                  <div className="flex gap-2 sm:gap-3 items-center px-3 sm:px-4 py-3 sm:py-4 flex-shrink-0">
                      <Link to='/home' className="flex-shrink-0">
                          <FaArrowLeft size={window.innerWidth < 640 ? 24 : 30} className='text-neutral-400'/>
                      </Link>
                      
                      <div className="min-w-0 flex-1">
                          <div className="text-neutral-500 font-semibold text-sm sm:text-base">Friends</div>
                          <div className="font-bold text-xl sm:text-2xl">Suggestions</div>
                          <div className={`font-bold ${darkMode?"text-white":"text-neutral-900"} mt-1 text-sm sm:text-base`}>people you might know</div>
                      </div>
                  </div>
      
                  {/* Users List */}
                  <div className="flex-1 overflow-y-auto hide-scrollbar pb-4">
                      {loading?(
                          <div className="w-full h-full flex justify-center items-start pt-8">
                              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-y animate-spin"></div>
                          </div>
                      ):
                      showingUsers?.length>0?(
                          <div className="w-full">
                              {showingUsers.map((u, index)=>{
                                  return (
                                      <div key={u._id} className={`h-20 sm:h-24 relative cursor-pointer flex ${darkMode?"hover:bg-neutral-900 text-white border-neutral-700":"hover:bg-neutral-100 text-neutral-800 border-neutral-200"} transition-all duration-300 px-2 sm:px-3 items-center justify-between gap-2 sm:gap-3 border-b`}>
      
                                          <Link to={`/home/profile/${u._id}`} className='absolute inset-0'></Link>
      
                                          {/* User Info */}
                                          <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
                                              <div className="w-10 h-10 sm:w-12 sm:h-12 overflow-hidden rounded-full border border-neutral-300 flex-shrink-0">
                                                  {u && u.avatar ? (
                                                      <img src={u?.avatar} className='w-full h-full rounded-full object-cover' />
                                                  ) : (
                                                      <div className='w-full text-2xl sm:text-4xl h-full flex justify-center items-end mt-1 rounded-full'>
                                                          <FaUser className=''/>
                                                      </div>
                                                  )}
                                              </div>
      
                                              <div className="font-bold text-sm sm:text-base truncate flex-1 min-w-0 pr-2">
                                                  {u.username}
                                              </div>
                                          </div>
      
                                          {/* Action Buttons */}
                                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0">
                                              <div 
                                              onClick={() => sendRequest(u._id)}
                                              className={`${hasRequested(u._id)?"bg-neutral-500" :"bg-blue-500"} flex cursor-pointer z-20 transform hover:scale-105 transition-all duration-300 justify-center items-center h-7 sm:h-8 w-20 sm:w-28 rounded-md text-xs font-bold text-white`}>
                                                  {hasRequested(u._id) ? "Cancel" : "Add Friend"}
                                              </div>
                                              
                                              {!hasRequested(u._id) && (
                                                  <div 
                                                  onClick={()=>{
                                                      setShowingUsers(prev=>prev.filter(u=>u._id!==u._id))
                                                  }}
                                                  className="bg-red-600 flex cursor-pointer z-20 transform hover:scale-105 transition-all duration-300 justify-center items-center h-7 sm:h-8 w-20 sm:w-28 rounded-md text-xs font-bold text-white">
                                                      Remove
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                  )
                              })}
                          </div>
                      ):(
                          <div className={`w-full h-full flex justify-center font-bold items-center text-lg sm:text-xl ${darkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                              No Users Found
                          </div>
                      )}
                  </div>
              </div>
     </div>
  )
}

export default Friends