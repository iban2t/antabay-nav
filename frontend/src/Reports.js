import React, { useEffect, useState } from 'react';
import TopNavigation from "./components/TopNavigation.js";
import Sidebar from "./components/Sidebar.js";
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/esm/Container.js';

function Reports() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    axios.get('http://localhost:5000/nav/report', {
      headers: {
        Authorization: token // Include the token in the request headers
      }
    })
    .then(res => setData(res.data))
    .catch(err => console.log(err));
  }, []);
  
  return (
    <>
      <div>
        <TopNavigation/>
        <Sidebar/>

        <br></br>
        <h3 style={{
                marginLeft: "6rem"
                }}>Reports</h3>
        <br></br>
        <br></br>
          <Container className='table'>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Report</th>
                  <th>Address</th>
                  <th>Date Reported</th>
                </tr>
              </thead>
              <tbody>
                {
                  data.map((report, index) => {
                    const formattedDate = new Intl.DateTimeFormat('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      timeZone: 'Asia/Manila', // Adjust to Philippine timezone
                    }).format(new Date(report.report_at));
                    
                    return (
                      <tr key={index}>
                        <td>{report.id}</td>
                        <td>{report.user_report}</td>
                        <td>{report.address}</td>
                        <td>{formattedDate}</td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </Table>
          </Container>
      </div>
    </>
  );
}

export default Reports;
