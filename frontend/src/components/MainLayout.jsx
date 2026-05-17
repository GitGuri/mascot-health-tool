import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FaCommentDots, FaNewspaper, FaMapMarkerAlt, FaUserMd } from 'react-icons/fa';

const MainLayout = () => {
  const location = useLocation();
  const isExpertRoute = location.pathname.includes('expert-portal');

  if (isExpertRoute) {
    return <Outlet />;
  }

  const navItems = [
    { path: '/ai-chat', icon: FaCommentDots, label: 'AI Chat' },
    { path: '/health-hub', icon: FaNewspaper, label: 'Health Hub' },
    { path: '/reach-out', icon: FaMapMarkerAlt, label: 'Reach Out' },
    { path: '/expert-chat', icon: FaUserMd, label: 'Expert Chat' },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
      <nav className="bg-white border-t border-gray-200 px-4 py-2 safe-area-bottom">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-[#04342C]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <item.icon className={`text-xl ${isActive ? 'text-[#04342C]' : ''}`} />
                <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;