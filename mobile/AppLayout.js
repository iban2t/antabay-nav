import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';

const AppLayout = () => {
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <BottomNavigation />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default AppLayout;
