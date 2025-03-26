import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import TopNavigation from "./components/TopNavigation.js";
import Sidebar from "./components/Sidebar.js";
import Container from 'react-bootstrap/Container';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jwtDecode } from 'jwt-decode';
import config from './config.js';
import { formatDistanceToNow } from 'date-fns';

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
  const [activeDistressCount, setActiveDistressCount] = useState(0);
  const [newReportsCount, setNewReportsCount] = useState(0);
  const [activityLogs] = useState([
    {
      id: 1,
      type: 'signup',
      message: 'New user registered: john_doe',
      created_at: new Date(Date.now() - 120000).toISOString()
    },
    {
      id: 2,
      type: 'login',
      message: 'User logged in: sarah_smith',
      created_at: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: 3,
      type: 'distress',
      message: 'Distress signal activated in Legazpi City',
      created_at: new Date(Date.now() - 600000).toISOString()
    },
    {
      id: 4,
      type: 'report',
      message: 'New suspicious activity report submitted',
      created_at: new Date(Date.now() - 900000).toISOString()
    }
  ]);
  const [onlineUsers, setOnlineUsers] = useState([]);

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

        // Fetch active distress count
        // const activeDistressResponse = await axios.get(`${baseURL}/nav/distress-active`, {
        //   headers: { Authorization: token }
        // });
        // setActiveDistressCount(activeDistressResponse.data.length || 0);

        // Fetch new reports (last 24 hours)
        const newReportsResponse = await axios.get(`${baseURL}/nav/report-new`, {
          headers: { Authorization: token }
        });
        setNewReportsCount(newReportsResponse.data.length || 0);

      } catch (error) {
        // Only log errors for endpoints we're actually using
        if (error.response?.status !== 404) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();

    // Set up polling for active data every 30 seconds
    const pollInterval = setInterval(fetchData, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(pollInterval);
  }, [baseURL]);

  useEffect(() => {
    const updateStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Update user's online status
        await axios.post(
          `${baseURL}/users/status`,
          { status: 'online' },
          { headers: { Authorization: token } }
        );

        // Fetch online users
        const response = await axios.get(
          `${baseURL}/users/online`,
          { headers: { Authorization: token } }
        );
        setOnlineUsers(response.data);

      } catch (error) {
        console.error('Error updating status:', error);
      }
    };

    // Update status every minute
    updateStatus();
    const interval = setInterval(updateStatus, 60000);

    // Set offline status when component unmounts
    return async () => {
      clearInterval(interval);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await axios.post(
            `${baseURL}/users/status`,
            { status: 'offline' },
            { headers: { Authorization: token } }
          );
        }
      } catch (error) {
        console.error('Error setting offline status:', error);
      }
    };
  }, [baseURL]);

  const getUserIdFromToken = (token) => {
    const decodedToken = jwtDecode(token);
    return decodedToken.userId;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'signup': return '👤';
      case 'login': return '🔑';
      case 'distress': return '🚨';
      case 'report': return '📝';
      default: return '📋';
    }
  };

  return (
    <>
      <TopNavigation />
      <Sidebar />

      <div className='page-header'>
        <h3>Dashboard</h3>
      </div>

      <Container style={{ marginLeft: "7rem", marginTop: "2rem" }}>
        {/* New Alert Cards */}
        <div className="alert-cards">
          <div className="alert-card">
            <div className="alert-icon">🚨</div>
            <div className="alert-content">
              <h2>{activeDistressCount}</h2>
              <h4>Active Distress</h4>
            </div>
          </div>

          <div className="alert-card">
            <div className="alert-icon">📝</div>
            <div className="alert-content">
              <h2>{newReportsCount}</h2>
              <h4>New Reports</h4>
            </div>
          </div>

          <div className="alert-card">
            <div className="alert-icon">👥</div>
            <div className="alert-content">
              <h2>{onlineUsers.length}</h2>
              <h4>Online Users</h4>
              <div className="online-users-tooltip">
                {onlineUsers.map(user => (
                  <div key={user.id} className="online-user-item">
                    <span className="online-indicator">●</span>
                    <span className="user-name">{user.name || user.username}</span>
                    <span className="user-status">Mobile User</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Log Box */}
        <div className="activity-log-container">
          <h4>Recent Activities</h4>
          <div className="activity-log-content">
            {activityLogs.length > 0 ? (
              activityLogs.map((log, index) => (
                <div key={log.id || index} className="activity-item">
                  <span className="activity-icon">
                    {getActivityIcon(log.type)}
                  </span>
                  <div className="activity-details">
                    <p className="activity-message">{log.message}</p>
                    <span className="activity-time">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-activity">No recent activity</p>
            )}
          </div>
        </div>

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
        .page-header {
          padding: 1rem 0;
          margin-top: 4rem;
          margin-left: 6rem;
          border-bottom: 1px solid #eee;
        }

        .page-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.75rem;
          font-weight: 500;
        }

        .charts-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          padding: 1rem;
          width: 100%;
        }
        
        .chart-card {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          min-height: 350px;
        }
        
        .stats-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
          width: 100%;
        }
        
        .stat-card {
          padding: 1.5rem;
          border-radius: 8px;
          color: white;
          display: flex;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.2s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
        }
        
        .stat-icon {
          font-size: 2rem;
          margin-right: 1rem;
        }
        
        .stat-content h3 {
          font-size: clamp(1.5rem, 3vw, 1.8rem);
          margin: 0;
          font-weight: bold;
        }
        
        .stat-content p {
          margin: 0;
          font-size: clamp(0.875rem, 2vw, 1rem);
          opacity: 0.9;
        }

        @media (min-width: 992px) {
          .stats-container {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 768px) {
          .page-header {
            margin-left: 4rem;
            padding: 0.75rem 1rem;
          }

          .page-header h3 {
            font-size: 1.5rem;
          }

          .stats-container {
            padding: 0 1rem;
          }
          
          .stat-card {
            padding: 1rem;
          }
          
          .stat-icon {
            font-size: 1.5rem;
            margin-right: 0.5rem;
          }
        }

        @media (max-width: 576px) {
          .page-header {
            margin-left: 1rem;
          }

          .charts-container {
            grid-template-columns: 1fr;
          }
        }

        .alert-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .alert-card {
          position: relative;
          background: white;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .alert-card:hover .online-users-tooltip {
          display: block;
        }

        .online-users-tooltip {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border-radius: 8px;
          padding: 0.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          z-index: 1000;
          max-height: 200px;
          overflow-y: auto;
        }

        .online-user-item {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          border-bottom: 1px solid #eee;
        }

        .online-user-item:last-child {
          border-bottom: none;
        }

        .online-indicator {
          color: #2ecc71;
          margin-right: 0.5rem;
        }

        .user-name {
          flex: 1;
          font-size: 0.9em;
        }

        .user-status {
          color: #666;
          font-size: 0.8em;
          margin-left: 0.5rem;
        }

        .alert-icon {
          font-size: 2rem;
          margin-right: 1rem;
        }

        .alert-content {
          flex: 1;
        }

        .alert-content h2 {
          margin: 0;
          font-size: 1.8rem;
          color: #333;
        }

        .alert-content h4 {
          margin: 0;
          color: #666;
          font-size: 1rem;
        }

        .activity-log-container {
          background: #1E1E1E;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .activity-log-container h4 {
          color: #fff;
          margin-bottom: 1rem;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .activity-log-content {
          max-height: 300px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .activity-log-content::-webkit-scrollbar {
          width: 6px;
        }

        .activity-log-content::-webkit-scrollbar-track {
          background: #2D2D2D;
          border-radius: 3px;
        }

        .activity-log-content::-webkit-scrollbar-thumb {
          background: #666;
          border-radius: 3px;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 0.5rem;
          background: #2D2D2D;
          transition: background-color 0.2s ease;
        }

        .activity-item:hover {
          background: #363636;
        }

        .activity-icon {
          font-size: 1.2rem;
          min-width: 24px;
        }

        .activity-details {
          flex: 1;
        }

        .activity-message {
          color: #fff;
          margin: 0;
          font-size: 0.9rem;
        }

        .activity-time {
          color: #888;
          font-size: 0.8rem;
        }

        .no-activity {
          color: #666;
          text-align: center;
          padding: 1rem;
          margin: 0;
        }

        @media (max-width: 768px) {
          .activity-log-container {
            margin: 1rem;
            padding: 1rem;
          }

          .activity-log-content {
            max-height: 250px;
          }

          .activity-item {
            padding: 0.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default Dashboard;
