import { useState, useEffect, use } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import UserList from "./components/UserList";
import userForm from "./components/UserForm";

export default function App(){
  const [user, setUsers] = useState([]);
  const [loading, setLoading] = useState (false);

  //Funçao GET para buscar usuarios
  const fetchUsers = async () => {
    try{
      setLoading(true); // Ativa indicador de carregamento
      //Faz o GET para carregar users
      const response =await fetch ("http://TROCAR_IP_LOCAL:300/users");
      //Converte a resposta em JSON
      const data = await response.json();
    }catch (error){
      console.error("Error GET:", error.message);
    }
    finally{
      setLoading(false);
    }
  }

  useEffect(() =>{
    fetchUsers();
  },[]);

  return (
    <View style={styles.container}>
      <Text style={style.title}> CRUD com fetch</Text>
      <UserForm onUserAdded={fetchUsers}/>
      <ScrollView>
        {loading ? (<Text>Carregando...</Text>) :
        (<UserList users={users} onUserChanged={fetchUsers}/>)}
      </ScrollView>
    </View>
  );

}

const styles = StyleSheetList.create({
  container: {flex:1, padding: 20pageXOffset, marginTop:40},
  title: {fontSize:22, fontWeigth:"bold", marginBotton:20}
});