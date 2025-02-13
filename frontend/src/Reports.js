import React, { useEffect, useState } from 'react';
import TopNavigation from "./components/TopNavigation.js";
import Sidebar from "./components/Sidebar.js";
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/esm/Container.js';
import config from './config.js';

function Reports() {
  const [data, setData] = useState([]);
  const baseURL = config.REACT_APP_API_BASE_URL
  
  useEffect(() => {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    axios.get(`${baseURL}/nav/report`, {
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

        <div className='page-header'>
          <h3>Reports</h3>
        </div>

        <Container className='table-container'>
          <Table striped bordered hover responsive>
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

          @media (max-width: 768px) {
            .page-header {
              margin-left: 4rem;
              padding: 0.75rem 1rem;
            }

            .page-header h3 {
              font-size: 1.5rem;
            }
          }

          @media (max-width: 576px) {
            .page-header {
              margin-left: 1rem;
            }
          }

          .table-container {
            margin-top: 2rem;
            margin-left: 6rem;
            margin-right: 2rem;
            overflow-x: auto;
          }

          @media (max-width: 768px) {
            .table-container {
              margin-left: 4rem;
              margin-right: 1rem;
              padding: 0 1rem;
            }
          }

          @media (max-width: 576px) {
            .table-container {
              margin-left: 1rem;
              margin-right: 1rem;
              padding: 0;
            }
          }
        `}</style>
      </div>
    </>
  );
}

export default Reports;
