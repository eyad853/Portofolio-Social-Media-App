import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { CiShare2 } from 'react-icons/ci';
import { FaCaretLeft, FaHeart, FaRegComment, FaRegHeart, FaUser } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { IoEllipsisHorizontal } from 'react-icons/io5';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Nav from '../../components/Nav/Nav';
import ShareModal from '../../modals/ShareModal/ShareModal ';
import CommensModal from '../../modals/CommentsModal/CommensModal';
import LikesModal from '../../modals/LikesModal/LikesModal';

const SharedPost = ({ darkMode, user, userFollowing, userFollowers, socket, posts, setPosts, setUserFollowing, setUserFollowers }) => {
    const { postId } = useParams();
    const [post, setPost] = useState(null); // This is the local state for the single shared post
    const navigate = useNavigate()

    const [expandedPosts, setExpandedPosts] = useState({}); // Keep if you use it globally, but for single post maybe not needed
    const [expandedMedia, setExpandedMedia] = useState({});

    const [content, setContent] = useState(''); // For new comment input

    const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);

    const API_URL = import.meta.env.VITE_BACKEND_URL;

    // Toggle expanded state for post content
    const toggleExpandPost = (currentPostId) => {
        setExpandedPosts(prev => ({
            ...prev,
            [currentPostId]: !prev[currentPostId]
        }));
    };

    // Toggle expanded state for media
    const toggleExpandMedia = (currentPostId, mediaIndex) => {
        const mediaKey = `${currentPostId}-${mediaIndex}`;
        setExpandedMedia(prev => ({
            ...prev,
            [mediaKey]: !prev[mediaKey]
        }));
    };

    // --- Data Fetching for the Shared Post ---
    const fetchPost = async () => {
        try {
            // Fetch the basic post details
            const postResponse = await axios.get(`${API_URL}/sharedPost/${postId}`);
            let fetchedPost = postResponse.data.post;

            if (!fetchedPost) {
                // Handle case where post is not found
                setPost(null); // Or redirect
                console.log('there is no post');
                navigate('/home')
                return;
            }

            // Fetch likes specifically for this post
            const likesResponse = await axios.get(`${API_URL}/sharedPost/${postId}/likes`, { withCredentials: true });
            fetchedPost.likes = likesResponse.data.likes;

            // Fetch comments specifically for this post
            const commentsResponse = await axios.get(`${API_URL}/sharedPost/${postId}/comments`, { withCredentials: true });
            fetchedPost.comments = commentsResponse.data.comments;

            setPost(fetchedPost); // Set the local post state with all populated data
        } catch (error) {
            console.error("Error fetching shared post data:", error.response?.data || error.message);
            setPost(null); // Clear post or show an error
        }
    };

    useEffect(() => {
        fetchPost();
        getUserFollowers();
        getUserFollowing();
    }, [postId, user?._id]); 

    // --- Socket Listeners ---
    useEffect(() => {
        socket.on('newPost', (data) => {
            setPosts(prev => [...prev, data]);
        });

        socket.on('newLike', (newLike) => {
            if(newLike.user._id ===user._id) return
            // Update global posts prop
            setPosts((prevPosts) => {
                const index = prevPosts.findIndex(p => p._id === newLike.post._id);
                if (index === -1) return prevPosts;
                const postToUpdate = prevPosts[index];
                const alreadyLiked = postToUpdate.likes?.some(u => u._id === newLike.user._id);
                if (alreadyLiked) return prevPosts;
                const updatedPost = {
                    ...postToUpdate,
                    likes: [...(postToUpdate.likes || []), newLike.user],
                };
                const updatedPosts = [...prevPosts];
                updatedPosts[index] = updatedPost;
                return updatedPosts;
            });

            // Update local 'post' state if it's the current shared post
            setPost(prevPost => {
                if (!prevPost || prevPost._id !== newLike.post._id) return prevPost;
                const alreadyLiked = prevPost.likes?.some(u => u._id === newLike.user._id);
                if (alreadyLiked) return prevPost;
                return {
                    ...prevPost,
                    likes: [...(prevPost.likes || []), newLike.user],
                };
            });
        });

        socket.on('likeDeleted', ({ postId: deletedPostId, userId }) => {
            if(userId===user._id) return
            // Update global posts prop
            setPosts(prevPosts => prevPosts.map(p => {
                if (p._id === deletedPostId) {
                    return {
                        ...p,
                        likes: p.likes ? p.likes.filter(likeUser => likeUser._id !== userId) : p.likes,
                    };
                }
                return p;
            }));

            // Update local 'post' state if it's the current shared post
            setPost(prevPost => {
                if (!prevPost || prevPost._id !== deletedPostId) return prevPost;
                return {
                    ...prevPost,
                    likes: prevPost.likes ? prevPost.likes.filter(likeUser => likeUser._id !== userId) : prevPost.likes,
                };
            });
        });

        socket.on('newComment', (newComment) => {
            if(newComment.user._id ===user._id) return
            // Update global posts prop
            setPosts((prevPosts) =>
                prevPosts.map((p) => {
                    if (p._id === newComment.post._id) {
                        const alreadyExists = p.comments?.some(
                            (comment) => comment._id === newComment._id
                        );
                        if (alreadyExists) return p;
                        return {
                            ...p,
                            comments: [...(p.comments || []), newComment],
                        };
                    }
                    return p;
                })
            );

            // Update local 'post' state if it's the current shared post
            setPost(prevPost => {
                if (!prevPost || prevPost._id !== newComment.post._id) return prevPost;
                const alreadyExists = prevPost.comments?.some(
                    (comment) => comment._id === newComment._id
                );
                if (alreadyExists) return prevPost;
                return {
                    ...prevPost,
                    comments: [...(prevPost.comments || []), newComment],
                };
            });
        });

        socket.on('commentDeleted', ({ commentId, postId: deletedPostId }) => { // Expecting commentId and postId
            // Update global posts prop
            setPosts(prevPosts => prevPosts.map(p => {
                if (p._id === deletedPostId) {
                    return {
                        ...p,
                        comments: p.comments?.filter(c => c._id !== commentId) || [],
                    };
                }
                return p;
            }));

            // Update local 'post' state if it's the current shared post
            setPost(prevPost => {
                if (!prevPost || prevPost._id !== deletedPostId) return prevPost;
                return {
                    ...prevPost,
                    comments: prevPost.comments?.filter(c => c._id !== commentId) || [],
                };
            });
        });

        socket.on('newShare', (data) => {
            // Handle new shares if necessary, maybe increment share count on the post
            // No direct update to local 'post' state unless share count is a property
        });

        socket.on('newFollow', (data) => {
            if (data.following === user._id) {
                setUserFollowers(prev => [...prev, data]);
            }
        });

        socket.on('unfollow', (data) => {
            if (data.following === user._id) {
                setUserFollowers(prev => prev.filter(f => f.follower !== data.follower));
            }
        });

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
    }, [socket, user, setPosts, setPost, setUserFollowers, postId]); // Added setPost, setPosts, setUserFollowers, postId to dependencies

    // --- Like/Unlike Actions ---
    const likePost = async (currentPostId) => {
        // Optimistically update the local 'post' state first
        setPost(prevPost => {
            if (!prevPost || prevPost._id !== currentPostId) return prevPost;
            const alreadyLiked = prevPost.likes?.some((u) => u._id === user._id);
            if (alreadyLiked) return prevPost; // Already liked, no change needed for optimistic update
            return {
                ...prevPost,
                likes: [...(prevPost.likes || []), user], // Add current user to likes
            };
        });

        try {
            await axios.post(`${API_URL}/post/${currentPostId}/like`, {}, { withCredentials: true });
            // Socket will handle global 'posts' update after successful backend call
        } catch (error) {
            console.error('Error liking post:', error.response?.data || error.message);
            // Revert optimistic update if backend fails
            setPost(prevPost => {
                if (!prevPost || prevPost._id !== currentPostId) return prevPost;
                return {
                    ...prevPost,
                    likes: prevPost.likes?.filter((u) => u._id !== user._id) || [],
                };
            });
        }
    };

    const unlikePost = async (currentPostId) => {
        // Optimistically update the local 'post' state first
        setPost(prevPost => {
            if (!prevPost || prevPost._id !== currentPostId) return prevPost;
            const alreadyLiked = prevPost.likes?.some((u) => u._id === user._id);
            if (!alreadyLiked) return prevPost; // Not liked, no change needed for optimistic update
            return {
                ...prevPost,
                likes: prevPost.likes?.filter((u) => u._id !== user._id) || [], // Remove current user from likes
            };
        });

        try {
            await axios.delete(`${API_URL}/post/${currentPostId}/unlike`, { withCredentials: true });
            // Socket will handle global 'posts' update after successful backend call
        } catch (error) {
            console.error('Error unliking post:', error.response?.data || error.message);
            // Revert optimistic update if backend fails
            setPost(prevPost => {
                if (!prevPost || prevPost._id !== currentPostId) return prevPost;
                return {
                    ...prevPost,
                    likes: [...(prevPost.likes || []), user],
                };
            });
        }
    };

    // --- Comment Actions ---
    const addComment = async (currentPostId) => {
        if (!content.trim()) return;

        const newCommentTemp = { // Use a temp name to avoid clash with imported newComment
            _id: Date.now().toString(), // Temporary ID for optimistic update
            content: content.trim(),
            user: user, // Your current user object
            post: { _id: currentPostId },
            createdAt: new Date().toISOString(),
        };

        // Instantly update the local 'post' state
        setPost(prevPost => {
            if (!prevPost || prevPost._id !== currentPostId) return prevPost;
            return {
                ...prevPost,
                comments: [...(prevPost.comments || []), newCommentTemp],
            };
        });

        setContent(""); // Clear input immediately

        // Now send to backend
        try {
            await axios.post(
                `${API_URL}/post/${currentPostId}/comment`,
                { content: newCommentTemp.content }, // Send the actual content
                { withCredentials: true }
            );
            // The socket 'newComment' event will handle updating the global 'posts' state
            // and re-confirming the local 'post' state with the official comment ID
        } catch (err) {
            console.error("Comment send failed", err);
            // Revert the optimistic update if backend fails
            setPost(prevPost => {
                if (!prevPost || prevPost._id !== currentPostId) return prevPost;
                return {
                    ...prevPost,
                    comments: prevPost.comments?.filter(c => c._id !== newCommentTemp._id) || [],
                };
            });
        }
    };

    // --- Follow/Unfollow Actions ---
    // These functions work on the global userFollowing/userFollowers state (props), which is correct.
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
        try {
            const response = await axios.get(`${API_URL}/user/followers`, { withCredentials: true });
            setUserFollowers(response.data.followers);
        } catch (error) {
            console.error('Error fetching followers:', error.response?.data || error.message);
        }
    };

    const getUserFollowing = async () => {
        try {
            const response = await axios.get(`${API_URL}/user/following`, { withCredentials: true });
            const followingIds = response.data.following.map(f => f.following._id);
            setUserFollowing(followingIds);
        } catch (error) {
            console.error('Error fetching following:', error.response?.data || error.message);
        }
    };

    const handleFollowToggle = async (userId) => {
        const isCurrentlyFollowing = userFollowing.includes(userId);

        // Optimistically update the UI first
        if (isCurrentlyFollowing) {
            setUserFollowing(prev => prev.filter(id => id !== userId));
        } else {
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


    if (!post) {
        return (
            <div className='w-screen h-screen flex justify-center items-center font-bold text-5xl'>
                Loading Post... 
            </div>
        );
    }

    // Render the post once it's available
    return (
        <div className="w-screen h-screen pb-10">
            <header className='fixed top-0 left-0 right-0 z-10'>
                <Nav user={user} />
            </header>

            <div className="w-full px-10 pb-10 h-full pt-16">
                <Link to={'/home'} className="">
                    <FaCaretLeft size={50} />
                </Link>

                <div
                    className={`w-full ${darkMode ? "bg-neutral-700 text-white" : "bg-white"} border flex flex-col ${darkMode ? "border-neutral-800" : "border-neutral-300"} mt-6 rounded-2xl`}
                >
                    <div className='w-full h-12 rounded-t-2xl flex items-center justify-between px-2.5'>
                        <div className='h-full flex justify-start items-center gap-2.5'>
                            <Link to={`/home/profile/${post.user._id}`} className='w-10 h-10 rounded-full flex justify-center items-center '>
                                {post?.user?.avatar !== "" ? (
                                    <img src={post?.user?.avatar} className='w-full h-full rounded-full object-cover' alt="" />
                                ) : (
                                    <div className='w-full text-3xl h-full flex justify-center items-center mt-1 rounded-full '>
                                        <FaUser className='rounded-b-2xl mt-2' />
                                    </div>
                                )}
                            </Link>
                            <Link to={`/home/profile/${post.user._id}`} className='font-semibold'>
                                {post?.user?.username}
                            </Link>
                            {post?.user?._id !== user?._id && (
                                <div
                                    onClick={() => handleFollowToggle(post?.user?._id)}
                                    className={`cursor-pointer flex items-center px-2 py-1 rounded ${
                                        userFollowing.includes(post?.user?._id)
                                            ? 'text-gray-500 '
                                            : 'text-blue-500'
                                    }`}
                                >
                                    {userFollowing.includes(post?.user?._id) ? 'Following' : 'Follow'}
                                </div>)}
                        </div>

                        <div className='flex text-xl items-center justify-between h-full w-20 '>
                            <div className="w-10 h-10 rounded-full hover:bg-neutral-200 transition-all duration-200 flex justify-center items-center">
                                < IoEllipsisHorizontal />
                            </div>
                            <div className="w-10 h-10 rounded-full hover:bg-neutral-200 transition-all duration-200 flex justify-center items-center">
                                < IoMdClose />
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
                                        <p className='mb-1'>{post.content.substring(0, 250)}...</p>
                                        <button
                                            onClick={() => toggleExpandPost(post._id)}
                                            className='text-blue-500 hover:underline font-medium'
                                        >
                                            Read more
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <p className='mb-1'>{post.content}</p>
                                        {post.content.length > 150 && expandedPosts[post._id] && (
                                            <button
                                                onClick={() => toggleExpandPost(post._id)}
                                                className='text-blue-500 hover:underline font-medium'
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
                                                        <div className={`w-full ${isExpanded ? '' : 'max-h-80'} overflow-hidden`}>
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
                                                        <div className={`w-full ${isExpanded ? '' : 'max-h-80'} overflow-hidden`}>
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
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent potential parent clicks
                                    // Check if user has liked it, then unlike, else like
                                    if (post.likes?.some((u) => u._id === user._id)) {
                                        unlikePost(post._id);
                                    } else {
                                        likePost(post._id);
                                    }
                                }}
                                className="h-full flex font-semibold text-neutral-500 items-center justify-center cursor-pointer hover:bg-neutral-200 transition-all duration-200 rounded-md px-2"
                            >
                                <button className="h-full flex items-center z-10 justify-center">
                                    {post.likes?.some((u) => u._id === user._id) ? (
                                        <FaHeart className="text-red-500" />
                                    ) : (
                                        <FaRegHeart />
                                    )}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent bubbling to the like button's parent div
                                        setIsLikesModalOpen(true);
                                        setSelectedPostId(post._id);
                                    }}
                                    className="h-full ml-1.5 flex justify-center items-center"
                                >
                                    {post?.likes?.length > 0 ? post?.likes?.length : 0} Likes
                                </button>
                            </div>
                            <div
                                onClick={() => {
                                    setIsCommentsModalOpen(true);
                                    setSelectedPostId(post._id);
                                }}
                                className="h-full flex gap-1.5 font-semibold text-neutral-500 items-center justify-center cursor-pointer hover:bg-neutral-200 transition-all duration-200 rounded-md px-2"
                            >
                                <div className="">< FaRegComment /></div>
                                <div className="">{post?.comments?.length > 0 ? post?.comments?.length : 0} Comments</div>
                            </div>
                            <div
                                onClick={() => {
                                    setIsShareModalOpen(true);
                                    setSelectedPostId(post._id);
                                }}
                                className="h-full flex gap-1.5 font-semibold text-neutral-500 items-center justify-center cursor-pointer hover:bg-neutral-200 transition-all duration-200 rounded-md px-2"
                            >
                                <div className="">< CiShare2 /></div>
                                <div className="">Share</div> {/* Ensure sharesCount exists, default to 0 */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modals, passed the local 'post' state */}
            <LikesModal
                post={post} // Pass the local post object
                isLikesModalOpen={isLikesModalOpen}
                setIsLikesModalOpen={setIsLikesModalOpen}
            />

            <CommensModal
                content={content}
                post={post} // Pass the local post object
                setContent={setContent}
                addComment={addComment}
                isCommentsModalOpen={isCommentsModalOpen}
                setIsCommentsModalOpen={setIsCommentsModalOpen}
            />

            <ShareModal
                post={post} // Pass the local post object
                isShareModalOpen={isShareModalOpen}
                setIsShareModalOpen={setIsShareModalOpen}
            />
        </div>
    );
}

export default SharedPost;