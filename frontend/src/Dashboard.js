import React, { useEffect, useState } from 'react';
import TopNavigation from "./components/TopNavigation.js"
import Sidebar from "./components/Sidebar.js"
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Summary from './components/Summary.js';
import profile from "./assets/profile.svg"
const Dashboard = () => {
  return (
    <>
      <TopNavigation/>
      <Sidebar/>
      <div style={{
        marginLeft: "4rem"
      }}>
        <div>Dashboard</div>
      <div className='tray'>
        <div className='innertray'>
        <Summary 
        color="#E6E6E6"
        title="Me"
        number={<img src={profile}  width={120}/>}
        description="Ivan Villanueva"
        />
        <Summary 
        color="#BE29EC"
        title="Users"
        number="21"
        description="Total Users"
        />
        <Summary 
        color="#BE29EC"
        title="This Month"
        number="9"
        description="New Users"
        />

        </div>
        <div className='innertray'>
        <Summary 
        color="#D9534F"
        title="Distress"
        number="6"
        description="Signals Sent"
        />
        <Summary 
        color="#F0AD4E"
        title="Reports"
        number="3"
        description="Created Reports"
        />
        <Summary
        color="#198754"
        title="Zones"
        number="5"
        description="Generated Zones"
        />

        </div>
      </div>
     
      </div>
    </>
  );
};

export default Dashboard;
