import React, { useEffect, useState } from 'react'
import Nav from '../../components/Nav/Nav'
import axios from 'axios'
import { FaHeart, FaRegComment, FaRegHeart, FaUser, FaUserPlus } from 'react-icons/fa'
import P_Links_Modal from '../../modals/P_Links_Modal/P_Links_Modal'
import P_bio_Modal from '../../modals/P_bio_Modal/P_bio_Modal'
import { Form, Link, useParams } from 'react-router-dom'
import { CiShare2 } from 'react-icons/ci'
import { IoMdClose } from 'react-icons/io'
import { IoEllipsisHorizontal } from 'react-icons/io5'
import ShareModal from '../../modals/ShareModal/ShareModal '
import CommensModal from '../../modals/CommentsModal/CommensModal'
import LikesModal from '../../modals/LikesModal/LikesModal'

const Profile = ({user, socket , setUser ,userFollowing,userFollowers,darkMode}) => {
  const [selectedSection, setSelectedSection] = useState('posts')
  
  const {userId}=useParams()
  const [profileUser , setProfileUser]=useState({})

  const [loading , setLoading]=useState(false)

  // modals
  const [isLinksModalOpen, setLinksModalOpen] = useState(false)
  const [isBioModalOpen, setIsBioModalOpen] = useState(false)
  const [isLikesModalOpen , setIsLikesModalOpen]=useState(false)
  const [isCommentsModalOpen , setIsCommentsModalOpen]=useState(false)
  const [isShareModalOpen , setIsShareModalOpen]=useState(false)

  const [posts, setPosts] = useState([])
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [content , setContent]=useState('')

  const [expandedPosts, setExpandedPosts] = useState({});
  const [expandedMedia, setExpandedMedia] = useState({});

  const [requests , setRequests]=useState([])

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
              const alreadyLiked = post.likes?.some(u => u._id === newLike.user._id);
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

   const toggleExpandPost = (postId) => {
        setExpandedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

   const toggleExpandMedia = (postId, mediaIndex) => {
        const mediaKey = `${postId}-${mediaIndex}`;
        setExpandedMedia(prev => ({
            ...prev,
            [mediaKey]: !prev[mediaKey]
        }));
    };
    

    useEffect(()=>{
        const getUserProfile = async() =>{
          try{
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/getProfileUser/${userId}`)
          if(!response.error){
            setProfileUser(response.data.user)
          }
          }catch(error){
            console.log(error);
      }
    }
    if(user._id!==userId){
      getUserProfile()
    }
    },[])

    

  const fetchAllPosts = async() => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/post/getAll`)
      setPosts(response.data.posts)
    } catch(err) {
      console.log(err);
    }
  }

  useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    await Promise.all([fetchAllPosts(), getPostsLikes(), getPostComments()])
    setLoading(false)
  }
  fetchData()
}, [])

  const userPosts = posts.filter(post => post.user?._id === userId)
  const likedPosts = posts.filter(post => 
  post?.likes?.some(u => u?._id === userId)
);
    
  const showedPosts = user?._id?.toString()===userId?selectedSection === "posts" ? userPosts : likedPosts:userPosts

  // Handle cover photo upload
const handleCoverPhotoUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('coverPhoto', file)

  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_BACKEND_URL}/updateUserProfile`,
      formData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    
    if (response.data.error === false) {
      setUser(prev => ({
        ...prev,
        coverPhoto: response.data.user.coverPhoto
      }))
    }
  } catch (err) {
    console.error('Error uploading cover photo:', err)
  } finally {
    e.target.value = ''
  }
}



// Handle avatar upload
const handleAvatarUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('File size should be less than 5MB')
    return
  }

  const formData = new FormData()
  formData.append('avatar', file)
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_BACKEND_URL}/updateUserProfile`,
      formData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    
    if (response.data.error === false) {
      setUser(prev => ({
        ...prev,
        avatar: response.data.user.avatar
      }))
    }
  } catch (err) {
    console.error('Error uploading avatar:', err)
    alert('Failed to upload avatar. Please try again.')
  } finally {
    e.target.value = ''
  }
}

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
        prevPosts.map((post) => ({
        ...post,
        likes: likesByPost[post._id] || [], // add a `.likes` field
      }))
    );
  } catch (error) {
    console.error('Error fetching likes:', error.response?.data || error.message);
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
        prevPosts.map((post) => ({
        ...post,
        comments: commentsByPost[post._id] || [], // add `.comments` field to each post
        }))
    );
} catch (error) {
    console.error('Error fetching comments:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Something went wrong' };
}
};
useEffect(()=>{
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

  // Post component for rendering individual posts
  const PostItem = ({ post }) => (
    <div 
                    key={post._id}
                    className={`w-full ${darkMode?"bg-neutral-700 text-white":"bg-white"} border flex flex-col ${darkMode?"border-neutral-800":"border-neutral-300"} mt-6 rounded-2xl`}
                    >
                        <div className='w-full h-12 rounded-t-2xl flex items-center justify-between px-2.5'>
                            <div className='h-full flex justify-start items-center gap-2.5'>
                                <Link to={`/home/profile/${post?.user?._id}`} className='w-8 h-8 sm:w-10 sm:h-10 rounded-full flex justify-center items-center'>
                                    {post?.user?.avatar!==""?(
                                        <img src={post?.user?.avatar} className='w-full h-full rounded-full object-cover' alt="" />
                                        ):(
                                        <div className='w-full text-xl sm:text-3xl h-full flex justify-center items-center mt-1 rounded-full'>
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
                                    {userFollowing.includes(post?.user?._id) ? 'Following' : 'Follow'}
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
                                    {post.content.length > 150 && !expandedPosts[post._id] ? (
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
  )

  return (
    <>
    {loading?(
      <div className="fixed inset-0 flex justify-center items-start">
        <div className="w-80 h-80 rounded-full border-y animate-spin"></div>
      </div>
    ):(<div className={`w-screen flex flex-col h-screen ${darkMode?"bg-neutral-800":"bg-white"} overflow-auto`}>
      <Nav user={user} darkMode={darkMode}/>
      <div className="flex-1 px-3 sm:px-8 lg:px-20 overflow-auto">
        {/* Cover Photo Section */}
        <div className={`w-full h-40 sm:h-48 md:h-60 relative rounded-b transition-all duration-300 cursor-pointer flex ${user?._id?.toString()===userId?"hover:bg-neutral-200":null}  justify-center items-end`}>
          {/* coverPhoto */}
          {user?._id?.toString()===userId?user?.coverPhoto ? (
            <img src={user.coverPhoto} className='w-full h-full object-cover' alt="" />
          ) : (
            <div className="w-full h-full flex border-x border-b border-neutral-300 justify-center overflow-hidden">
              <FaUserPlus size={window.innerWidth < 640 ? 150 : window.innerWidth < 768 ? 200 : 270} className='text-neutral-700' />
            </div>
          ):profileUser?.coverPhoto ? (
            <img src={profileUser.coverPhoto} className='w-full h-full object-cover' alt="" />
          ) : (
            <div className="w-full h-full flex border-x border-b border-neutral-300 justify-center overflow-hidden">
              <FaUserPlus size={window.innerWidth < 640 ? 150 : window.innerWidth < 768 ? 200 : 270} className='text-neutral-700' />
            </div>
          )}
          {user?._id?.toString()===userId&&<input 
          type="file" 
          name='coverPhoto' 
          className='w-full h-full opacity-0 z-10 absolute cursor-pointer' 
          accept="image/*"
          onChange={handleCoverPhotoUpload}
          />}

          {/* Profile Picture */}
          <div className="absolute left-3 sm:left-8 lg:left-20 -bottom-8 sm:-bottom-12 md:-bottom-14 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border border-neutral-400">
            <div className="relative w-full h-full rounded-full">
              {user?._id?.toString()===userId&&<input 
              type="file" 
              name="avatar" 
              className='w-full h-full absolute opacity-0 z-10 cursor-pointer' 
              accept="image/*"
              onChange={handleAvatarUpload}
              />}
              {user?._id?.toString()===userId?user?.avatar ? (
                <img src={user.avatar} className='w-full h-full rounded-full object-cover' alt="" />
              ) : (
                <div className='w-full h-full rounded-full text-neutral-800 flex justify-center items-end overflow-hidden'>
                  <FaUser size={window.innerWidth < 640 ? 45 : window.innerWidth < 768 ? 65 : 90}/>
                </div>
              ):profileUser?.avatar ? (
                <img src={profileUser.avatar} className='w-full h-full rounded-full object-cover' alt="" />
              ) : (
                <div className='w-full h-full rounded-full text-neutral-800 flex justify-center items-end overflow-hidden'>
                  <FaUser size={window.innerWidth < 640 ? 45 : window.innerWidth < 768 ? 65 : 90}/>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Info Section */}
        <div className={`w-full border-b border-l border-r ${darkMode?"bg-neutral-700 text-white":"bg-white"} border-neutral-300 flex flex-col px-3 sm:px-6 lg:px-8 pt-10 sm:pt-14 md:pt-16 pb-4 sm:pb-6`}>
          <div className="text-lg sm:text-xl md:text-2xl font-bold">{user?._id?.toString()===userId?user?.username:profileUser?.username}</div>
          
          {/* Bio Section */}
          <div className="text-gray-400 font-semibold mt-1.5">
            {user?.bio ? (
              <div 
                onClick={() => {user?._id?.toString()===userId&&setIsBioModalOpen(true)}}
                className="cursor-pointer text-sm sm:text-base"
              >
                {user?._id?.toString()===userId?user.bio:profileUser.bio}
              </div>
            ) : (
              <div 
                onClick={() => {user?._id?.toString()===userId&&setIsBioModalOpen(true)}}
                className="py-1 px-2 sm:px-3 cursor-pointer hover:bg-neutral-200 inline-block rounded-2xl transition-all duration-300 text-sm sm:text-base"
              >
                No bio yet.
              </div>
            )}
          </div>
          
          {/* Followers/Following */}
          <div className="flex gap-2 sm:gap-3.5 mt-1.5 text-sm sm:text-base">
            <div className="">
              <span className='font-semibold'>Following : </span>
              <span className='text-blue-600 text-sm sm:text-lg font-semibold'>{userFollowing?.length}</span>
            </div>
            <div className="">
              <span className='font-semibold'>Followers : </span>
              <span className='text-blue-600 text-sm sm:text-lg font-semibold'>{userFollowers?.length}</span>
            </div>
          </div>

          {/* Social Links */}
          <div
            onClick={() => {user?._id?.toString()===userId&&setLinksModalOpen(true)}}
            className={`mt-3 h-auto sm:h-10 flex flex-col sm:flex-row items-start sm:items-center gap-2 cursor-pointer p-1 pr-3 ${user?._id?.toString()===userId?"hover:bg-neutral-200":null} transition-all duration-300 font-bold rounded`}
          >
            {user?._id?.toString()===userId?(<div className="text-sm sm:text-base">Social Links:</div>):(
              Object?.values(profileUser?.socialLinks||{}).every(link => link === "")?null:(<div className="text-sm sm:text-base">Social Links:</div>)
            )}
            <div className="flex flex-1 items-center gap-2 sm:gap-3">
              {user?._id?.toString()===userId?user?.socialLinks && Object.values(user.socialLinks).some(link => link) ? (
                <div className="flex items-center gap-2 flex-wrap">
                  {Object.entries(user.socialLinks).map(([platform, url]) =>
                    url ? (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full ${platform==="X"?"bg-black text-white":platform==="instagram"?"bg-gradient-to-b from-pink-500 via-red-600 to-yellow-300  text-white":platform==="linkedin"?"bg-blue-500 text-white":platform==="facebook"?"bg-blue-600 text-white":platform==="youtube"?"bg-red-600 text-white":"bg-white border border-neutral-500 text-black"} flex items-center justify-center text-xs font-bold uppercase`}
                        title={platform}
                      >
                        {platform[0]}
                      </a>
                    ) : null
                  )}
                </div>
              ) : (
                <div className="flex-1 text-gray-500 font-semibold text-sm sm:text-base">No Links Yet</div>
              ):
              profileUser?.socialLinks && Object.values(profileUser.socialLinks).some(link => link) ? (
                <div className="flex items-center gap-2 flex-wrap">
                  {Object.entries(profileUser.socialLinks).map(([platform, url]) =>
                    url ? (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full ${platform==="X"?"bg-black text-white":platform==="instagram"?"bg-gradient-to-b from-pink-500 via-red-600 to-yellow-300  text-white":platform==="linkedin"?"bg-blue-500 text-white":platform==="facebook"?"bg-blue-600 text-white":platform==="youtube"?"bg-red-600 text-white":"bg-white border border-neutral-500 text-black"} flex items-center justify-center text-xs font-bold uppercase`}
                        title={platform}
                      >
                        {platform[0]}
                      </a>
                    ) : null
                  )}
                </div>
              ) : (
                null
              )}
            </div>
          </div>

          {/* Follow/Add Friend Buttons */}
          {user._id!==userId&&(
          <div className="flex flex-col sm:flex-row items-center h-auto sm:h-20 justify-center gap-2 sm:gap-3 mt-4 sm:mt-0">
            {!user?.friends?.some(friend => friend._id?.toString() === userId.toString())?(<div 
            onClick={()=>{
              sendRequest(userId)
            }}
            className={`w-full sm:w-32 md:w-60 h-10 rounded-md font-bold transform hover:scale-105 
            transition-all duration-300 cursor-pointer ${hasRequested(userId) ? "bg-red-500" : "bg-blue-500"} 
            flex justify-center items-center text-white text-sm sm:text-base`}>
              {hasRequested(userId) ? "Cancel" : "Add Friend"}
            </div>):(
              <div className={`w-full sm:w-32 md:w-60 h-10 rounded-md font-bold transform hover:scale-105 
            transition-all duration-300 cursor-pointer bg-neutral-400 
            flex justify-center items-center text-white text-sm sm:text-base`}>Friends</div>
            )}
          </div>
        )}
        </div>

        {/* Posts/Liked Tabs */}
        {user?._id?.toString()===userId&&(<div className="w-full h-8 sm:h-9 flex">
          <div 
            onClick={() => setSelectedSection('posts')}
            className={`w-1/2 px-2 rounded-b-2xl ${darkMode?"bg-neutral-600 text-white":"bg-white"} ${selectedSection === 'posts' ? "border-b-2 h-8 sm:h-9 border-x-2" : "border-b h-7 sm:h-8 border-x"} border-neutral-500 cursor-pointer flex items-center justify-center font-bold text-xs sm:text-sm md:text-base`}
          >
            <span className="hidden sm:inline">Posts ({userPosts.length})</span>
            <span className="sm:hidden">Posts ({userPosts.length})</span>
          </div>
          <div 
            onClick={() => setSelectedSection('liked')}
            className={`w-1/2 px-2 rounded-b-2xl ${darkMode?"bg-neutral-600 text-white":"bg-white"} ${selectedSection === 'liked' ? "border-b-2 h-8 sm:h-9 border-x-2" : "border-b h-7 sm:h-8 border-x"} border-neutral-500 cursor-pointer flex items-center justify-center font-bold text-xs sm:text-sm md:text-base`}
          >
            <span className="hidden sm:inline">Liked ({likedPosts.length})</span>
            <span className="sm:hidden">Liked ({likedPosts.length})</span>
          </div>
        </div>)}

        {/* Posts Section */}
        <div className="min-h-[40vh] w-full py-2 sm:py-4">
          {showedPosts && showedPosts.length > 0 ? (
            <div className="w-full">
              {showedPosts.map((post, index) => (
                <PostItem key={post._id || index} post={post} />
              ))}
            </div>
          ) : (
            <div className="h-[40vh] text-lg sm:text-xl md:text-2xl font-bold flex justify-center items-center text-gray-500">
              {selectedSection === 'posts' ? 'No Posts Yet' : 'No Liked Posts Yet'}
            </div>
          )}
        </div>
      </div>

      <P_Links_Modal 
        isLinksModalOpen={isLinksModalOpen} 
        setLinksModalOpen={setLinksModalOpen} 
        user={user}
        setUser={setUser}
      />
      <P_bio_Modal 
        isBioModalOpen={isBioModalOpen} 
        setIsBioModalOpen={setIsBioModalOpen}
        user={user}
        setUser={setUser}
      />

      <LikesModal 
        post={posts.find((p) => p._id === selectedPostId)}
        isLikesModalOpen={isLikesModalOpen} 
        setIsLikesModalOpen={setIsLikesModalOpen}/>

        <CommensModal 
        content={content}
        post={posts.find((p) => p._id === selectedPostId)}
        setContent={setContent} 
        addComment={addComment} 
        isCommentsModalOpen={isCommentsModalOpen} 
        setIsCommentsModalOpen={setIsCommentsModalOpen}
        darkMode={darkMode}
        />

        <ShareModal 
        post={posts.find((p) => p._id === selectedPostId)}
        isShareModalOpen={isShareModalOpen}
        setIsShareModalOpen={setIsShareModalOpen}
        darkMode={darkMode}
        />

    </div>)}
    </>
  )
}

export default Profile