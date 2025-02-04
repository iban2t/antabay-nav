import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const TopNavigation = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <Navbar className="top-nav" variant="dark" expand="lg">
      <Container fluid>
        <Navbar.Brand href="dashboard" className="brand">
          <span className="brand-text">Antabay</span>
          <span className="brand-subtitle">Admin Dashboard</span>
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <div className="user-section">
            <FaUserCircle className="user-icon" />
            <span className="username">{username}</span>
            <Button 
              variant="outline-light" 
              onClick={handleLogout}
              className="logout-btn"
            >
              <FaSignOutAlt className="logout-icon" />
              <span>Logout</span>
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>

      <style>{`
        .top-nav {
          background: linear-gradient(90deg, #2a003a 0%, #800080 100%);
          padding: 0.5rem 1rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          z-index: 999;
        }

        .brand {
          display: flex;
          flex-direction: column;
          line-height: 1;
          margin-left: 3rem;
        }

        .brand-text {
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
        }

        .brand-subtitle {
          font-size: 0.8rem;
          opacity: 0.8;
          color: #f0f0f0;
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.1);
        }

        .user-icon {
          font-size: 1.5rem;
          color: white;
        }

        .username {
          font-weight: 500;
          margin-right: 1rem;
          border-right: 1px solid rgba(255, 255, 255, 0.2);
          padding-right: 1rem;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-radius: 20px;
          padding: 0.4rem 1rem;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
        }

        .logout-icon {
          font-size: 0.9rem;
        }
      `}</style>
    </Navbar>
  );
};

export default TopNavigation;
