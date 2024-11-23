import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PaymentsScreen from "../screens/PaymentsScreen";
import ContactScreen from "../screens/ContactScreen";
import AdsScreen from "../screens/AdsScreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import MeasurementsScreen from "../screens/MeasurementsScreen";
import pruebas from "../screens/pruebas";

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      

      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Prueba" component={pruebas} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "",
          headerStyle: {
            backgroundColor: "#2c3e50",
          },
          headerTintColor: "#FCFCFF", 

        }}
      />
      <Stack.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{
          title: "Pagos",
          headerStyle: {
            backgroundColor: "#2c3e50",
          },
          headerTintColor: "#FCFCFF", 
          headerTitleStyle: {
            fontSize: 20, 
          },
        }}
      />
      <Stack.Screen
        name="Contact"
        component={ContactScreen}
        options={{
          title: "Contacto",
          headerStyle: {
            backgroundColor: "#2c3e50",
          },
          headerTintColor: "#FCFCFF", 
          headerTitleStyle: {
            fontSize: 20, 
          },
        }}
      />
      <Stack.Screen
        name="Ads"
        component={AdsScreen}
        options={{
          title: "Anuncios",
          headerStyle: {
            backgroundColor: "#2c3e50",
          },
          headerTintColor: "#FCFCFF", 
          headerTitleStyle: {

            fontSize: 20, 
          },
        }}
      />
      <Stack.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          title: "Horarios",
          headerStyle: {
            backgroundColor: "#2c3e50",
          },
          headerTintColor: "#FCFCFF",
          headerTitleStyle: {
            fontSize: 20, 
          },
        }}
      />
      <Stack.Screen
        name="Measurements"
        component={MeasurementsScreen}
        options={{
          title: "Mediciones",
          headerStyle: {
            backgroundColor: "#2c3e50",
          },
          headerTintColor: "#FCFCFF", 
          headerTitleStyle: {
            fontSize: 20, 
          },
        }}
      />
    </Stack.Navigator>
  );
}
