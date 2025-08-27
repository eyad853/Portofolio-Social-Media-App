import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trash2, User } from 'lucide-react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const StoryView = ({ stories, setStories }) => {
  const { userId } = useParams(); // Get userId from URL
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userStories, setUserStories] = useState([]);

  // Filter stories based on userId from URL
  useEffect(() => {
    console.log('StoryView - userId from params:', userId);
    console.log('StoryView - all stories:', stories);
    
    if (userId && stories.length > 0) {
      const filteredStories = stories.filter(story => {
        // Handle both cases: story.user as string/ObjectId or populated object
        const storyUserId = typeof story.user === 'object' ? story.user._id : story.user;
        const matches = storyUserId === userId || storyUserId?.toString() === userId?.toString();
        console.log('Story user:', storyUserId, 'matches userId:', userId, '=', matches);
        return matches;
      });
      
      console.log('Filtered stories:', filteredStories);
      
      // Filter stories from last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentStories = filteredStories.filter(story => new Date(story.createdAt) > twentyFourHoursAgo);
      
      console.log('Recent stories:', recentStories);
      
      setUserStories(recentStories);
      setCurrentStoryIndex(0); // Reset to first story
    }
  }, [userId, stories]);

  const currentStory = userStories[currentStoryIndex];

  const nextStory = () => {
    setCurrentStoryIndex((prev) => (prev + 1) % userStories.length);
  };

  const prevStory = () => {
    setCurrentStoryIndex((prev) => (prev - 1 + userStories.length) % userStories.length);
  };

  const deleteStory = async (storyId) => {
    setLoading(true);
    try {
      const response = await axios.delete(`http://localhost:8000/story/delete/${storyId}`, {
        withCredentials: true
      });
      
      const data = response.data;
      
      if (data.error) {
        console.error('Error deleting story:', data.message);
        alert('Failed to delete story');
        return;
      }
      
      // Update both the main stories array and filtered userStories
      const updatedStories = stories.filter(story => story._id !== storyId);
      setStories(updatedStories);
      
      const updatedUserStories = userStories.filter(story => story._id !== storyId);
      setUserStories(updatedUserStories);
      
      if (updatedUserStories.length === 0) {
        // No more stories for this user, redirect back or show message
        return;
      }
      
      // Adjust current index if needed
      if (currentStoryIndex >= updatedUserStories.length) {
        setCurrentStoryIndex(updatedUserStories.length - 1);
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete story');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const storyDate = new Date(date);
    const diffInMs = now - storyDate;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInHours >= 1) {
      return `${diffInHours}h ago`;
    } else if (diffInMinutes >= 1) {
      return `${diffInMinutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  // Get user info for the current story
  const getUserInfo = (story) => {
    // You might need to fetch user info or it might be populated in the story
    // For now, assuming you have user info in the story or need to fetch it
    return story.user || { username: 'Unknown User' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading stories...</div>
      </div>
    );
  }

  if (userStories.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">No stories available for this user</div>
      </div>
    );
  }

  const renderStoryContent = (story) => {
    switch (story.mediaType) {
      case 'image':
        return (
          <img
            src={story.mediaUrl}
            alt="Story"
            className="w-full h-full object-cover rounded-lg"
          />
        );
      case 'video':
        return (
          <video
            src={story.mediaUrl}
            controls
            className="w-full h-full object-cover rounded-lg"
            autoPlay
          />
        );
      case 'text':
        return (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center p-8">
            <p className="text-white text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-center leading-relaxed max-w-2xl">
              {story.caption}
            </p>
          </div>
        );
      default:
        return (
          <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-white">Unsupported media type</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Delete Button */}
      <button
        onClick={() => deleteStory(currentStory._id)}
        className="absolute top-4 right-4 z-20 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors shadow-lg md:top-6 md:right-6"
        disabled={loading}
      >
        <Trash2 size={20} />
      </button>

      {/* Story Counter */}
      <div className="absolute top-4 left-4 z-20 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm md:top-6 md:left-6">
        {currentStoryIndex + 1} / {userStories.length}
      </div>

      {/* User Info */}
      <div className="absolute top-16 left-4 z-20 flex items-center space-x-3 md:top-20 md:left-6">
        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
        <div>
          <p className="text-white font-medium text-sm">
            {getUserInfo(currentStory).username || 'Unknown User'}
          </p>
          <p className="text-gray-300 text-xs">
            {formatTimeAgo(currentStory.createdAt)}
          </p>
        </div>
      </div>

      {/* Left Arrow */}
      <button
        onClick={prevStory}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all md:left-8 lg:left-12"
        disabled={userStories.length <= 1}
      >
        <ChevronLeft size={24} />
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextStory}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all md:right-8 lg:right-12"
        disabled={userStories.length <= 1}
      >
        <ChevronRight size={24} />
      </button>

      {/* Story Content Container */}
      <div className="w-full max-w-sm mx-4 sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-3xl 2xl:max-w-4xl">
        <div className="aspect-[9/16] max-h-[85vh] relative">
          {renderStoryContent(currentStory)}
          
          {/* Caption for image/video stories */}
          {(currentStory.mediaType === 'image' || currentStory.mediaType === 'video') && currentStory.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 rounded-b-lg">
              <p className="text-white text-sm md:text-base lg:text-lg leading-relaxed">
                {currentStory.caption}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Story Progress Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 md:bottom-6">
        {userStories.map((_, index) => (
          <div
            key={index}
            className={`h-1 w-8 rounded-full transition-all ${
              index === currentStoryIndex 
                ? 'bg-white' 
                : 'bg-white bg-opacity-30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default StoryView;