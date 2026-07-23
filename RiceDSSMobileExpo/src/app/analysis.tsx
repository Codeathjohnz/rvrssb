import React from "react";

import {
  StyleSheet,
  View,
  ScrollView,
  Pressable
} from "react-native";

import {useRouter} from "expo-router";

import {ThemedText} from "@/components/themed-text";
import {ThemedView} from "@/components/themed-view";



export default function Analysis(){


const router = useRouter();



const criteria = [

{
name:"Soil Suitability",
weight:0.30
},

{
name:"Yield Potential",
weight:0.25
},

{
name:"Pest Resistance",
weight:0.20
},

{
name:"Climate Adaptability",
weight:0.15
},

{
name:"Market Demand",
weight:0.10
}

];



const alternatives = [

{
name:"RC 222",
soil:95,
yield:92,
pest:88,
climate:90,
market:85
},


{
name:"RC 402",
soil:90,
yield:88,
pest:95,
climate:85,
market:90
},


{
name:"RC 436",
soil:87,
yield:85,
pest:90,
climate:88,
market:92
},


{
name:"RC 480",
soil:84,
yield:86,
pest:82,
climate:87,
market:88
}


];





return(

<ThemedView style={styles.container}>


<ScrollView>


<ThemedText type="title">
📊 ELECTRE Analysis
</ThemedText>


<ThemedText style={styles.subtitle}>
Multi-Criteria Decision Making Process
</ThemedText>





{/* Criteria Weight */}

<View style={styles.card}>


<ThemedText type="subtitle">
⚖️ Criteria Weight
</ThemedText>



{
criteria.map(item=>(

<View 
key={item.name}
style={styles.row}
>

<ThemedText>
{item.name}
</ThemedText>


<ThemedText>
{item.weight}
</ThemedText>


</View>

))

}



</View>






{/* ELECTRE Steps */}

<View style={styles.card}>


<ThemedText type="subtitle">
⚙️ ELECTRE Process
</ThemedText>



<ThemedText>
1. Construct Decision Matrix
</ThemedText>


<ThemedText>
2. Normalize Criteria Values
</ThemedText>


<ThemedText>
3. Apply Criteria Weights
</ThemedText>


<ThemedText>
4. Generate Concordance Matrix
</ThemedText>


<ThemedText>
5. Generate Discordance Matrix
</ThemedText>


<ThemedText>
6. Determine Final Ranking
</ThemedText>



</View>








{/* Decision Matrix */}


<View style={styles.card}>


<ThemedText type="subtitle">
📋 Decision Matrix
</ThemedText>



{
alternatives.map(item=>(


<View 
key={item.name}
style={styles.matrix}
>


<ThemedText style={styles.variety}>
{item.name}
</ThemedText>


<ThemedText>
Soil: {item.soil}
</ThemedText>


<ThemedText>
Yield: {item.yield}
</ThemedText>


<ThemedText>
Pest: {item.pest}
</ThemedText>


<ThemedText>
Climate: {item.climate}
</ThemedText>


<ThemedText>
Market: {item.market}
</ThemedText>



</View>


))

}



</View>








{/* Result */}

<View style={styles.resultCard}>


<ThemedText type="subtitle">
🏆 Final ELECTRE Ranking
</ThemedText>


<ThemedText>
1. RC 222
</ThemedText>


<ThemedText>
2. RC 402
</ThemedText>


<ThemedText>
3. RC 436
</ThemedText>


</View>








<Pressable
  style={styles.button}
  onPress={() => router.replace("/dashboard")}
>

  <ThemedText style={styles.buttonText}>
    Back Dashboard
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


row:{
flexDirection:"row",
justifyContent:"space-between",
paddingVertical:8
},


matrix:{
backgroundColor:"#FFFFFF",
padding:15,
borderRadius:10,
marginTop:10
},


variety:{
fontWeight:"bold",
fontSize:18
},


resultCard:{
backgroundColor:"#C8E6C9",
padding:20,
borderRadius:15,
marginBottom:20
},


button:{
backgroundColor:"#2E7D32",
padding:15,
borderRadius:12,
alignItems:"center",
marginBottom:30
},


buttonText:{
color:"#fff",
fontWeight:"bold"
}


});