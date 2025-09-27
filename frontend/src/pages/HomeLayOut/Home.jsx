// FIXED HOME COMPONENT - Better Mobile UX
import React, { useEffect, useState } from 'react'
import Nav from '../../components/Nav/Nav'
import UserBox from '../../components/UserBox/UserBox'
import SelectionSideBar from '../../components/SelectionSideBar/SelectionSideBar'
import { FaHeart, FaSearch, FaUser } from 'react-icons/fa'
import StoryPart from '../../components/StoryPart/StoryPart'
import CreatePostPart from '../../components/CreatePostPart/CreatePostPart'
import { IoMdClose } from "react-icons/io";
import { IoEllipsisHorizontal } from "react-icons/io5";
import { FaRegHeart } from "react-icons/fa6";
import { FaRegComment } from "react-icons/fa6";
import { CiShare2 } from "react-icons/ci";
import axios from 'axios'
import LikesModal from '../../modals/LikesModal/LikesModal'
import CommensModal from '../../modals/CommentsModal/CommensModal'
import { Link } from 'react-router-dom'
import ShareModal from '../../modals/ShareModal/ShareModal '

const Home = ({user,stories,setStories , posts ,setPosts, socket,darkMode , setDarkMode,userFollowing,loading, setUserFollowing ,userFollowers, setUserFollowers}) => {
    const [expandedPosts, setExpandedPosts] = useState({});
    const [expandedMedia, setExpandedMedia] = useState({});

    const [content , setContent]=useState('')

    const [isLikesModalOpen , setIsLikesModalOpen]=useState(false)
    const [isCommentsModalOpen , setIsCommentsModalOpen]=useState(false)
    const [isShareModalOpen , setIsShareModalOpen]=useState(false)
    const [selectedPostId, setSelectedPostId] = useState(null)

    const [showSM,setShowSM]=useState(false)

    const [isThereUnseenNotfications , setIsThereUnseenNotfications]=useState(false)
    
    // Toggle expanded state for a specific post
    const toggleExpandPost = (postId) => {
        setExpandedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    // Toggle expanded state for media
    const toggleExpandMedia = (postId, mediaIndex) => {
        const mediaKey = `${postId}-${mediaIndex}`;
        setExpandedMedia(prev => ({
            ...prev,
            [mediaKey]: !prev[mediaKey]
        }));
    };

    const API_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        socket.on('newPost' , (data)=>{
            setPosts(prev=>[...prev , data])
        })

        socket.on('newLike', (newLike) => {
            if(newLike.user._id ===user._id) return
            setPosts((prevPosts) => {
            const index = prevPosts.findIndex(p => p._id === newLike.post._id);
            if (index === -1) return prevPosts;
        
            const post = prevPosts[index];
        
            // Avoid duplicate
            const alreadyLiked = post?.likes?.some(u => u?._id === newLike?.user?._id);
            if (alreadyLiked) return prevPosts;
        
            const updatedPost = {
                ...post,
                likes: [...(post.likes || []), newLike.user],
            };
        
            const updatedPosts = [...prevPosts];
            updatedPosts[index] = updatedPost;
        
            return updatedPosts;
            });
        });

            socket.on('likeDeleted', ({ postId, userId }) => {
            if(userId===user._id) return
            setPosts(prevPosts =>prevPosts.map(post => {
                if (post._id === postId) {
                    return {
                    ...post,
                  // Remove the user from the likes array (if it's populated)
                    likes: post.likes ? post.likes.filter(likeUser => likeUser._id !== userId) : post.likes,
                };
                }
                return post;
            })
            );
        });

        socket.on('newComment', (newComment) => {
            if(newComment.user._id ===user._id) return
            setPosts((prevPosts) =>
                prevPosts.map((post) => {
                    if (post._id === newComment.post._id) {
                    const alreadyExists = post.comments?.some(
                        (comment) => comment._id === newComment._id
                    );
                
                    if (alreadyExists) return post;
                
                    return {
                        ...post,
                        comments: [...(post.comments || []), newComment],
                    };
                }
                return post;
            })
            );
        });

        socket.on('commentDeleted' , (data)=>{
        
        })

        socket.on('newShare' , (data)=>{
        
        })

        socket.on('newFollow' , (data)=>{
            if (data.following === user._id) {
                setUserFollowers(prev => [...prev, data]);
            }   
        })

        socket.on('unfollow' , (data)=>{
            if (data.following === user._id) {
                setUserFollowers(prev => prev.filter(f => f.follower !== data.follower));
            }
        })
    
        // Clean up the socket listeners when component unmounts
        return () => {
            socket.off('newLike');
            socket.off('likeDeleted');
            socket.off('newComment');
            socket.off('commentDeleted');
            socket.off('newShare');
            socket.off('newFollow');
            socket.off('unfollow');
            socket.off('newPost');
        };
    }, [socket , user]);

// Likes Services
const likePost = async (postId) => {
try {
    const response = await axios.post(`${API_URL}/post/${postId}/like`, {}, { withCredentials: true });
  } catch (error) {
    console.error('Error liking post:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Something went wrong' };
  }
};

const unlikePost = async (postId) => {
try {
    const response = await axios.delete(`${API_URL}/post/${postId}/unlike`, { withCredentials: true });
  } catch (error) {
    console.error('Error unliking post:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Something went wrong' };
  }
};

const getPostsLikes = async () => {
try {
    const response = await axios.get(`${API_URL}/post/getAll/likes`, { withCredentials: true });

    const likes = response.data.likes;

    // Group likes by post._id
    const likesByPost = likes.reduce((acc, like) => {
        const postId = like.post._id;
        if (!acc[postId]) acc[postId] = [];
        acc[postId].push(like.user); // you now have the full user object
        return acc;
    }, {});

    // Update each post in the frontend
    setPosts((prevPosts) =>
        prevPosts?.map((post) => ({
        ...post,
        likes: likesByPost[post._id] || [], // add a `.likes` field
      }))
    );
  } catch (error) {
    console.error('Error fetching likes:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Something went wrong' };
  }
};

const getUnseenNotifications = async () => {
  try {
    const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/notifications/getAll`, {
      withCredentials: true,
    });

    if (data?.notifications?.length) {
      const unseen = data.notifications.some(n => !n.seen);
      setIsThereUnseenNotfications(unseen); // make sure state setter name is correct
    } else {
      setIsThereUnseenNotfications(false);
    }
  } catch (err) {
    console.log(err);
  }
};

useEffect(()=>{
    getPostsLikes()
    getPostComments()
    getUserFollowers()
    getUserFollowing()
    getUnseenNotifications()
},[])

// Comments Services
const addComment = async (postId) => {
  if (!content.trim()) return;

  const newComment = {
    _id: Date.now().toString(), // Temporary ID (unique)
    content: content.trim(),
    user: user, // Your current user object (should be populated)
    post: { _id: postId },
    createdAt: new Date().toISOString(),
  };

  // Instantly update the UI
  setPosts((prevPosts) =>
    prevPosts.map((post) =>
      post._id === postId
        ? { ...post, comments: [...(post.comments || []), newComment] }
        : post
    )
  );

  setContent(""); // Clear input immediately

  // Now send to backend
  try {
    await axios.post(
      `${API_URL}/post/${postId}/comment`,
      { content },
      { withCredentials: true }
    );
  } catch (err) {
    console.error("Comment send failed", err);
    // Optional: Remove the fake comment or show retry
  }
};

const deleteComment = async (commentId) => {
try {
    const response = await axios.delete(`${API_URL}/comment/${commentId}`, { withCredentials: true });
  } catch (error) {
    console.error('Error deleting comment:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Something went wrong' };
  }
};

const getPostComments = async () => {
try {
    const response = await axios.get(`${API_URL}/post/getAll/comments`, {
        withCredentials: true,
    });

    const comments = response.data.comments;

    // Group comments by postId
    const commentsByPost = comments.reduce((acc, comment) => {
        const postId = comment.post._id;
        if (!acc[postId]) acc[postId] = [];
        acc[postId].push(comment); // store full comment, not just the user
        return acc;
    }, {});

    // Update posts with their comments
    setPosts((prevPosts) =>
        prevPosts?.map((post) => ({
        ...post,
        comments: commentsByPost[post._id] || [], // add `.comments` field to each post
        }))
    );
} catch (error) {
    console.error('Error fetching comments:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Something went wrong' };
}
};

// Follow Services
const followUser = async (userId) => {
try {
    const response = await axios.post(`${API_URL}/user/${userId}/follow`, {}, { withCredentials: true });
  } catch (error) {
    console.error('Error following user:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Something went wrong' };
  }
};

const unfollowUser = async (userId) => {
try {
    const response = await axios.delete(`${API_URL}/user/${userId}/unfollow`, { withCredentials: true });
  } catch (error) {
    console.error('Error unfollowing user:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Something went wrong' };
  }
};

const getUserFollowers = async () => {
    if(!user)return

try {
    const response = await axios.get(`${API_URL}/user/followers`, { withCredentials: true });
    setUserFollowers(response.data.followers);
  } catch (error) {
    console.error('Error fetching followers:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Something went wrong' };
  }
};

const getUserFollowing = async () => {
    if(!user)return
try {
    const response = await axios.get(`${API_URL}/user/following`, { withCredentials: true });
     const followingIds = response.data.following.map(f => f.following._id);
    setUserFollowing(followingIds);
  } catch (error) {
    console.error('Error fetching following:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Something went wrong' };
  }
};

const handleFollowToggle = async (userId) => {
  const isCurrentlyFollowing = userFollowing.includes(userId);
  
  // Optimistically update the UI first
  if (isCurrentlyFollowing) {
    // Remove from following list
    setUserFollowing(prev => prev.filter(id => id !== userId));
  } else {
    // Add to following list
    setUserFollowing(prev => [...prev, userId]);
  }
  
  // Then make the backend request
  try {
    if (isCurrentlyFollowing) {
      await unfollowUser(userId);
    } else {
      await followUser(userId);
    }
  } catch (error) {
    // If backend fails, revert the optimistic update
    if (isCurrentlyFollowing) {
      setUserFollowing(prev => [...prev, userId]);
    } else {
      setUserFollowing(prev => prev.filter(id => id !== userId));
    }
    console.error('Follow/unfollow failed:', error);
  }
};



  return (
    <>
    {loading?(
        <div className={`w-screen h-screen ${darkMode?"bg-neutral-800":"bg-white"} flex justify-center items-center`}>
            <div className={`w-50 h-50 rounded-full ${darkMode?"border-white":""} border-y animate-spin`}></div>
        </div>
    ):(<div className={`min-h-screen flex flex-col ${darkMode?"bg-neutral-800 text-white":"bg-gray-100"}`}>
      {/* Fixed header - this will be fixed at the top */}
      <header className='fixed top-0 left-0 right-0 z-10'>
          <Nav isThereUnseenNotfications={isThereUnseenNotfications} user={user} darkMode={darkMode}/>
      </header>

      {/* Mobile/Tablet Top Section - Only visible on mobile/tablet */}
      <div className="xl:hidden pt-16 px-2 sm:px-5">
        <div className="mb-4">
          <UserBox 
            user={user} 
            darkMode={darkMode}
            userFollowing={userFollowing}
            userFollowers={userFollowers}
            posts={posts}
          />
        </div>
        <div className="mb-4">
          <SelectionSideBar isThereUnseenNotfications={isThereUnseenNotfications} user={user} darkMode={darkMode}/>
        </div>
        
        {/* Friends/Messages Section for Mobile/Tablet */}
        <div className={`w-full mb-4 p-3 ${darkMode?"bg-neutral-700 text-white":"bg-white"} rounded-2xl flex flex-col`}>
          <div className='font-bold text-lg sm:text-xl mb-3'>
              messages
          </div>
          <div className={`flex w-full h-8 sm:h-9 rounded-full mb-3 ${darkMode?"bg-neutral-800 text-white":"bg-gray-100"}`}>
              <div className='w-8 sm:w-10 cursor-pointer h-full rounded-l-full flex justify-center items-center text-sm sm:text-base'><FaSearch /></div>
              <input type="text" className='outline-none w-full h-full rounded-r-full bg-transparent text-sm sm:text-base' placeholder='Search'/>
          </div>
          
          {/* friends - horizontal scroll on mobile/tablet */}
          <div className='w-full flex overflow-x-auto gap-3 pb-2'>
              {user?.friends?.map(f=>(
                  <Link
                  to={`/home/chats/${f._id}`}
                  key={f._id} 
                  className="flex-shrink-0 items-center h-10 sm:h-12 flex gap-2.5 hover:bg-neutral-200 transition-all rounded-2xl px-3 duration-300 cursor-pointer whitespace-nowrap">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full">
                          {f&&f.avatar ? (
                              <img src={f.avatar} className='w-full h-full rounded-full object-cover' />
                          ) : (
                              <div className='w-full text-xl sm:text-3xl h-full flex justify-center items-center mt-1 rounded-full'>
                                  <FaUser className='rounded-b-2xl'/>
                              </div>
                          )}
                      </div>
                      <div className="font-bold text-sm sm:text-base">{f.username}</div>
                  </Link>
              ))}
          </div>
        </div>
      </div>
    
      <main className={`flex-1 px-2 sm:px-5 ${darkMode?"bg-neutral-800 text-white":"bg-gray-100"} flex flex-col xl:flex-row gap-2 sm:gap-5 xl:pt-16`}>
        {/* Left sidebar - Only visible on desktop */}
        <div className='hidden xl:flex xl:fixed xl:pb-3 xl:top-16 xl:h-[calc(100vh-64px)] xl:left-5 xl:w-[20%] flex-col pt-5'>
            <UserBox 
            user={user} 
            darkMode={darkMode}
            userFollowing={userFollowing}
            userFollowers={userFollowers}
            posts={posts}
            />
            <SelectionSideBar isThereUnseenNotfications={isThereUnseenNotfications}  user={user} darkMode={darkMode}/>
        </div>

        {/* Main content */}
        <div className='w-full xl:w-[58%] xl:ml-[calc(20%+27px)] pb-5 xl:mr-[calc(22%+30px)] flex flex-col overflow-auto'>
            <StoryPart setShowSM={setShowSM} stories={stories} setStories={setStories} user={user} darkMode={darkMode}/>
            <CreatePostPart user={user} darkMode={darkMode}/>

            {/* posts part */}
            {posts?.length > 0 ?(
                posts.map(post=>(
                    <div 
                    key={post._id}
                    className={`w-full ${darkMode?"bg-neutral-700 text-white":"bg-white"} border flex flex-col ${darkMode?"border-neutral-800":"border-neutral-300"} mt-6 rounded-2xl`}
                    >
                        <div className='w-full h-12 rounded-t-2xl flex items-center justify-between px-2.5'>
                            <div className='h-full flex justify-start items-center gap-2.5'>
                                <Link to={`/home/profile/${post?.user?._id}`} className='w-8 h-8 sm:w-10 sm:h-10 rounded-full flex justify-center items-center'>
                                    {post?.user?.avatar?(
                                        <img src={post?.user?.avatar} className='w-full h-full rounded-full object-cover' alt="" />
                                        ):(
                                        <div className='w-full text-xl sm:text-3xl h-full flex justify-center items-end mt-1 rounded-full'>
                                            <FaUser className='rounded-b-2xl mt-2'/>
                                        </div>
                                        )}
                                </Link>
                                <Link to={`/home/profile/${post?.user?._id}`} className='font-semibold text-sm sm:text-base'>
                                    {post?.user?.username}
                                </Link>
                                {post?.user?._id!==user?._id&&(
                                    <div 
                                    onClick={() => handleFollowToggle(post?.user?._id)}
                                    className={`cursor-pointer flex items-center px-2 py-1 rounded text-xs sm:text-sm ${
                                    userFollowing.includes(post?.user?._id) 
                                    ? 'text-gray-500 ' 
                                    : 'text-blue-500'
                                    }`}
                                >
                                    {userFollowing?.includes(post?.user?._id) ? 'Following' : 'Follow'}
                                </div>)}
                            </div>

                            <div className='flex text-lg sm:text-xl items-center justify-between h-full w-16 sm:w-20'>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-neutral-200 transition-all duration-200 flex justify-center items-center">
                                    < IoEllipsisHorizontal/>
                                </div>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-neutral-200 transition-all duration-200 flex justify-center items-center">
                                    < IoMdClose/>
                                </div>
                            </div>
                        </div>

                        <div className='w-full flex-1 flex flex-col rounded-b-2xl'>
                             {/*content */}
                            <div className='w-full flex-1 flex flex-col'>
                                <div className='px-3 py-2'>
                                    {/* Text content with read more functionality */}
                                    {post?.content?.length > 150 && !expandedPosts[post._id] ? (
                                        <div>
                                            <p className='mb-1 text-sm sm:text-base'>{post.content.substring(0, 250)}...</p>
                                            <button 
                                                onClick={() => toggleExpandPost(post._id)}
                                                className='text-blue-500 hover:underline font-medium text-sm'
                                            >
                                                Read more
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className='mb-1 text-sm sm:text-base'>{post.content}</p>
                                            {post.content.length > 150 && expandedPosts[post._id] && (
                                                <button 
                                                    onClick={() => toggleExpandPost(post._id)}
                                                    className='text-blue-500 hover:underline font-medium text-sm'
                                                >
                                                    Show less
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {post.media.length > 0 && (
                                    <div className='w-full flex flex-col gap-3 mb-2'>
                                        {post.media.map((mediaItem, index) => {
                                            const mediaKey = `${post._id}-${index}`;
                                            const isExpanded = expandedMedia[mediaKey];
                                            
                                            return (
                                                <div key={index} className="w-full">
                                                    {mediaItem.type === 'image' ? (
                                                        <div className="w-full relative">
                                                            <div className={`w-full ${isExpanded ? '' : 'max-h-60 sm:max-h-80'} overflow-hidden`}>
                                                                <img
                                                                    src={`${import.meta.env.VITE_BACKEND_URL}${mediaItem.url}`}
                                                                    alt=""
                                                                    className="w-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex justify-center w-full mt-1">
                                                                <button
                                                                    onClick={() => toggleExpandMedia(post._id, index)}
                                                                    className="text-blue-500 hover:underline font-medium text-sm"
                                                                >
                                                                    {isExpanded ? 'Show less' : 'Show more'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : mediaItem.type === 'video' ? (
                                                        <div className="w-full relative">
                                                            <div className={`w-full ${isExpanded ? '' : 'max-h-60 sm:max-h-80'} overflow-hidden`}>
                                                                <video
                                                                    src={`${import.meta.env.VITE_BACKEND_URL}${mediaItem.url}`}
                                                                    controls
                                                                    className="w-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex justify-center w-full mt-1">
                                                                <button
                                                                    onClick={() => toggleExpandMedia(post._id, index)}
                                                                    className="text-blue-500 hover:underline font-medium text-sm"
                                                                >
                                                                    {isExpanded ? 'Show less' : 'Show more'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className='w-full h-12 border-t border-neutral-300 flex justify-around items-center'>
                            <div 
                                className="h-full flex font-semibold text-neutral-500 items-center justify-center cursor-pointer hover:bg-neutral-200 transition-all duration-200 rounded-md"
                            >
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        setSelectedPostId(post._id);

                                        // First, check if already liked
                                        const currentPost = posts.find(p => p._id === post._id);
                                        const alreadyLiked = currentPost?.likes?.some((u) => u?._id === user?._id);

                                        // Update UI immediately (optimistic update)
                                        setPosts((prevPosts) =>
                                            prevPosts.map((p) => {
                                                if (p._id !== post._id) return p;

                                                let updatedLikes;
                                                if (alreadyLiked) {
                                                    updatedLikes = p.likes.filter((u) => u._id !== user._id);
                                                } else {
                                                    updatedLikes = [...(p.likes || []), user];
                                                }
                                            
                                                return { ...p, likes: updatedLikes };
                                            })
                                        );

                                        // Then send API request
                                        try {
                                            if (alreadyLiked) {
                                                await unlikePost(post._id);
                                            } else {
                                                await likePost(post._id);
                                            }
                                        } catch (error) {
                                            // If API fails, revert the optimistic update
                                            setPosts((prevPosts) =>
                                                prevPosts.map((p) => {
                                                    if (p._id !== post._id) return p;

                                                    let revertedLikes;
                                                    if (alreadyLiked) {
                                                        // If unlike failed, add the user back
                                                        revertedLikes = [...(p.likes || []), user];
                                                    } else {
                                                        // If like failed, remove the user
                                                        revertedLikes = p.likes.filter((u) => u._id !== user._id);
                                                    }
                                                
                                                    return { ...p, likes: revertedLikes };
                                                })
                                            );
                                            console.error('Like/unlike operation failed:', error);
                                        }
                                    }}
                                    className="h-full w-full gap-1 flex justify-center items-center text-xs sm:text-sm px-1 sm:px-2"
                                >
                                    <div className="">
                                        {post?.likes?.some((u) => u?._id === user?._id) ? (
                                            <FaHeart className="text-red-500" />
                                        ) : (
                                            <FaRegHeart />
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="">
                                            {post?.likes?.length > 0 ? post?.likes?.length : 0} 
                                        </div>
                                        <div className="hidden sm:block">
                                            Likes
                                        </div>
                                    </div>
                                </button>
                            </div>

                                <div 
                                onClick={()=>{
                                    setIsCommentsModalOpen(true)
                                    setSelectedPostId(post._id)
                                }}
                                className="h-full flex gap-1.5 font-semibold text-neutral-500 items-center justify-center cursor-pointer hover:bg-neutral-200 transition-all duration-200 rounded-md px-1 sm:px-2 text-xs sm:text-sm">
                                    <div className="">< FaRegComment/></div>
                                    <div className="">{post?.comments?.length>0?post?.comments?.length:0} <span className="hidden sm:inline">Comments</span></div>
                                </div>
                                <div 
                                onClick={()=>{
                                    setIsShareModalOpen(true) 
                                    setSelectedPostId(post._id)
                                }}
                                className="h-full flex gap-1.5 font-semibold text-neutral-500 items-center justify-center cursor-pointer hover:bg-neutral-200 transition-all duration-200 rounded-md px-1 sm:px-2 text-xs sm:text-sm">
                                    <div className="">< CiShare2/></div>
                                    <div className="hidden sm:block">Share</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ):null}
        </div>

        {/* Right sidebar - Only visible on desktop */}
        <div className={`hidden xl:flex xl:fixed xl:top-16 xl:mt-5 xl:rounded-t-2xl xl:h-[calc(100vh-64px)] xl:right-5 xl:w-[22%] p-3 ${darkMode?"bg-neutral-700 text-white":"bg-white"} flex-col`}>
            <div className='font-bold text-lg sm:text-xl'>
                messages
            </div>
            <div className={`flex w-full h-8 sm:h-9 rounded-full mt-3 ${darkMode?"bg-neutral-800 text-white":"bg-gray-100"}`}>
                <div className='w-8 sm:w-10 cursor-pointer h-full rounded-l-full flex justify-center items-center text-sm sm:text-base'><FaSearch /></div>
                <input type="text" className='outline-none w-full h-full rounded-r-full bg-transparent text-sm sm:text-base' placeholder='Search'/>
            </div>
            
            {/* friends */}
            <div className='w-full flex-1 overflow-y-auto flex flex-col gap-1 mt-3.5 rounded-b-2xl'>
                {user?.friends?.map(f=>(
                    <Link
                    to={`/home/chats/${f._id}`}
                    key={f._id} 
                    className="w-full items-center h-10 sm:h-12 flex gap-2.5 hover:bg-neutral-200 transition-all rounded-2xl px-3 duration-300 cursor-pointer">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full">
                            {f&&f.avatar ? (
                                <img src={f.avatar} className='w-full h-full rounded-full object-cover' />
                            ) : (
                                <div className='w-full text-xl sm:text-3xl h-full flex justify-center items-center mt-1 rounded-full'>
                                    <FaUser className='rounded-b-2xl'/>
                                </div>
                            )}
                        </div>
                        <div className="font-bold text-sm sm:text-base">{f.username}</div>
                    </Link>
                ))}
            </div>
        </div>

        </main>
        <LikesModal 
        post={posts?.find((p) => p._id === selectedPostId)}
        isLikesModalOpen={isLikesModalOpen} 
        setIsLikesModalOpen={setIsLikesModalOpen}/>

        <CommensModal 
        content={content}
        post={posts?.find((p) => p._id === selectedPostId)}
        setContent={setContent} 
        addComment={addComment} 
        isCommentsModalOpen={isCommentsModalOpen} 
        setIsCommentsModalOpen={setIsCommentsModalOpen}
        darkMode={darkMode}
        />

        <ShareModal 
        post={posts?.find((p) => p._id === selectedPostId)}
        isShareModalOpen={isShareModalOpen}
        setIsShareModalOpen={setIsShareModalOpen}
        darkMode={darkMode}
        />

        {showSM&&(
            <div className="fixed top-20 right-4 sm:right-20 w-80 sm:w-96 h-16 sm:h-20 font-bold rounded-md flex justify-center items-center bg-red-400 text-white text-sm sm:text-base">
                This is just a design. Not working yet! 🚧
            </div>
        )}
    </div>)}
    </>
  )
}

export default Home