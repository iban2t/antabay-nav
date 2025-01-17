import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

function Header() {
  const navigation = useNavigation();

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>Antabay Lite</Text>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Svg width={24} height={24} viewBox="0 0 55 54" fill="none">
          <Path
            d="M12.8678 45C11.8136 45 10.9336 44.6535 10.2278 43.9605C9.52043 43.266 9.16675 42.4012 9.16675 41.3662V12.6337C9.16675 11.5987 9.52043 10.7347 10.2278 10.0417C10.9336 9.34725 11.8136 9 12.8678 9H27.5436V11.25H12.8678C12.5164 11.25 12.1933 11.394 11.8984 11.682C11.6051 11.9715 11.4584 12.2887 11.4584 12.6337V41.3662C11.4584 41.7113 11.6051 42.0285 11.8984 42.318C12.1933 42.606 12.5164 42.75 12.8678 42.75H27.5436V45H12.8678ZM37.7255 34.9605L36.1167 33.3428L41.4311 28.125H21.0651V25.875H41.4311L36.1145 20.655L37.7255 19.0395L45.8334 27L37.7255 34.9605Z"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#800080',
    paddingHorizontal: 20,
    paddingTop: 25
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
});

export default Header;
