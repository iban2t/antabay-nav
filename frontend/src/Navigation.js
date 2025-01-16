import React from 'react'
import TopNavigation from "./components/TopNavigation.js";
import Sidebar from "./components/Sidebar.js";
import MapContainer from "./components/MapContainer.js";

function Navigate() {
  return (
    <>
    <div>
        <TopNavigation/>
        <Sidebar/>

        <MapContainer/>
    </div>
    </>
  )
}

export default Navigate