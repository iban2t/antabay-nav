import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import TopNavigation from "./components/TopNavigation.js";
import Sidebar from "./components/Sidebar.js";
import Container from 'react-bootstrap/Container';
import Summary from './components/Summary.js';
import profile from "./assets/profile.svg";
import { jwtDecode } from 'jwt-decode';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [contactCount, setContactCount] = useState(0);
  const [freqLocCount, setFreqLocCount] = useState(0);
  const [distressCount, setDistressCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [zonesCount, setZonesCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = getUserIdFromToken(token);

        // Fetch user data
        const userResponse = await axios.get(`http://localhost:5000/users/users/${userId}`, {
          headers: {
            Authorization: token
          }
        });
        console.log("User data:", userResponse.data);
        setUserData(userResponse.data);

        // Fetch contact count
        const contactsResponse = await axios.get(`http://localhost:5000/users/contacts`, {
          headers: {
            Authorization: token
          }
        });
        setContactCount(contactsResponse.data.length);

        // Fetch frequent locations count
        const freqLocResponse = await axios.get(`http://localhost:5000/users/freq`, {
          headers: {
            Authorization: token
          }
        });
        setFreqLocCount(freqLocResponse.data.length);

        // Fetch distress count
        const distressResponse = await axios.get(`http://localhost:5000/nav/distress`, {
          headers: {
            Authorization: token
          }
        });
        setDistressCount(distressResponse.data.length);

        // Fetch report count
        const reportResponse = await axios.get(`http://localhost:5000/nav/report`, {
          headers: {
            Authorization: token
          }
        });
        setReportCount(reportResponse.data.length);

        // Fetch zones count
        const zonesResponse = await axios.get(`http://localhost:5000/zones/zones`, {
          headers: {
            Authorization: token
          }
        });
        setZonesCount(zonesResponse.data.zones.length);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const getUserIdFromToken = (token) => {
    const decodedToken = jwtDecode(token);
    return decodedToken.userId;
  };

  return (
    <>
      <TopNavigation />
      <Sidebar />

      <br />
      <div className='pageHeader'>
        <h3 style={{ marginLeft: "6rem" }}>Dashboard</h3>
      </div>
      <br />

      <Container style={{ marginLeft: "7rem" }}>
        {userData && (
          <div className='tray'>
            <div className='innertray'>
            <Summary
                color="#E6E6E6"
                title={<span style={{ color: 'black' }}>Me</span>}
                number={<img src={profile} alt="profile" width={160} />}
                description={<span style={{ color: 'black' }}>{userData?.name || 'Loading...'}</span>}
              />
              <Link to="/contacts" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Summary
                  color="#BE29EC"
                  title="Contacts"
                  number={contactCount}
                  description="Saved Contacts"
                />
              </Link>
              <Link to="/freqloc" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Summary
                  color="#BE29EC"
                  title="Frequent Locations"
                  number={freqLocCount}
                  description="Frequent Locations"
                />
              </Link>
            </div>
            <div className='innertray'>
              <Link to="/distress" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Summary
                  color="#D9534F"
                  title="Distress"
                  number={distressCount}
                  description="Signals Sent"
                />
              </Link>
              <Link to="/reports" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Summary
                  color="#F0AD4E"
                  title="Reports"
                  number={reportCount}
                  description="Created Reports"
                />
              </Link>
              <Link to="/zones" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Summary
                  color="#198754"
                  title="Zones"
                  number={zonesCount}
                  description="Generated Zones"
                />
              </Link>
            </div>
          </div>
        )}
      </Container>
    </>
  );
};

export default Dashboard;
