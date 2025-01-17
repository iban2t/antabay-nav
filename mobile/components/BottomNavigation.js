import React from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Path } from 'react-native-svg';

import Contacts from '../Contacts';
import Frequent from '../Frequent';
import Navigation from '../Navigation';
import Distress from '../Distress';
import Reports from '../Reports';

const Tab = createBottomTabNavigator();

// SVG component to render icons
const SvgComponent = ({ focused, iconName, iconSize }) => {
  const iconColor = focused ? '#800080' : '#999';
  let pathData;

  // Determine the path data based on iconName
  switch (iconName) {
    case 'contacts':
      pathData = (
        <Path
          d="M6.04167 0.0833321V20.9167H0.875V0.0833321H6.04167ZM8.625 0.0833321H21.5481C22.9715 0.0833321 24.125 1.01875 24.125 2.15625V18.8438C24.125 19.9885 22.9715 20.9167 21.5481 20.9167H8.625V0.0833321ZM25.4167 4.25H28V8.41667H25.4167V4.25ZM25.4167 10.5H28V14.6667H25.4167V10.5ZM16.375 10.5C17.0601 10.5 17.7172 10.2805 18.2017 9.8898C18.6862 9.4991 18.9583 8.9692 18.9583 8.41667C18.9583 7.86413 18.6862 7.33423 18.2017 6.94353C17.7172 6.55283 17.0601 6.33333 16.375 6.33333C15.6899 6.33333 15.0328 6.55283 14.5483 6.94353C14.0638 7.33423 13.7917 7.86413 13.7917 8.41667C13.7917 8.9692 14.0638 9.4991 14.5483 9.8898C15.0328 10.2805 15.6899 10.5 16.375 10.5ZM12.5 14.6667H20.25C20.25 13.8379 19.8417 13.043 19.115 12.457C18.3883 11.8709 17.4027 11.5417 16.375 11.5417C15.3473 11.5417 14.3617 11.8709 13.635 12.457C12.9083 13.043 12.5 13.8379 12.5 14.6667Z"
          fill={iconColor}
        />
      );
      break;
    case 'frequent':
      pathData = (
        <Path
          d="M0.666687 24.125V3.45833C0.666687 2.74792 0.92802 2.13997 1.45069 1.6345C1.97335 1.12903 2.60091 0.875861 3.33335 0.875H16.6667C17.4 0.875 18.028 1.12817 18.5507 1.6345C19.0734 2.14083 19.3342 2.74878 19.3334 3.45833V24.125L10 20.25L0.666687 24.125Z"
          fill={iconColor}
        />
      );
      break;
    case 'navigate':
      pathData = (
        <Path
          d="M13.2812 21.75C13.1769 21.75 13.0736 21.73 12.9775 21.6911C12.8813 21.6522 12.7943 21.5952 12.7214 21.5234C12.6486 21.4517 12.5915 21.3667 12.5535 21.2734C12.5154 21.1801 12.4973 21.0805 12.5 20.9803V12.3811C12.5 12.2816 12.4588 12.1863 12.3856 12.1159C12.3123 12.0456 12.213 12.0061 12.1094 12.0061H3.14502C2.9807 12.008 2.8198 11.961 2.68439 11.8716C2.54898 11.7822 2.44568 11.6548 2.38867 11.5069C2.32374 11.3304 2.32987 11.1371 2.40584 10.9647C2.48182 10.7924 2.62217 10.6536 2.79931 10.5755L21.5493 2.31844C21.6942 2.25472 21.8559 2.23505 22.0127 2.26206C22.1695 2.28908 22.314 2.36148 22.4268 2.46957C22.5395 2.57766 22.6152 2.71626 22.6435 2.86679C22.6719 3.01731 22.6516 3.17257 22.5854 3.31172L13.9917 21.3117C13.9295 21.4424 13.8294 21.5533 13.7035 21.631C13.5775 21.7087 13.431 21.75 13.2812 21.75Z"
          fill={iconColor}
        />
      );
      break;
    case 'distress':
      pathData = (
        <Path
          d="M3.52625 25L15.5 5L27.4737 25H3.52625ZM5.74791 23.75H25.2521L15.5 7.5L5.74791 23.75ZM15.5 22.0187C15.7256 22.0187 15.9142 21.945 16.0657 21.7975C16.2182 21.6508 16.2944 21.4683 16.2944 21.25C16.2944 21.0317 16.2182 20.8492 16.0657 20.7025C15.9142 20.555 15.7256 20.4813 15.5 20.4813C15.2744 20.4813 15.0858 20.555 14.9342 20.7025C14.7818 20.8492 14.7056 21.0317 14.7056 21.25C14.7056 21.4683 14.7818 21.6508 14.9342 21.7975C15.0858 21.945 15.2744 22.0187 15.5 22.0187ZM14.8542 19.2313H16.1458V12.9813H14.8542V19.2313Z"
          fill={iconColor}
        />
      );
      break;
    case 'reports':
      pathData = (
        <Path
          d="M20.5 0.333336H2.5C1.2625 0.333336 0.25 1.30834 0.25 2.5V22L4.75 17.6667H20.5C21.7375 17.6667 22.75 16.6917 22.75 15.5V2.5C22.75 1.30834 21.7375 0.333336 20.5 0.333336ZM20.5 15.5H3.81625L2.5 16.7675V2.5H20.5V15.5ZM10.375 3.58334H12.625V10.0833H10.375V3.58334ZM10.375 12.25H12.625V14.4167H10.375V12.25Z"
          fill={iconColor}
        />
      );
      break;
    default:
      pathData = null;
      break;
  }

  return (
    <Svg width={iconSize} height={iconSize} viewBox="0 0 28 21" fill="none">
      {pathData}
    </Svg>
  );
};

const BottomNavigation = () => {
  const screenOptions = {
    tabBarShowLabel: false,
    headerShown: false,
    tabBarStyle: {
      position: 'absolute',
      backgroundColor: '#fff',
      height: 70,
      display: 'flex',
      flexDirection: 'row'
    },
  };

  const tabTextStyle = {
    fontSize: 12,
    color: '#999',
  };

  return (
    <Tab.Navigator initialRouteName="Navigate" screenOptions={screenOptions}>
      <Tab.Screen
        name="Contacts"
        component={Contacts}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <SvgComponent focused={focused} iconName="contacts" iconSize={24}/>
              <Text style={{ ...tabTextStyle, color: focused ? '#800080' : '#999' }}>Contacts</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Frequent"
        component={Frequent}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <SvgComponent focused={focused} iconName="frequent" iconSize={24}/>
              <Text style={{ ...tabTextStyle, color: focused ? '#800080' : '#999' }}>Frequent</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Navigate"
        component={Navigation}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <SvgComponent focused={focused} iconName="navigate" iconSize={29}/>
              <Text style={{ ...tabTextStyle, color: focused ? '#800080' : '#999' }}>Navigate</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Distress"
        component={Distress}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <SvgComponent focused={focused} iconName="distress" iconSize={28}/>
              <Text style={{ ...tabTextStyle, color: focused ? '#800080' : '#999' }}>Distress</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={Reports}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <SvgComponent focused={focused} iconName="reports" iconSize={24}/>
              <Text style={{ ...tabTextStyle, color: focused ? '#800080' : '#999' }}>Reports</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomNavigation;