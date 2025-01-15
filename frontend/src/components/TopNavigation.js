import React from 'react';
import { useNavigate } from 'react-router-dom'; // Add useNavigate
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

const TopNavigation = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <Navbar className='cont' variant='dark'>
      <Container>
        <Navbar.Brand href="#home">Antbay Web</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className='justify-content-end'>
          <Navbar.Text>
            Signed in as: {username}
          </Navbar.Text>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopNavigation;
