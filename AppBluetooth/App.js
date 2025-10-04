import React, { useState, useEffect } from "react";
import { View,Text, Button, FlatList, StyleSheet, PermissionsAndroid, Platform } from "react-native";
import { BleManager } from "react-native-ble-plx";

const Manager = new BleManager();

function BleScannerComponent(){
  // Variavel de estado 'devices' guardara lista de dispositivos 
  const [devices, setDevices] = useState([]);

  // O estado radioPowerOn verifica se o blue está ligado (true) ou desligado (false)
  const [radioPowerOn, setRadioPowerOn] = useState(false);

  useEffect( () => {
    const subscription = manager.onStateChange((state)=>{
      if(state == "PoweOn"){
        setRadioPowerOn(true);
        subscription.remove();
      }
    }, true);
    return() => {
      subscription.remove();
      Manager.destroy();
    }
  }, [])

  //const requestBluetoothPermission = async () => {
    // Busca saber qual API - A partir do Android 12 (API 31), as permissões explicitas do bluethooth são necessarias
  //  const apiLevel = parseInt(Platform.Version.toString(),10);
   // if (apiLevel <31){
   //     const
  //  }
 // }

}export default BleScannerComponent