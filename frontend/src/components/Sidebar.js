import React, { useState } from 'react';
import "@trendmicro/react-sidenav/dist/react-sidenav.css";
import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from "@trendmicro/react-sidenav";

export default function Sidebar() {
  const [isVisible, setVisible] = useState(false);
  
  // Define array of navigation items
  const navItems = [
    { key: 'dashboard', text: 'Dashboard', icon: 'fa fa-fw fa-dashboard' },
    { key: 'users', text: 'Users', icon: 'fa fa-fw fa-users' },
    { key: 'distress', text: 'Distress', icon: 'fa fa-fw fa-exclamation-triangle' },
    { key: 'reports', text: 'Reports', icon: 'fa fa-fw fa-bar-chart' },
    { key: 'zones', text: 'Zones', icon: 'fa fa-fw fa-map-marker' }
  ];

  return (
    <SideNav className="sidebar" defaultExpanded={isVisible}>

      <SideNav.Toggle
        onClick={() => {
          setVisible(!isVisible);
        }}
      />
      <SideNav.Nav defaultSelected="dashboard">
        {/* Map over the array of navigation items and render NavItem dynamically */}
        {navItems.map(({ key, text, icon }) => (
          <NavItem key={key} eventKey={key}>
            <NavIcon>
              <i className={icon} style={{ fontSize: "1.75em" }} />
            </NavIcon>
            <NavText>{text}</NavText>
          </NavItem>
        ))}
      </SideNav.Nav>
    </SideNav>
  );
}
