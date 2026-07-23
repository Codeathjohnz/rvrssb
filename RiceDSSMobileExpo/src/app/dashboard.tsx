import React from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
} from "react-native";

import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";


export default function Dashboard(){

  const router = useRouter();


  return (

    <ThemedView style={styles.container}>

      <ScrollView>


        {/* Header */}
        <View style={styles.header}>

          <ThemedText type="title">
            🌾 RVRSSB Dashboard
          </ThemedText>

          <ThemedText style={styles.subtitle}>
            Rice Variety Recommendation and Support System
          </ThemedText>

        </View>



        {/* Welcome Card */}
        <View style={styles.card}>

          <ThemedText type="subtitle">
            Welcome Farmer 👋
          </ThemedText>


          <ThemedText>
            Get smart recommendations for the best rice variety based on your farm conditions.
          </ThemedText>

        </View>



        {/* Features */}

        <View style={styles.grid}>


          <Pressable
            style={styles.featureCard}
            onPress={() => router.push("/recommendation")}
          >

            <ThemedText style={styles.icon}>
              🌱
            </ThemedText>

            <ThemedText>
              Rice Recommendation
            </ThemedText>

          </Pressable>




          <Pressable
            style={styles.featureCard}
            onPress={() => router.push("/analysis")}
          >

            <ThemedText style={styles.icon}>
              📊
            </ThemedText>

            <ThemedText>
              ELECTRE Analysis
            </ThemedText>

          </Pressable>




          <Pressable
            style={styles.featureCard}
            onPress={() => router.push("/recommendation")}
          >

            <ThemedText style={styles.icon}>
              🌾
            </ThemedText>

            <ThemedText>
              Farm Data
            </ThemedText>

          </Pressable>




          <Pressable
            style={styles.featureCard}
            onPress={() => router.push("/map")}
          >

            <ThemedText style={styles.icon}>
              📍
            </ThemedText>

            <ThemedText>
              Farm Location
            </ThemedText>

          </Pressable>


        </View>



        {/* Recent Recommendation */}

        <View style={styles.card}>

          <ThemedText type="subtitle">
            Recent Recommendation
          </ThemedText>


          <ThemedText>
            No recommendation yet.
          </ThemedText>


          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push("/recommendation")}
          >

            <ThemedText style={styles.buttonText}>
              Start Analysis
            </ThemedText>

          </Pressable>


        </View>




        {/* Logout */}

        <Pressable
          style={styles.logout}
          onPress={() => router.replace("/")}
        >

          <ThemedText style={styles.logoutText}>
            Logout
          </ThemedText>

        </Pressable>



      </ScrollView>

    </ThemedView>

  );

}



const styles = StyleSheet.create({

container:{
  flex:1,
  padding:20,
},


header:{
  marginBottom:25,
},


subtitle:{
  marginTop:10,
  opacity:0.7,
},


card:{
  backgroundColor:"#E8F5E9",
  padding:20,
  borderRadius:15,
  marginBottom:20,
  gap:10,
},


grid:{
  flexDirection:"row",
  flexWrap:"wrap",
  justifyContent:"space-between",
},


featureCard:{
  width:"48%",
  backgroundColor:"#FFFFFF",
  padding:20,
  borderRadius:15,
  marginBottom:15,
  alignItems:"center",
  elevation:3,
},


icon:{
  fontSize:35,
  marginBottom:10,
},


primaryButton:{
  backgroundColor:"#2E7D32",
  padding:15,
  borderRadius:10,
  alignItems:"center",
  marginTop:15,
},


buttonText:{
  color:"#FFFFFF",
  fontWeight:"bold",
},


logout:{
  borderWidth:1,
  borderColor:"#D32F2F",
  padding:15,
  borderRadius:10,
  alignItems:"center",
  marginBottom:30,
},


logoutText:{
  color:"#D32F2F",
  fontWeight:"bold",
},


});