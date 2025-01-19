import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import { DataTable } from 'react-native-paper'; // Import DataTable from react-native-paper
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from './config'

function Reports() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const response = await axios.get(`${config.API_BASE_URL}/nav/report`, {
          headers: {
            Authorization: token
          }
        });
        setData(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const renderRow = ({ item }) => (
    <DataTable.Row>
      <DataTable.Cell>{item.id}</DataTable.Cell>
      <DataTable.Cell>{item.type}</DataTable.Cell>
      <DataTable.Cell>{item.user_report}</DataTable.Cell>
      <DataTable.Cell>{item.address}</DataTable.Cell>
    </DataTable.Row>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reports</Text>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>ID</DataTable.Title>
          <DataTable.Title>Type</DataTable.Title>
          <DataTable.Title>Report</DataTable.Title>
          <DataTable.Title>Address</DataTable.Title>
        </DataTable.Header>
        <FlatList
          data={data}
          renderItem={renderRow}
          keyExtractor={(item) => item.id.toString()}
        />
      </DataTable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  topNavigation: {
    marginBottom: 16,
    // Add more styling for top navigation if needed
  },
  sidebar: {
    marginBottom: 16,
    // Add more styling for sidebar if needed
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default Reports;
