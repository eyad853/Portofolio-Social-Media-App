import React from 'react'
import { Outlet } from 'react-router-dom';

const HomeLayOut = () => {
  return (
    <div >
      <Outlet />
    </div>
  );
}

export default HomeLayOut