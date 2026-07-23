import React from "react";
import {StyleSheet, View} from "react-native";
import MapView,{Marker} from "react-native-maps";


export default function MapScreen(){

return(

<View style={styles.container}>


<MapView

style={styles.map}

initialRegion={{

latitude:8.4822,

longitude:124.6472,

latitudeDelta:0.05,

longitudeDelta:0.05

}}

>


<Marker

coordinate={{

latitude:8.4822,

longitude:124.6472

}}

title="San Teodoro"

/>


</MapView>


</View>

)

}



const styles=StyleSheet.create({

container:{
flex:1
},

map:{
width:"100%",
height:"100%"
}

});