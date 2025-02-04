import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChartBar, FaMapMarkedAlt, FaBell, FaClipboardList, FaUsers } from 'react-icons/fa';
import "@trendmicro/react-sidenav/dist/react-sidenav.css";

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const navItems = [
    { key: 'dashboard', text: 'Dashboard', icon: <FaChartBar />, link: '/dashboard' },
    { key: 'navigation', text: 'Navigation', icon: <FaMapMarkedAlt />, link: '/navigation' },
    { key: 'users', text: 'Users', icon: <FaUsers />, link: '/users' },
    { key: 'distress', text: 'Distress', icon: <FaBell />, link: '/distress' },
    { key: 'reports', text: 'Reports', icon: <FaClipboardList />, link: '/reports' }
  ];

  return (
    <div className={`sidebar ${isExpanded ? 'expanded' : ''}`}>
      <button 
        className="toggle-btn"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? '◀' : '▶'}
      </button>

      <div className="nav-items">
        {navItems.map(({ key, text, icon, link }) => (
          <Link
            key={key}
            to={link}
            className={`nav-item ${location.pathname === link ? 'active' : ''}`}
            title={text}
          >
            <span className="icon">{icon}</span>
            <span className="text">{text}</span>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .sidebar {
          position: fixed;
          top: 69px;
          left: 0;
          height: calc(100vh - 69px);
          background: #2a003a;
          width: ${isExpanded ? '240px' : '64px'};
          transition: all 0.3s ease;
          box-shadow: 2px 0 5px rgba(0,0,0,0.1);
          z-index: 1001;
          overflow-x: hidden;
        }

        .toggle-btn {
          position: absolute;
          right: -12px;
          top: 20px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
          color: #666;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          z-index: 1;
          transition: all 0.3s ease;
        }

        .toggle-btn:hover {
          background: #f8f9fa;
          transform: scale(1.1);
        }

        .nav-items {
          padding: 1rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          transition: all 0.2s ease;
          white-space: nowrap;
          overflow: hidden;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .nav-item.active {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border-right: 3px solid white;
        }

        .icon {
          font-size: 1.2rem;
          min-width: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .text {
          margin-left: 1rem;
          opacity: ${isExpanded ? '1' : '0'};
          transition: opacity 0.3s ease;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: ${isExpanded ? '200px' : '0px'};
          }

          .toggle-btn {
            display: ${isExpanded ? 'flex' : 'none'};
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
