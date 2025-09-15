import dotenv from 'dotenv';
dotenv.config();
import postModel from "../schemas/PostSchema.js"
import passport from "passport"
import User from "../schemas/UserSchema.js";
import multer from 'multer'
import path from 'path'
import fs from "fs"
import likeModel from "../schemas/LikesSchema.js";
import followingModel from "../schemas/FollowingSchema.js";
import commentsModel from "../schemas/CommentsSchema.js";
import { fileURLToPath } from "url";
import friendsModel from "../schemas/Friends.js";
import messagesModel from "../schemas/chat.js";
import bcrypt from 'bcrypt'
import settingsModel from "../schemas/Settings.js";
import Story from "../schemas/stoty.js";
import notificationModel from "../schemas/notifications.js";

const saltRounds = 10; // Define saltRounds for bcrypt hashing

export const normalSignUp = async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    const avatar = req.files?.avatar?.[0]?.filename || null;

    try {
        const isAccountExisted = await User.findOne({ email });
        
        if (isAccountExisted) {
            return res.redirect(`${process.env.frontendURL}/login`)
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            firstname,
            lastname,
            email,
            password: hashedPassword, // Store the hashed password
            avatar
        });

        // Construct full avatar URL if avatar exists
        if (avatar) newUser.avatar = `${process.env.backendURL}/uploads/profile/avatars/${avatar}`;

        await newUser.save();

        const newSettings = new settingsModel({
            user: newUser._id
        });
        await newSettings.save();

        // Log in the user right after signup using Passport's req.login
        req.login(newUser, (err) => {
            if (err) {
                console.error("Login after signup failed:", err);
                // If login fails, redirect to login page with a status
                return res.redirect(`${process.env.frontendURL}/login?auth_status=signup_login_failed`);
            }
            console.log("User logged in after signup (server-side):", req.user?._id || 'User object not available');
            // Redirect after successful login to ensure session cookie is properly set by browser
            console.log(process.env.frontendURL)
            res.redirect(`${process.env.frontendURL}/home`); // Redirect to home page
        });
    } catch (error) {
        console.error("Signup error:", error); // Log the actual error
        res.status(500).json({
            error: true,
            message: "Internal server problem" // Generic error for client
        });
    }
};

export const normalLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.redirect(`${process.env.frontendURL}/`)
        }

        if (!user.password) {
            return res.status(400).json({
                error: true,
                message: "This account was registered via social login. Please use Google or GitHub."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                error: true,
                message: "Incorrect password"
            });
        }

        // If credentials are correct, log in the user using Passport's req.login
        req.login(user, (err) => {
            if (err) {
                console.error("Login failed during session establishment:", err);
                // Ensure no headers have been sent before attempting to send an error response
                if (!res.headersSent) {
                    return res.status(500).json({
                        error: true,
                        message: "Login failed due to server error"
                    });
                }
                return; // Prevent further execution if headers were sent
            }

            
            if (!res.headersSent) { // Defensive check
                return res.status(200).json({
                    error: false,
                    message: "User has logged in successfully"
                });
            }
        });
    } catch (error) {
        console.error("Login attempt error:", error);
        if (!res.headersSent) { // Defensive check
            res.status(500).json({
                error: true,
                message: "Internal server problem"
            });
        }
    }
};

export const firstGoogleRoute = passport.authenticate("google" , {
    scope: ['profile', 'email']
})

export const secondGoogleRoute =  passport.authenticate('google', {
    successRedirect: `${process.env.frontendURL}/home`, // Redirect if authentication succeeds
    failureRedirect: `${process.env.frontendURL}/login`,    // Redirect if authentication fails
})

export const firstGithubRoute = passport.authenticate('github' ,  { scope: ['user:email'] })

export const secondGithubRoute =  passport.authenticate('github', { 
   successRedirect: `${process.env.frontendURL}/home`, // No spaces, just the URL
failureRedirect: `${process.env.frontendURL}/login`
}
)

// ________________________________________________________________________________________

// posts
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const __dirname = path.dirname(__filename);
      const __filename = fileURLToPath(import.meta.url);
      const uploadDir =  path.join(__dirname, "..", "uploads", "posts");
      
      // Create the uploads directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Create a unique filename using timestamp and original name
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      cb(null, uniqueSuffix + extension);
    }
  });
  
  // Filter function to validate file types
  const fileFilter = (req, file, cb) => {
    // Accept images, videos, and documents
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/') ||
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'text/plain'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  };
  
  // Create upload middleware
  const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 100 * 1024 * 1024 // 10MB limit
    }
  });
  
  // Helper to determine the file type based on mimetype
  const determineFileType = (mimetype) => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    return 'file';
  };
  
  // Post creation controller
  export const createPost = async (req, res) => {
    try {
      // Handle file upload with multer middleware
      upload.single('file')(req, res, async function(err) {
        if (err) {
          return res.status(400).json({
            error: true,
            message: err.message || 'Error uploading file'
          });
        }
        
        const { content, user } = req.body;
        
        if (!content && !req.file) {
          return res.status(400).json({
            error: true,
            message: "Please add some content or attach a file"
          });
        }
        
        if (!user) {
          return res.status(400).json({
            error: true,
            message: "User ID is required"
          });
        }
        
        try {
          // Create a new post object
          const postData = {
            content: content || '',
            user
          };
          
          // Add file info if a file was uploaded
          if (req.file) {
            const fileType = req.body.fileType || determineFileType(req.file.mimetype);
            
            postData.media = [{
              url: `/uploads/posts/${req.file.filename}`,
              type: fileType,
              fileName: req.file.originalname,
              fileSize: req.file.size
            }];
          }
          
          // Create and save the post
          const post = new postModel(postData);
          await post.save();

          const populatedPost= await postModel.findOne({_id:post._id}).populate("user")

          const io = req.app.get('io')
          io.emit('newPost' , populatedPost)

          const acceptedFriends = await friendsModel.find({
            $or: [
              { requester: user, status: 'accepted' },
              { recipient: user, status: 'accepted' }
            ]
          });

          const friendIds = acceptedFriends.map(f => 
            f.requester.toString() === user ? f.recipient.toString() : f.requester.toString()
          );

          // Notify followers
          const followers = await followingModel.find({ following: user });
          const followerIds = followers.map(f => f.follower.toString());

          // Merge both, remove duplicates
          const notifyUserIds = [...new Set([...friendIds, ...followerIds])];

          // Emit to each user
          for (const notifyUserId of notifyUserIds) {
            const notification = new notificationModel({
              user: notifyUserId,
              fromUser: user,
              type: 'post',
              post: post._id,
              message: 'Your friend/following has created a new post',
              createdAt: new Date(),
            });
            await notification.save();

            // Emit real-time notification to the user (if online)
            io.to(notifyUserId).emit('notification', notification);
          }
          
          return res.status(200).json({
            error: false,
            message: "Post has been created successfully",
          });
        } catch (err) {
          console.error("Error saving post:", err);
          return res.status(500).json({
            error: true,
            message: "Internal server issue"
          });
        }
      });
    } catch (err) {
      console.error("Post controller error:", err);
      return res.status(500).json({
        error: true,
        message: "Server error"
      });
    }
  };

  export const getAllPosts = async (req , res)=>{
    try{
        const posts = await postModel.find().populate("user")

        res.status(200).json({
            error:false,
            posts
        })
    }catch(error){
        res.status(500).json({
            error:false,
            message:"internal server error"
        })
    }
  }

// likes
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req?.user?._id;

    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({ error: true, message: 'Post not found' });
    }

    const existingLike = await likeModel.findOne({ user: userId, post: postId });
    if (existingLike) {
      return res.status(400).json({ error: true, message: 'Post already liked' });
    }

    const newLike = new likeModel({ user: userId, post: postId });
    await newLike.save();

    const populatedNewLike = await likeModel.findById(newLike._id).populate('user').populate('post').populate('post.user').sort('-createdAt')

      const io = req.app.get('io');
    // Create notification for post owner if liker is NOT the owner
    if (post.user.toString() !== userId.toString()) {
      const notification = new notificationModel({
        user: post.user, // receiver (post owner)
        fromUser: userId, // liker
        type: 'like',
        post: postId,
        content: `${populatedNewLike.user.username} liked your post`
      });
      await notification.save();

      io.to(post.user.toString()).emit('notification', notification);
    }

    io.emit('newLike' , populatedNewLike)
    return res.status(200).json({ error: false, message: 'Post liked successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: true, message: 'Internal server issue' });
  }
};
  
  export const unlikePost = async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req?.user?._id; // Assuming you have authentication middleware
  
      // Find and remove the like
      const like = await likeModel.findOneAndDelete({ user: userId, post: postId });
      const io = req.app.get('io')
       io.emit('likeDeleted', {  postId ,  userId,});
      
      if (!like) {
        return res.status(404).json({
          error: true,
          message: 'Like not found'
        });
      }
  
      return res.status(200).json({
        error: false,
        message: 'Post unliked successfully'
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: true,
        message: 'Internal server issue'
      });
    }
  };
  
  export const getPostLikes = async (req, res) => {
    try {
      // Get likes with user details
      const likes = await likeModel.find().populate('user').populate('post').populate('post.user').sort('-createdAt');
  
      return res.status(200).json({
        error: false,
        likes,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: true,
        message: `Internal server issue ${err}`
      });
    }
  };
  
  // COMMENTS CONTROLLERS
  

export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req?.user?._id;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: true, message: 'Comment content is required' });
    }

    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({ error: true, message: 'Post not found' });
    }

    const newComment = new commentsModel({
      user: userId,
      post: postId,
      content
    });

    await newComment.save();

    const populatedComment = await commentsModel.findById(newComment._id).populate('user').populate('post');
    const io = req.app.get('io');
    // Create notification for the post owner (if commenter is NOT the owner)
    if (post.user.toString() !== userId.toString()) {
      const notification = new notificationModel({
        user: post.user, // receiver (post owner)
        fromUser: userId, // commenter
        type: 'comment',
        post: postId,
        content: `${populatedComment.user.username} commented on your post`
      });
      await notification.save();

      // Emit notification event via socket to post owner
      
      io.to(post.user.toString()).emit('notification', notification);
    }

    io.emit('newComment' , populatedComment)
    return res.status(201).json({ error: false, message: 'Comment added successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: true, message: 'Internal server issue' });
  }
};
  
  export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req?.user?._id;

        const comment = await commentsModel.findById(commentId);

        if (!comment) {
            return res.status(404).json({ error: true, message: 'Comment not found' });
        }

        const postIdOfComment = comment.post; // Get the postId before deleting

        // Check if user is authorized to delete (comment owner or post owner)
        if (comment.user.toString() !== userId.toString()) {
            const post = await postModel.findById(comment.post);
            if (!post || post.user.toString() !== userId.toString()) {
                return res.status(403).json({ error: true, message: 'Not authorized to delete this comment' });
            }
        }

        await commentsModel.findByIdAndDelete(commentId);

        const io = req.app.get('io');
        // Emit more specific data for frontend updates
        io.emit('commentDeleted', { commentId, postId: postIdOfComment, userId });

        return res.status(200).json({ error: false, message: 'Comment deleted successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: 'Internal server issue' });
    }
};
  
  export const getPostsComments = async (req, res) => {
    try {
      // Get comments with user details
      const comments = await commentsModel.find().populate('user').populate('post').sort('-createdAt');
  
      return res.status(200).json({
        error: false,
        comments,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: true,
        message: 'Internal server issue'
      });
    }
  };
  
  // SHARES CONTROLLERS

  export const getSharedPost = async(req , res)=>{
    try{
      const {postId} = req.params

      const post = await postModel.findById(postId).populate('user')

      return res.status(200).json({
        error:false,
        post
      })
    }catch(err){
      return res.status(500).json({
        error:true,
        message:err
      })
    }
  }

  export const getSinglePostLikes = async (req, res) => {
    try {
        const { postId } = req.params;

        // Optional: Check if post exists, though find() on likeModel will handle non-existent posts by returning empty
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ error: true, message: 'Post not found' });
        }

        const likes = await likeModel.find({ post: postId }).populate('user');
        return res.status(200).json({
            error: false,
            likes,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: true,
            message: `Internal server issue: ${err.message}` // More descriptive error
        });
    }
};

// New export to get comments for a specific post
export const getSinglePostComments = async (req, res) => {
    try {
        const { postId } = req.params;
        
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ error: true, message: 'Post not found' });
        }

        const comments = await commentsModel.find({ post: postId }).populate('user').sort('createdAt'); // Sort comments by creation date
        return res.status(200).json({
            error: false,
            comments,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: true,
            message: `Internal server issue: ${err.message}` // More descriptive error
        });
    }
};
  
  // FOLLOWING CONTROLLERS
  
  export const followUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const followerId = req?.user?._id; // Assuming you have authentication middleware
  
      // Check if user exists
      const userToFollow = await User.findById(userId);
      if (!userToFollow) {
        return res.status(404).json({
          error: true,
          message: 'User not found'
        });
      }
  
      // Check if user is trying to follow themselves
      if (userId === followerId.toString()) {
        return res.status(400).json({
          error: true,
          message: 'You cannot follow yourself'
        });
      }
  
      // Check if already following
      const existingFollow = await followingModel.findOne({ 
        follower: followerId, 
        following: userId 
      });
      
      if (existingFollow) {
        return res.status(400).json({
          error: true,
          message: 'Already following this user'
        });
      }
  
      // Create new follow relationship
      const newFollow = new followingModel({
        follower: followerId,
        following: userId
      });
  
      await newFollow.save();
      const io = req.app.get('io')
      io.emit('newFollow' , newFollow)
  
      return res.status(200).json({
        error: false,
        message: 'User followed successfully'
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: true,
        message: 'Internal server issue'
      });
    }
  };
  
  export const unfollowUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const followerId = req?.user?._id; // Assuming you have authentication middleware
  
      // Find and remove the follow relationship
      const follow = await followingModel.findOneAndDelete({ 
        follower: followerId, 
        following: userId 
      });
      const io = req.app.get('io')
      io.emit('unfollow' , {
        follower:followerId,
        following:userId
      })
      
      if (!follow) {
        return res.status(404).json({
          error: true,
          message: 'Follow relationship not found'
        });
      }
  
      return res.status(200).json({
        error: false,
        message: 'User unfollowed successfully'
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: true,
        message: 'Internal server issue'
      });
    }
  };
  
  export const getUserFollowers = async (req, res) => {
    try {
      const userId  = req?.user?.id;
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          error: true,
          message: 'User not found'
        });
      }
  
      // Get followers with details
      const followers = await followingModel.find({ following: userId }).populate('follower').sort('-createdAt');
  
      const count = await followingModel.countDocuments({ following: userId });
  
      return res.status(200).json({
        error: false,
        followers,
        count
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: true,
        message: 'Internal server issue'
      });
    }
  };
  
  export const getUserFollowing = async (req, res) => {
    try {
      const userId  = req?.user?.id;
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          error: true,
          message: 'User not found'
        });
      }
  
      // Get users that this user is following
      const following = await followingModel.find({ follower: userId })
        .populate('following')
        .sort('-createdAt');
  
      const count = await followingModel.countDocuments({ follower: userId });
  
      return res.status(200).json({
        error: false,
        following,
        count
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: true,
        message: 'Internal server issue'
      });
    }
  };


  // friends
  export const getAllUsers = async (req, res) => {
    try {
        const userId = req?.user?.id;

        // Fetch all users except the one with the requestingUserId
        const allUsers = await User.find({ _id: { $ne: userId } });

        return res.status(200).json({ error: false, allUsers });
    } catch (err) {
        return res.status(500).json({ error: true, message: err.message });
    }
};

export const getAllRequests = async( req , res)=>{
  try{
    const requests = await friendsModel.find()

    return res.status(err).json({
      error:false,
      requests
    })
  }catch(err){
      return res.status(500).json({ error: true, message: err.message });
}
}

// Send friend request
export const sendOrCancelRequest = async (req, res) => {
  const requesterId = req?.user?.id;
  const recipientId = req.params.recipientId;

  if (requesterId === recipientId) {
    return res.status(400).send("Can't friend yourself");
  }

  const existing = await friendsModel.findOne({
    $or: [
      { requester: requesterId, recipient: recipientId },
      { requester: recipientId, recipient: requesterId }
    ]
  });

  const io = req.app.get('io');

  if (existing && existing.status === 'pending') {
    // Cancel request
    await friendsModel.deleteOne({ _id: existing._id });

    // Optionally delete notification too
    await notificationModel.deleteOne({
      user: recipientId,
      fromUser: requesterId,
      type: 'friend_request'
    });

    return res.status(200).send('Friend request canceled');
  }

  if (existing) {
    return res.status(400).send('Friend request already exists or you are already friends');
  }

  // Create new friend request
  const friendship = new friendsModel({
    requester: requesterId,
    recipient: recipientId,
    status: 'pending',
  });

  await friendship.save();

  const notification = await notificationModel.create({
    user: recipientId,
    fromUser: requesterId,
    type: "friend_request",
    message: "sent you a friend request"
  });

  io.to(recipientId.toString()).emit('notification', notification);

  res.status(200).send('Friend request sent');
};


// Respond to friend request (accept/reject)
export const respondRequest = async (req, res) => {
  const recipientId = req?.user?.id;
  const requesterId = req?.params?.requesterId;
  const { action } = req?.body; // 'accept' or 'reject'

  if (!['accept', 'reject'].includes(action)) {
    return res.status(400).send('Invalid action');
  }

  const friendship = await friendsModel.findOne({
    requester: requesterId,
    recipient: recipientId,
    status: 'pending'
  });

  if (!friendship) {
    return res.status(404).send('Friend request not found');
  }

  const io = req.app.get('io');

  if (action === 'accept') {
    friendship.status = 'accepted';
    friendship.updatedAt = new Date();

    await User.findByIdAndUpdate(requesterId, { $push: { friends: recipientId } });
    await User.findByIdAndUpdate(recipientId, { $push: { friends: requesterId } });

    await friendship.save();

    // ✅ Store notification
    const notification = await notificationModel.create({
      user: requesterId,
      fromUser: recipientId,
      type: "friend_accepted",
      message: "accepted your friend request"
    });

    io.to(requesterId.toString()).emit('notification', notification);

  } else if (action === 'reject') {
    friendship.status = 'rejected';
    friendship.updatedAt = new Date();

    await friendship.save();

    // ✅ Store notification
    const notification = await notificationModel.create({
      user: requesterId,
      fromUser: recipientId,
      type: "friend_rejected",
      message: "rejected your friend request"
    });

    io.to(requesterId.toString()).emit('notification', notification);
  }

  res.send(`Friend request ${action}ed`);
};


// Remove a friend
export const removeFriend = async (req, res) => {
  const userId = req?.user?.id;
  const friendId = req?.params?.friendId;

  const friendship = await friendsModel.findOneAndDelete({
    status: 'accepted',
    $or: [
      { requester: userId, recipient: friendId },
      { requester: friendId, recipient: userId }
    ]
  });

  if (!friendship) {
    return res.status(404).send('Friendship not found');
  }

  // Optional: Remove from users' friends array if maintained there

  res.send('Friend removed');
};

// GET /messages/:friendId
export const getMessagesWithFriend = async (req, res) => {
  const userId = req?.user?.id;
  const friendId = req?.params?.friendId;

  try {
    const messages = await messagesModel.find({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId }
      ]
    }).sort({ timestamp: 1 });

    res.status(200).json({
      error:false,
      messages
    });
  } catch (error) {
    res.status(500).send('Error fetching messages');
  }
};

// POST /messages/:friendId
export const sendMessageToFriend = async (req, res) => {
  const senderId = req?.user?.id;
  const receiverId = req?.params?.friendId;
  const { message } = req?.body;

  if (!message) return res.status(400).send('Message content required');

  try {
    const newMessage = new messagesModel({
      sender: senderId,
      receiver: receiverId,
      message
    });

    await newMessage.save();

    // Emit message via Socket.IO
    const io = req.app.get('io');

    // Send to receiver
    io.to(receiverId.toString()).emit('privateMessage', newMessage);

    // Send to sender too
    io.to(senderId.toString()).emit('privateMessage', newMessage);

    res.status(200).json(newMessage);
  } catch (error) {
    res.status(500).send('Error sending message');
  }
};


  export const getProfileUser=async(req , res)=>{
    const {id} = req.params
    try{
      const user = await User.findById(id)

      if(!user){
        res.status(404).json({
          error:true,
          message:'User Not found'
        })
      }

      res.status(200).json({
        error:false,
        user
      })
    }catch(err){
      return res.status(500).json({
        error:true,
        message:err
      })
    }
  }

  export const updateUserProfile = async (req, res) => {
  const id = req?.user?.id
  const { bio, socialLinks } = req.body;

  const avatar = req.files?.avatar?.[0]?.filename || null;
  const coverPhoto = req.files?.coverPhoto?.[0]?.filename || null;

  console.log(req.files);

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    // Update fields
    if (bio !== undefined) user.bio = bio;
    if (socialLinks !== undefined) user.socialLinks = socialLinks // assuming it's sent as a JSON string
    
    if (avatar) user.avatar = `${process.env.backendURL}/uploads/profile/avatars/${avatar}`;
    if (coverPhoto) user.coverPhoto = `${process.env.backendURL}/uploads/profile/coverPhotos/${coverPhoto}`;

    await user.save();

    return res.status(200).json({
      error: false,
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

export const updateUserInfo = async (req, res) => {
  try {
    const userId = req?.user?.id;
    // Use 'username' to match frontend, and ensure 'currentPassword' and 'newPassword' are destructured
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update username if provided
    if (name !== undefined) { // Check for undefined to allow empty string updates if desired
      user.username = name;
    }

    // Update email if provided
    if (email !== undefined) { // Check for undefined
      user.email = email;
    }

    // Handle profile image upload
    // Assuming you have a multer middleware setup that populates req.files
    // Changed 'profileImage' to 'avatar' to match your multer configuration
    if (req.files && req.files.avatar && req.files.avatar[0]) {
      const newAvatarFilename = req.files.avatar[0].filename;
      const newAvatarPath = `${process.env.backendURL}/uploads/profile/avatars/${newAvatarFilename}`;

      // Delete old avatar if it exists and is a local path (not a social media avatar URL)
      // You need to adjust the path.join based on your actual file structure
      // Example: if your uploads are in a 'uploads' directory one level up from your controllers
      if (user.avatar && user.avatar.startsWith(`${process.env.backendURL}/uploads/profile/avatars/`)) {
        const oldAvatarFilename = user.avatar.split('/').pop();
        // Construct the absolute path to the old avatar file
        const oldAvatarFilePath = path.join(__dirname, '..', '..', 'uploads', 'profile', 'avatars', oldAvatarFilename);
        if (fs.existsSync(oldAvatarFilePath)) {
          fs.unlinkSync(oldAvatarFilePath);
          console.log(`Deleted old avatar: ${oldAvatarFilePath}`);
        }
      }
      user.avatar = newAvatarPath;
    }

    // Handle password update
    if (newPassword) {
      // Check if the user has a social login ID (Google or GitHub)
      const isSocialUser = user.googleId || user.githubId;

      if (!isSocialUser) {
        // For non-social login users, current password is required to change password
        if (!currentPassword) {
          return res.status(400).json({ message: "Current password is required to change your password." });
        }

        // Verify current password for non-social users
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: "Current password is incorrect." });
        }
      } else if (user.password && !currentPassword) {
      }

      // Hash and update the new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    // Return the updated user object so the frontend can update its state
    res.status(200).json({ message: "Settings updated successfully", user: user });

  } catch (error) {
    console.error("Error in updateUserInfo:", error);
    res.status(500).json({ message: "Server error during update." });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req?.user?.id;

    await User.findByIdAndDelete(userId);

    // Destroy session after account deletion
    req.session.destroy(err => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Account deleted but logout failed" });
      }

      res.clearCookie("connect.sid"); // Clear session cookie
      return res.status(200).json({ message: "Account deleted successfully" });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ message: "Logout failed" });
    }

    res.clearCookie("connect.sid"); // Clear the session cookie
    return res.status(200).json({ message: "Logged out successfully" });
  });
};

export const updateDarkMode = async (req, res) => {
  try {
    const userId = req?.user?.id;
    const { darkMode } = req.body;

    if (typeof darkMode !== "boolean") {
      return res.status(400).json({ message: "darkMode must be a boolean" });
    }

    const updatedSettings = await settingsModel.findOneAndUpdate(
      { user: userId },
      { darkMode },
      { new: true, upsert: true } // create doc if not exists
    );

    res.status(200).json({ message: "Dark mode updated", settings: updatedSettings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// stories
export const createStory = async (req, res) => {
  try {
    const file = req.files?.story?.[0];

    let mediaUrl = null;
    let mediaType = null;

    // If a file was uploaded
    if (file) {
      mediaUrl = `${process.env.backendURL}/uploads/profile/stories/${file.filename}`;

      mediaType = file.mimetype.startsWith('image/')
        ? 'image'
        : file.mimetype.startsWith('video/')
        ? 'video'
        : 'unknown';

      if (mediaType === 'unknown') {
        return res.status(400).json({ message: 'Unsupported media type' });
      }
    } else {
      mediaType = 'text'; // ✅ Handle text-only story
    }

    const { caption } = req.body;

    const story = await Story.create({
      user: req?.user?.id,
      mediaUrl,
      mediaType,
      caption
    });

    const io = req.app.get('io');
    io.emit('new-story', {
      user: req?.user?.id,
      story
    });

    res.status(201).json(story);
  } catch (err) {
    console.error('Failed to create story:', err);
    res.status(500).json({ message: 'Failed to create story', error: err.message });
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Delete a story
export const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (story.user.toString() !== req?.user?.id) {
      return res.status(403).json({ message: 'Not authorized to delete this story' });
    }

    // If the story has a mediaUrl, try to delete the file
    if (story.mediaUrl) {
      const filename = story.mediaUrl.split('/').pop();
      const filePath = path.join(__dirname, '..', 'uploads', 'profile', 'stories', filename);

      // Delete file from disk
      fs.unlink(filePath, (err) => {
        if (err) console.warn('Failed to delete file:', err.message);
      });
    }

    await story.deleteOne();

    const io = req.app.get('io');
    io.emit('delete-story', {
      user: req?.user?.id,
      storyId: req.params.id
    });

    res.status(200).json({ message: 'Story deleted successfully' });
  } catch (err) {
    console.error('Failed to delete story:', err);
    res.status(500).json({ message: 'Failed to delete story', error: err.message });
  }
};



export const getNotifications = async (req, res) => {
  try {
    const userId = req?.user?.id;

    const notifications = await notificationModel
      .find({ user: userId })
      .populate('fromUser') // Only fetch basic sender info
      .populate({
      path: 'post',
      match: { _id: { $exists: true } },  
      })
      .sort({ createdAt: -1 });                      // Newest first

    res.status(200).json({
      error: false,
      notifications
    });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({
      error: true,
      message: "Server error while fetching notifications"
    });
  }
};

export const markNotificationsAsSeen = async (req, res) => {
  try {
    const userId = req?.user?.id;

    await notificationModel.updateMany(
      { user: userId, seen: false },
      { $set: { seen: true } }
    );

    res.status(200).json({ error: false, message: 'All notifications marked as seen' });
  } catch (err) {
    console.error('Error marking notifications as seen:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
};

export const getFeedStories = async (req, res) => {
  try {
    const user = await User.findById(req?.user?.id)

    // Combine current user's ID + friend IDs
    const userIds = [req?.user?.id, ...user?.friends];

    const stories = await Story.find({ user: { $in: userIds } })
      .sort({ createdAt: -1 });

    res.status(200).json({
      error: false,
      stories,
    });
  } catch (err) {
    console.error('Error fetching feed stories:', err);
    res.status(500).json({
      error: true,
      message: 'Server error while fetching feed stories',
    });
  }
};