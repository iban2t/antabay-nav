import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from './config';

function Reports() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const response = await axios.get(`${config.API_BASE_URL}/nav/report`, {
          headers: {
            Authorization: token,
          },
        });
        setData(response.data);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to fetch reports.');
      }
    };
    fetchData();
  }, []);

  const renderItem = ({ item }) => {
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Manila', // Adjusted to Philippine timezone
    }).format(new Date(item.report_at));

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.user_report}</Text>
        <Text style={styles.dateTime}>{formattedDate}</Text>
        <Text style={styles.location}>{item.address}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reports</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <Text style={styles.noDataText}>No reports found</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 10,
    paddingBottom: 70,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'left',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dateTime: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    color: '#6c757d',
  },
  noDataText: {
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 20,
  },
});

export default Reports;
