import React, { useEffect, useState } from 'react'
import Nav from '../../components/Nav/Nav'
import axios from 'axios'
import { FaUser, FaHeart, FaComment, FaUserPlus, FaUserCheck, FaUserTimes, FaNewspaper } from 'react-icons/fa'

const Notifications = ({user , socket , setTrigger, darkMode}) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mark notifications as seen on page load
    const markAsSeen = async () => {
      try {
        await axios.post('http://localhost:8000/notifications/markAsSeen', {}, { withCredentials: true });
        // Optionally update your local state here to reflect that notifications are seen
      } catch (error) {
        console.error('Failed to mark notifications as seen', error);
      }
    };

    markAsSeen();
  }, []);

  useEffect(() => {
    // Get initial notifications
    getNotifications()

    // Listen for real-time notifications
    socket.on('notification', (data) => {
      setNotifications(prev => [...prev , data])
    })

    return () => {
      socket.off('notification')
    }
  }, [socket])

  const getNotifications = async() => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:8000/notifications/getAll', {withCredentials: true})
      if (response) {
        setNotifications(response.data.notifications || [])
      }
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const respondRequest = async(requesterId, action) => {
    try {
      // Remove the notification after responding
      setNotifications(prev => prev.filter(notif => 
        !(notif.type === 'friend_request' && notif.fromUser._id === requesterId)
      ))
      setTrigger(prev=>prev+1)
      const response = await axios.post(`http://localhost:8000/respondRequest/${requesterId}`, {action}, {withCredentials: true})
      if (response) {
      }
    } catch (err) {
      console.log(err)
    }
  }

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'friend_request':
        return <FaUserPlus className="text-blue-500" />
      case 'friend_accepted':
        return <FaUserCheck className="text-green-500" />
      case 'friend_rejected':
        return <FaUserTimes className="text-red-500" />
      case 'post':
        return <FaNewspaper className="text-purple-500" />
      case 'comment':
        return <FaComment className="text-orange-500" />
      case 'like':
        return <FaHeart className="text-red-500" />
      default:
        return <FaUser className={`${darkMode ? "text-gray-400" : "text-gray-500"}`} />
    }
  }

  const getNotificationText = (notification) => {
    const fromUserName = notification.fromUser?.username || 'Someone'
    
    switch(notification.type) {
      case 'friend_request':
        return `${fromUserName} sent you a friend request`
      case 'friend_accepted':
        return `${fromUserName} accepted your friend request`
      case 'friend_rejected':
        return `${fromUserName} rejected your friend request`
      case 'post':
        return `${fromUserName} created a new post`
      case 'comment':
        return `${fromUserName} commented on your post`
      case 'like':
        return `${fromUserName} liked your post`
      default:
        return notification.message || 'New notification'
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  console.log(notifications);

  const renderNotification = (notification) => {
    const isUnread = !notification.seen

    return (
      <div 
        key={notification._id} 
        className={`p-3 sm:p-4 border-b ${darkMode ? "border-neutral-700" : "border-gray-200"} ${darkMode ? "hover:bg-neutral-800" : "hover:bg-gray-50"} transition-colors ${
          isUnread ? `${darkMode ? "bg-neutral-800 border-l-4 border-l-blue-400" : "bg-blue-50 border-l-4 border-l-blue-500"}` : ''
        }`}
      >
        <div className="flex items-start space-x-2 sm:space-x-3">
          <div className="flex-shrink-0">
            {notification.fromUser?.profilePicture ? (
              <img 
                src={notification.fromUser.profilePicture} 
                alt={notification.fromUser.username}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
              />
            ) : (
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${darkMode ? "bg-neutral-600" : "bg-gray-300"} flex items-center justify-center`}>
                <FaUser className={`text-sm sm:text-base ${darkMode ? "text-neutral-400" : "text-gray-600"}`} />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start sm:items-center space-x-2 flex-wrap">
              <div className="flex-shrink-0 mt-1 sm:mt-0">
                {getNotificationIcon(notification.type)}
              </div>
              <p className={`text-xs sm:text-sm ${isUnread ? `font-semibold ${darkMode ? "text-white" : "text-gray-900"}` : `${darkMode ? "text-neutral-300" : "text-gray-700"}`} leading-relaxed`}>
                {getNotificationText(notification)}
              </p>
            </div>
            
            <p className={`text-xs ${darkMode ? "text-neutral-500" : "text-gray-500"} mt-1`}>
              {formatTimeAgo(notification.createdAt)}
            </p>
            
            {/* Friend request actions */}
            {notification.type === 'friend_request' && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-3">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    respondRequest(notification.fromUser._id, 'accept')
                  }}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-500 text-white text-xs sm:text-sm rounded-md hover:bg-blue-600 transition-colors"
                >
                  Accept
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    respondRequest(notification.fromUser._id, 'reject')
                  }}
                  className={`w-full sm:w-auto px-3 sm:px-4 py-2 ${darkMode ? "bg-neutral-600 text-neutral-300 hover:bg-neutral-700" : "bg-gray-300 text-gray-700 hover:bg-gray-400"} text-xs sm:text-sm rounded-md transition-colors`}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
          
          {isUnread && (
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`w-screen h-screen overflow-auto flex flex-col ${darkMode ? "bg-neutral-800" : "bg-gray-100"}`}>
      <header className='fixed top-0 left-0 right-0 z-10'>
        <Nav user={user} darkMode={darkMode}/>
      </header>

      <div className={`flex-1 flex px-2 sm:px-4 lg:px-5 flex-col overflow-auto pt-16 ${darkMode ? "bg-neutral-800" : "bg-gray-100"}`}>
        <div className="max-w-4xl lg:max-w-2xl mx-auto w-full">
          <div className={`${darkMode ? "bg-neutral-700 border-neutral-600" : "bg-white border-gray-200"} rounded-lg shadow-sm border mt-2 sm:mt-4`}>
            <div className={`px-3 sm:px-6 py-3 sm:py-4 border-b ${darkMode ? "border-neutral-600" : "border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <h1 className={`text-lg sm:text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Notifications</h1>
                {notifications.some(n => !n.seen) && (
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm text-blue-500 font-medium">
                      {notifications.filter(n => !n.seen).length} new
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className={`divide-y ${darkMode ? "divide-neutral-700" : "divide-gray-200"}`}>
              {loading ? (
                <div className="flex justify-center items-center py-8 sm:py-12">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                  <FaUser className={`${darkMode ? "text-neutral-500" : "text-gray-400"} text-3xl sm:text-4xl mb-3 sm:mb-4`} />
                  <p className={`${darkMode ? "text-neutral-400" : "text-gray-500"} text-base sm:text-lg text-center`}>No notifications yet</p>
                  <p className={`${darkMode ? "text-neutral-500" : "text-gray-400"} text-xs sm:text-sm text-center mt-1`}>When you get notifications, they'll appear here</p>
                </div>
              ) : (
                notifications.map(notification => renderNotification(notification))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notifications