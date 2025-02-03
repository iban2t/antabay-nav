import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import TopNavigation from "./components/TopNavigation.js";
import Sidebar from "./components/Sidebar.js";
import Container from 'react-bootstrap/Container';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jwtDecode } from 'jwt-decode';
import config from './config.js';

const Dashboard = () => {
  const baseURL = config.REACT_APP_API_BASE_URL;
  const [userData, setUserData] = useState(null);
  const [distressCount, setDistressCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [zonesCount, setZonesCount] = useState(0);
  const [distressHistory, setDistressHistory] = useState([]);
  const [reportsByLocation, setReportsByLocation] = useState([]);
  const [zoneDistribution, setZoneDistribution] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = getUserIdFromToken(token);

        const userResponse = await axios.get(`${baseURL}/users/users/${userId}`, {
          headers: { Authorization: token }
        });
        setUserData(userResponse.data);

        const distressResponse = await axios.get(`${baseURL}/nav/distress`, {
          headers: { Authorization: token }
        });
        setDistressCount(distressResponse.data.length);

        const reportResponse = await axios.get(`${baseURL}/nav/report`, {
          headers: { Authorization: token }
        });
        setReportCount(reportResponse.data.length);

        const zonesResponse = await axios.get(`${baseURL}/zones/zones`, {
          headers: { Authorization: token }
        });
        setZonesCount(zonesResponse.data.zones.length);

        const processedDistressData = distressResponse.data.map(item => ({
          date: new Date(item.distress_at).toLocaleDateString(),
          count: 1
        })).reduce((acc, curr) => {
          const existing = acc.find(item => item.date === curr.date);
          if (existing) {
            existing.count += curr.count;
          } else {
            acc.push(curr);
          }
          return acc;
        }, []);
        setDistressHistory(processedDistressData);

        const reportData = reportResponse.data.reduce((acc, curr) => {
          const existing = acc.find(item => item.location === curr.address);
          if (existing) {
            existing.count += 1;
          } else {
            acc.push({ location: curr.address, count: 1 });
          }
          return acc;
        }, []);
        setReportsByLocation(reportData);

        const zoneData = zonesResponse.data.zones.reduce((acc, curr) => {
          const existing = acc.find(item => item.name === curr.location_name);
          if (existing) {
            existing.value += 1;
          } else {
            acc.push({ name: curr.location_name, value: 1 });
          }
          return acc;
        }, []);
        setZoneDistribution(zoneData);

        const usersResponse = await axios.get(`${baseURL}/users/users`, {
          headers: { Authorization: token }
        });
        setTotalUsers(usersResponse.data.length);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [baseURL]);

  const getUserIdFromToken = (token) => {
    const decodedToken = jwtDecode(token);
    return decodedToken.userId;
  };

  return (
    <>
      <TopNavigation />
      <Sidebar />

      <div className='pageHeader'>
        <h3 style={{ marginLeft: "6rem" }}>Dashboard</h3>
      </div>

      <Container style={{ marginLeft: "7rem", marginTop: "2rem" }}>
        <div className="stats-container">
          <div className="stat-card" style={{ backgroundColor: '#BE29EC' }}>
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>

          <Link to="/distress" style={{ textDecoration: 'none' }}>
            <div className="stat-card" style={{ backgroundColor: '#D9534F' }}>
              <div className="stat-icon">🚨</div>
              <div className="stat-content">
                <h3>{distressCount}</h3>
                <p>Distress Signals</p>
              </div>
            </div>
          </Link>

          <Link to="/reports" style={{ textDecoration: 'none' }}>
            <div className="stat-card" style={{ backgroundColor: '#F0AD4E' }}>
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h3>{reportCount}</h3>
                <p>Reports</p>
              </div>
            </div>
          </Link>

          <Link to="/navigation" style={{ textDecoration: 'none' }}>
            <div className="stat-card" style={{ backgroundColor: '#198754' }}>
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <h3>{zonesCount}</h3>
                <p>Active Zones</p>
              </div>
            </div>
          </Link>
        </div>
      </Container>

      <Container style={{ marginLeft: "7rem" }}>
        <div className='charts-container' style={{ marginTop: "2rem" }}>
          <div className='chart-card'>
            <h4>Distress Signals Over Time</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={distressHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#D9534F" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className='chart-card'>
            <h4>Reports by Location</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportsByLocation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#F0AD4E" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className='chart-card'>
            <h4>Zone Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={zoneDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#198754"
                  label
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Container>

      <style jsx>{`
        .charts-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          padding: 1rem;
        }
        .chart-card {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h4 {
          margin-bottom: 1rem;
          color: #333;
        }
        .stats-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          padding: 1.5rem;
          border-radius: 8px;
          color: white;
          display: flex;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-icon {
          font-size: 2rem;
          margin-right: 1rem;
        }
        .stat-content h3 {
          font-size: 1.8rem;
          margin: 0;
          font-weight: bold;
        }
        .stat-content p {
          margin: 0;
          font-size: 1rem;
          opacity: 0.9;
        }
      `}</style>
    </>
  );
};

export default Dashboard;
