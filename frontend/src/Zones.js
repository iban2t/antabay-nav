import React, { useEffect, useState } from 'react';
import TopNavigation from "./components/TopNavigation.js";
import Sidebar from "./components/Sidebar.js";
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/esm/Container.js';

function Zones() {
    const [data, setData] = useState([]); // Initialize data as an empty array

    useEffect(()=> {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        axios.get('http://localhost:5000/zones/zones', {
            headers: {
                Authorization: token // Include the token in the request headers
            }
        })
        .then(res => setData(res.data.zones)) // Set data to the array of zones from the response
        .catch(err => console.log(err));
    }, []);

    console.log("Data:", data); // Add this line to log the value of data

    return (
        <>
            <div>
                <TopNavigation/>
                <Sidebar/>

                <br></br>
                <h3 style={{
                    marginLeft: "6rem"
                    }}>Zones</h3>
            <br></br>
                <br></br>
                <Container className='table '>
                    <Table striped bordered hover >
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Location Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((zone, index) => (
                                <tr key={index}>
                                    <td>{zone.id}</td>
                                    <td>{zone.type}</td>
                                    <td>{zone.location_name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Container>
            </div>
        </>
    );
}

export default Zones;
