import React from 'react'
import F_SB from '../../components/F_SB/F_SB'
import Nav from '../../components/Nav/Nav'
import { useState } from 'react'

const Friends = ({socket , user , darkMode}) => {
  return (
    <div className='h-screen w-screen'>
      <header className='fixed top-0 left-0 right-0 z-10'>
          <Nav user={user} darkMode={darkMode}/>
      </header>
      {/* SIDEBAR - Now responsive */}
      <F_SB user={user} socket={socket} darkMode={darkMode}/>
     </div>
  )
}

export default Friends