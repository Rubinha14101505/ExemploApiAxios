import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Button } from "react-native";
import api from './src/devices/api';

export default function App() {
  const [users, setUsers] = useState([]);

  // CORREÇÃO: URL com duas barras após http: e porta 3000 (não 300)
  const API = "http://10.110.12.43:3000/users";

  async function fetchUsers() {
    try {
      const response = await api.get(API);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error.message);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const _render = () => {
    const vet = [];
    users.map((item, index) => {
      vet.push(
        <View key={index}>
          <Text style={styles.item}>ID:{item.id} Nome:{item.name} Email:{item.email}</Text>
        </View>
      );
    });
    return vet;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GET - listar usuarios</Text>
      <Button title="recarrega lista" onPress={fetchUsers} />
      <ScrollView>
        {_render()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  item: { fontSize: 12, marginTop: 10 }
});