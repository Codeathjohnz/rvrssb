import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function MapScreen(){

return (

<View style={styles.container}>

<Text>
Map is available on mobile app only.
</Text>

</View>

);

}


const styles = StyleSheet.create({

container:{
flex:1,
justifyContent:"center",
alignItems:"center"
}

});