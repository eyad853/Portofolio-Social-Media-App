import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Modal from 'react-modal';
import { Keyboard, Plus, User, Video } from "lucide-react";
import { FaUser, FaVideo } from "react-icons/fa";
import { FaRegImage } from "react-icons/fa6";
import axios from 'axios'

const StoryPart = ({ stories, setStories, user, darkMode,setShowSM }) => {
  const [showStoryOptionsModal, setShowStoryOptionsModal] = useState(false);
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('story', file);

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/story/create`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload success:', res.data);
      // Refresh stories after upload
      // You might want to call your fetch stories function here
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleVideoPhotoClick = () => {
    fileInputRef.current.click();
  };

  // Function to check if a user has stories (within last 24 hours)
  const userHasStories = (userId) => {
    
    const userStories = stories?.filter(story => {
      // Handle both cases: story.user as string/ObjectId or populated object
      const storyUserId = typeof story.user === 'object' ? story?.user._id : story?.user;
      return storyUserId === userId || storyUserId?.toString() === userId?.toString();
    });
    
    
    
    if (userStories?.length === 0) return false;
    
    // Check if any story is within the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const hasRecentStories = userStories?.some(story => new Date(story.createdAt) > twentyFourHoursAgo);
    
    return hasRecentStories;
  };

  // Function to check if current user has stories
  const currentUserHasStories = () => {
    return userHasStories(user?._id);
  };

  const handleClick = () => {
    setShowSM(true);
    setTimeout(() => {
      setShowSM(false);
    }, 2000); // hide after 2 seconds
  };

  return (
    <div className={`w-full font-semibold h-32 mb-5 rounded-2xl px-2 ${darkMode ? "bg-neutral-700 text-white" : "bg-white"} flex overflow-x-auto gap-2.5 items-center relative`}>
      {/* Your Story Section */}
      <div className='flex flex-col gap-1'>
        <div 
        onClick={()=>{
          handleClick()
        }}
        className={`w-17 h-17 relative rounded-full ${currentUserHasStories() ? 'bg-gradient-to-r from-orange-400 to-pink-500' : 'bg-gray-300'} flex justify-center items-center p-0.5`}>
          <div
            className='w-16 cursor-pointer overflow-hidden h-16 rounded-full bg-neutral-300'
          >
            {user && user?.avatar ? (
              <img src={user.avatar} className='w-full h-full rounded-full object-cover' alt="Your avatar" />
            ) : (
              <div className='w-full text-5xl h-full flex overflow-hidden justify-center items-center mt-1 rounded-full bg-gray-200'>
                <FaUser className='rounded-b-2xl mt-2.5 text-gray-500' />
              </div>
            )}
          </div>
          {/* Plus button */}
          <div
            className='absolute overflow-hidden cursor-pointer text-white -right-1 -bottom-1 rounded-full w-6 h-6 bg-blue-500 flex justify-center items-center'
            onClick={() => setShowStoryOptionsModal(true)}
            aria-label="Add to your story"
          >
            <Plus size={10} className='rounded-full' />
          </div>
        </div>
        <div className="text-xs text-center">Your Story</div>
      </div>

      {/* Friends' Stories Section */}
      <div className="flex gap-2.5">
        {user?.friends?.map((friend) => {
          const friendHasStories = userHasStories(friend._id);
          
          
          return (
            <div key={friend._id} className='flex flex-col gap-1'>
              <div className={`w-17 h-17 relative cursor-pointer rounded-full ${friendHasStories ? 'bg-gradient-to-r from-green-400 to-blue-500' : 'bg-gray-300'} flex justify-center items-center p-0.5`}>
                <div
                  className='w-16 h-16 rounded-full bg-neutral-400 overflow-hidden block'
                  onClick={(e) => {
                    handleClick()
                  }}
                >
                  <img 
                    src={friend.avatar} 
                    className='w-full h-full rounded-full object-cover' 
                    alt={`${friend.username}'s avatar`} 
                  />
                </div>
                {friendHasStories && (
                  <div className='absolute inset-0 border-2 border-green-400 rounded-full animate-pulse'></div>
                )}
              </div>
              <div className="text-xs text-center">{friend.username}</div>
            </div>
          );
        })}
      </div>

      {/* Story Options Modal */}
      <Modal
        isOpen={showStoryOptionsModal}
        onRequestClose={() => setShowStoryOptionsModal(false)}
        contentLabel="Create Story Options"
        className="flex justify-center items-center h-50"
        overlayClassName="fixed inset-0 bg-gray-500/50 bg-opacity-50 flex justify-center items-center"
      >
        <div
          className={`rounded-xl p-6 shadow-2xl transform transition-all duration-300 scale-100 ${darkMode ? 'bg-neutral-800 text-white' : 'bg-white text-gray-800'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold mb-4 text-center">Add Story</h3>
          <div className="flex flex-col gap-4">
            <button
              onClick={handleVideoPhotoClick}
              className="flex relative items-center justify-center p-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 shadow-md transform hover:scale-105"
            >
              <input
                type="file"
                ref={fileInputRef}
                name="story"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0"
                accept="image/*,video/*"
              />
              <FaRegImage className="mr-2" size={20} /> 
              <FaVideo className="mr-2" size={20} /> 
              Video or Photo
            </button>
            <Link
              to="/home/create-text-story"
              onClick={() => setShowStoryOptionsModal(false)}
              className="flex items-center justify-center p-4 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all duration-300 shadow-md transform hover:scale-105"
            >
              <Keyboard className="mr-3" size={20} /> Text
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StoryPart;