import express from "express"
import { 
    addComment,
    createPost,
    createStory,
    deleteAccount,
    deleteComment,
    deleteStory,
    firstGithubRoute, 
    firstGoogleRoute, 
    followUser, 
    getAllPosts, 
    getAllRequests, 
    getAllUsers, 
    getFeedStories, 
    getMessagesWithFriend, 
    getNotifications, 
    getPostLikes, 
    getPostsComments, 
    getProfilePosts, 
    getProfileUser,   
    getSharedPost,  
    getSinglePostComments,  
    getSinglePostLikes,  
    getUserFollowers, 
    getUserFollowing, 
    likePost, 
    logout, 
    markNotificationsAsSeen, 
    normalLogin, 
    normalSignUp, 
    removeFriend, 
    respondRequest, 
    secondGithubRoute, 
    secondGoogleRoute,
    sendMessageToFriend,
    sendOrCancelRequest,
    unfollowUser,
    unlikePost,
    updateDarkMode,
    updateUserInfo,
    updateUserProfile, }from "../controllers/controllers.js"
import uploadProfileImages from "../utils/profileImagesMulter.js"
import User from "../schemas/UserSchema.js"
const router = express.Router()

// authentication
router.post("/signup" , uploadProfileImages ,normalSignUp)
router.post("/login" ,normalLogin)
router.get("/auth/google" , firstGoogleRoute)
router.get('/auth/google/callback', secondGoogleRoute)
router.get('/auth/github', firstGithubRoute);
router.get('/auth/github/callback', secondGithubRoute);
router.get('/api/user', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: true, message: 'Not authenticated' })
    }

    try {
        const user = await User.findById(req.user.id).populate('friends').lean()                                                  
        res.json({ error: false, user })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: true, message: 'Server error' })
    }
})

// posts
router.post('/post/create' , createPost)
router.get('/post/getAll' , getAllPosts)
// Likes routes
router.post('/post/:postId/like', likePost);
router.delete('/post/:postId/unlike', unlikePost);
router.get('/post/getAll/likes', getPostLikes);

// Comments routes
router.post('/post/:postId/comment', addComment);
router.delete('/comment/:commentId', deleteComment);
router.get('/post/getAll/comments', getPostsComments);

// share routes
router.get('/sharedPost/:postId', getSharedPost);
router.get('/sharedPost/:postId/likes', getSinglePostLikes);
router.get('/sharedPost/:postId/comments', getSinglePostComments);


// Follow routes
router.post('/user/:userId/follow', followUser);
router.delete('/user/:userId/unfollow', unfollowUser);
router.get('/user/followers', getUserFollowers);
router.get('/user/following', getUserFollowing);

//______________
// friends
router.get('/allUsers' , getAllUsers)
router.get('/getAllRequests' , getAllRequests)
router.post('/sendRequest/:recipientId', sendOrCancelRequest);
router.post('/respondRequest/:requesterId', respondRequest);
router.delete('/:friendId', removeFriend);
router.get('/messages/:friendId', getMessagesWithFriend);
router.post('/messages/:friendId', sendMessageToFriend);

// profile
router.get('/getProfileUser/:id' , getProfileUser)
router.get('/getProfilePosts/:id' , getProfilePosts)
router.patch('/updateUserProfile', uploadProfileImages , updateUserProfile)


// settings 
router.patch("/settings/updateUserInfo", uploadProfileImages , updateUserInfo)
router.delete("/settings/deleteAccount" , deleteAccount)
router.delete("/settings/logoutAccount" , logout)
router.patch("/settings/darkMode" , updateDarkMode)

// stories
router.post('/story/create' , uploadProfileImages, createStory);
router.delete('/story/delete/:id', deleteStory);
router.get('/stories/getAll', getFeedStories);

// notifications
router.get('/notifications/getAll' , getNotifications)
router.patch('/notifications/markAsSeen' , markNotificationsAsSeen)



export default router