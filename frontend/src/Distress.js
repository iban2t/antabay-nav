import React, { useEffect, useState } from 'react';
import TopNavigation from "./components/TopNavigation.js";
import Sidebar from "./components/Sidebar.js";
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/esm/Container.js';

function Distress() {
  const [data, setData] = useState([])
    useEffect(()=> {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        axios.get('http://localhost:5000/nav/distress', {
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

            <br></br>
            <h3 style={{
                    marginLeft: "6rem"
                    }}>Distress</h3>
            <br></br>
              <Container className='table'>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Date/Time</th>
                      <th>Sent To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      data.map((distress, index) => {
                        return <tr key={index}>
                          <td>{distress.id}</td>
                          <td>{distress.type}</td>
                          <td>{distress.distress_at}</td>
                          <td>{distress.contact_names}</td>
                        </tr>
                      })
                    }
                  </tbody>
                </Table>
              </Container>
      </div>
    </>
  )
}

export default Distress