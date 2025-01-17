import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapContainer from './components/MapContainer';

function Navigation() {
    return (
        <View style={styles.container}>
          <MapContainer />
        </View>
      );
    };
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#fff', // Set your desired background color
      },
    });

export default Navigation