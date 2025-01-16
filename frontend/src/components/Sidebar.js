import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import "@trendmicro/react-sidenav/dist/react-sidenav.css";
import SideNav, { NavItem, NavIcon, NavText } from "@trendmicro/react-sidenav";
import dashboardIcon from '../assets/dashboard.svg';
import navigateIcon from '../assets/navigation.svg';
import contactsIcon from '../assets/contacts.svg';
import freqLocIcon from '../assets/freqloc.svg';
import distressIcon from '../assets/distress.svg';
import reportsIcon from '../assets/reports.svg';
import zonesIcon from '../assets/zones.svg';

export default function Sidebar() {
  const [isVisible, setVisible] = useState(false);
  const location = useLocation(); // Get the current location

  // Define array of navigation items
  const navItems = [
    { key: 'dashboard', text: 'Dashboard', icon: dashboardIcon, link: '/dashboard' },
    { key: 'navigation', text: 'Navigation',  icon: navigateIcon, link: '/navigation' },
    { key: 'contacts', text: 'Contacts',  icon: contactsIcon, link: '/contacts' },
    { key: 'freqLoc', text: 'Frequent Locations', icon: freqLocIcon, link: '/freqloc' },
    { key: 'distress', text: 'Distress', icon: distressIcon, link: '/distress' },
    { key: 'reports', text: 'Reports', icon: reportsIcon, link: '/reports' },
    { key: 'zones', text: 'Zones', icon: zonesIcon, link: '/zones' }
  ];

  return (
    <SideNav className="sidebar" defaultExpanded={isVisible} style={{ height: '100vh', position: 'fixed', left: 0 }}>
      <SideNav.Toggle
        onClick={() => {
          setVisible(!isVisible);
        }}
      />
      <SideNav.Nav>
        {/* Map over the array of navigation items and render NavItem dynamically */}
        {navItems.map(({ key, text, icon, link }) => (
          <NavItem key={key} eventKey={key} active={location.pathname === link}>
            <NavIcon>
              <Link to={link}>
                <img src={icon} alt={text} style={{ width: '1.75em' }} />
              </Link>
            </NavIcon>
            <NavText>
              <Link to={link}>{text}</Link>
            </NavText>
          </NavItem>
        ))}
      </SideNav.Nav>
    </SideNav>
  );
}
