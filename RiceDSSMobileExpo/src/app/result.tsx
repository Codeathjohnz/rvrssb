import React from "react";

import {
  StyleSheet,
  View,
  ScrollView,
  Pressable
} from "react-native";

import {useRouter, useLocalSearchParams} from "expo-router";

import {ThemedText} from "@/components/themed-text";
import {ThemedView} from "@/components/themed-view";



export default function Result(){


const router = useRouter();

const params = useLocalSearchParams();


// Temporary ELECTRE Ranking Result
// Replace with API result later

const ranking = [

{
name:"RC 222",
score:0.92,
reason:"High soil adaptability and good yield potential"
},

{
name:"RC 402",
score:0.87,
reason:"Strong pest resistance and climate tolerance"
},

{
name:"RC 436",
score:0.83,
reason:"Good market demand and stable production"
}

];



return(

<ThemedView style={styles.container}>


<ScrollView>


<ThemedText type="title">
📊 ELECTRE Result Dashboard
</ThemedText>


<ThemedText style={styles.subtitle}>
Rice Variety Ranking Based on Farm Conditions
</ThemedText>





{/* Farmer Input Summary */}

<View style={styles.card}>


<ThemedText type="subtitle">
🌱 Farm Information
</ThemedText>


<ThemedText>
Barangay: {params.barangay}
</ThemedText>


<ThemedText>
Soil Type: {params.soil}
</ThemedText>


<ThemedText>
Water Availability: {params.water}
</ThemedText>


<ThemedText>
Climate: {params.climate}
</ThemedText>


</View>







{/* Top Recommendation */}


<View style={styles.recommendCard}>


<ThemedText type="subtitle">
🏆 Best Recommended Variety
</ThemedText>


<ThemedText style={styles.bestRice}>
{ranking[0].name}
</ThemedText>


<ThemedText>
ELECTRE Score:
{ranking[0].score}
</ThemedText>


<ThemedText>
{ranking[0].reason}
</ThemedText>


</View>







{/* Bar Chart */}

<View style={styles.card}>


<ThemedText type="subtitle">
📈 Top 3 Rice Variety Ranking
</ThemedText>



{
ranking.map((item,index)=>(


<View
key={item.name}
style={styles.chartContainer}
>


<ThemedText>

#{index+1} {item.name}

</ThemedText>



<View style={styles.barBackground}>


<View

style={[
styles.bar,
{
width:`${item.score*100}%`
}
]}

/>


</View>


<ThemedText>
Score:
{item.score}
</ThemedText>


</View>


))

}



</View>








{/* Explanation */}

<View style={styles.card}>


<ThemedText type="subtitle">
💡 Recommendation Explanation
</ThemedText>


<ThemedText>

The ELECTRE method evaluates rice varieties
based on multiple criteria including soil suitability,
yield potential, climate adaptability, pest resistance,
and market demand.

</ThemedText>


</View>







<Pressable

style={styles.button}

onPress={()=>router.back()}

>


<ThemedText style={styles.buttonText}>
Back to Recommendation
</ThemedText>


</Pressable>



</ScrollView>


</ThemedView>

)

}





const styles = StyleSheet.create({


container:{
flex:1,
padding:20
},


subtitle:{
marginVertical:15,
opacity:.7
},


card:{
backgroundColor:"#E8F5E9",
padding:20,
borderRadius:15,
marginBottom:20
},


recommendCard:{
backgroundColor:"#C8E6C9",
padding:25,
borderRadius:15,
marginBottom:20
},


bestRice:{
fontSize:30,
fontWeight:"bold",
marginVertical:10
},


chartContainer:{
marginTop:15
},


barBackground:{
height:25,
backgroundColor:"#ddd",
borderRadius:20,
marginTop:8,
overflow:"hidden"
},


bar:{
height:"100%",
backgroundColor:"#2E7D32",
borderRadius:20
},


button:{
backgroundColor:"#2E7D32",
padding:16,
borderRadius:12,
alignItems:"center",
marginBottom:30
},


buttonText:{
color:"#fff",
fontWeight:"bold"
}



});