import React, { useEffect, useState } from 'react';
import TopNavigation from "./components/TopNavigation.js";
import Sidebar from "./components/Sidebar.js";
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/esm/Container.js';
import config from './config.js';

function Distress() {
  const baseURL = config.REACT_APP_API_BASE_URL;
  const [data, setData] = useState([])
    useEffect(()=> {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        axios.get(`${baseURL}/nav/distress`, {
            headers: {
                Authorization: token // Include the token in the request headers
            }
        })
        .then(res => setData(res.data))
        .catch(err => console.log(err));
    }, [])
  return (
    <>
        <div>
            <TopNavigation/>
            <Sidebar/>

            <div className='page-header'>
                <h3>Distress</h3>
            </div>

            <Container className='table-container'>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Description</th>
                            <th>Date/Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            data.map((distress, index) => {
                                return <tr key={index}>
                                    <td>{distress.id}</td>
                                    <td>{distress.description}</td>
                                    <td>{distress.distress_at}</td>
                                </tr>
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
  )
}

export default Distress