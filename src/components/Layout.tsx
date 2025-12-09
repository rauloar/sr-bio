import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full bg-[#101922] font-display">
      <Sidebar />
      <div className="flex-1 overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;