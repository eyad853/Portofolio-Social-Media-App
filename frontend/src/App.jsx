import {BrowserRouter as Router , Routes , Route} from "react-router-dom"
import React, { useEffect, useState } from 'react'
import Login from "./pages/Login/Login"
import HomeLayOut from "./pages/HomeLayOut/HomeLayOut"
import Home from "./pages/HomeLayOut/Home"
import Profile from "./pages/HomeLayOut/Profile"
import Settings from "./pages/HomeLayOut/Settings"
import Notifications from "./pages/HomeLayOut/Notifications"
import Friends from "./pages/HomeLayOut/Friends"
import Modal from 'react-modal'
import axios from "axios"
import socket from "./socket"
import Chats from "./pages/HomeLayOut/Chats"
import SharedPost from "./pages/HomeLayOut/SharedPost"
import CreateTextStoryPage from "./pages/HomeLayOut/CreateTextStoryPage"
import StoryView from "./pages/HomeLayOut/StoryView"
import Signup from './pages/Signup/Signup'
Modal.setAppElement('#root')


const App = () => {
  const [darkMode , setDarkMode]=useState(true)
  const [privateAccount, setPrivateAccount] = useState(false);
  const [hiddenSeen, setHiddenSeen] = useState(false);

  const [isAccountPrivate , setIsAccountPrivate]=useState(false)
  const [isStatusHidden , setIsStatusHidden]=useState(false)

  const [user , setUser]=useState({})
  const [trigger , setTrigger]=useState(0)
  const [posts , setPosts]=useState([])
  
  const [userFollowing, setUserFollowing] = useState([]); // Array of user IDs you're following
  const [userFollowers, setUserFollowers] = useState([]); // Array of your followers

  const [loadingUser , setLoadingUser]=useState(false)
  const [loadingPosts , setLoadingPosts]=useState(false)
  const [loadingStories , setLoadingStories]=useState(false)

  const [stories, setStories] = useState([]);

  useEffect(() => {
    const loadStories = async () => {
      setLoadingStories(true);
      try {
        const response = await axios.get(`${window.location.origin}/stories/getAll`, {
          withCredentials:true
        });
        const data = response.data
        console.log(data);
              
        if (data.error) {
          console.error('Error fetching stories:', data.message);
          alert('Failed to load stories');
          return;
        }
        
        setStories(data.stories);
      } catch (error) {
        console.error('Error fetching stories:', error);
        
      } finally {
        setLoadingStories(false);
      }
    };
    
    loadStories();
  }, []);

    useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
    };
  }, []);
  // Add event listeners for connection status

const fetchUser = async()=>{
  setLoadingUser(true)
  await axios.get(`${window.location.origin}/api/user`, { withCredentials: true })
      .then(response => {
          if (!response.data.error) {
              setUser(response.data.user);
          }
      })
      .catch(error => {
          console.error('Error fetching user:', error);
          setUser(null)
      });
      setLoadingUser(false)
}

const fetchAllPosts = async()=>{
  try{
    setLoadingPosts(true)
    const response = await axios.get(`${window.location.origin}/post/getAll`)
    setPosts(response.data.posts)
  }catch(err){
    console.log(err);
  }finally{
    setLoadingPosts(false)
  }
}
  useEffect(()=>{
    fetchUser()
    fetchAllPosts()
  },[trigger])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup/>}/>
        <Route path="/login"  element={<Login />}/>
        <Route path="/home"   element={<HomeLayOut />}>
          <Route index element={
          loadingPosts&&loadingUser?(
            <div className="fixed inset-0 flex justify-center items-center">
              <div className="w-80 h-80 rounded-full border-y-2 border-blue-600 animate-spin"></div>
            
            </div>
          ):(<Home 
          darkMode={darkMode} 
          user={user} 
          setPosts={setPosts} 
          posts={posts} 
          socket={socket}
          userFollowing={userFollowing}
          setUserFollowing={setUserFollowing}
          userFollowers={userFollowers}
          setUserFollowers={setUserFollowers}
          stories={stories} 
          setStories={setStories}
          />)
          }/>
          
          <Route path="/home/profile/:userId" element={<Profile 
          setUser={setUser} 
          darkMode={darkMode} 
          user={user} 
          socket={socket}
          userFollowing={userFollowing}
          userFollowers={userFollowers} 
          />}/>

          <Route
            path="/home/settings" // Relative path
            element={<Settings 
            user={user} 
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
            isAccountPrivate={isAccountPrivate}
            setIsAccountPrivate={setIsAccountPrivate}
            isStatusHidden={isStatusHidden}
            setIsStatusHidden={setIsStatusHidden}
            setUser={setUser}
            privateAccount={privateAccount}
            setPrivateAccount={setPrivateAccount}
            hiddenSeen={hiddenSeen}
            setHiddenSeen={setHiddenSeen}
            />}/>

          <Route path="/home/notification" element={<Notifications 
          socket={socket} 
          user={user} 
          darkMode={darkMode}
          setTrigger={setTrigger}
          />
        }
          />

          <Route path="/home/friends" element={<Friends 
          socket={socket} 
          user={user} 
          darkMode={darkMode}/>}
          />

          <Route path="/home/chats/:userId" element={<Chats 
          socket={socket} 
          user={user} 
          darkMode={darkMode}/>}
          />

          <Route path="/home/post/shared/:postId" element={<SharedPost 
          user={user} 
          darkMode={darkMode}
          socket={socket} 
          userFollowing={userFollowing}
          setUserFollowing={setUserFollowing}
          userFollowers={userFollowers}
          setUserFollowers={setUserFollowers}
          posts={posts}
          setPosts={setPosts}
          />} />

          <Route path="/home/create-text-story" element={<CreateTextStoryPage darkMode={darkMode} />} />
          <Route path="/home/Stories/:userId" element={<StoryView darkMode={darkMode} stories={stories} setStories={setStories}/>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App