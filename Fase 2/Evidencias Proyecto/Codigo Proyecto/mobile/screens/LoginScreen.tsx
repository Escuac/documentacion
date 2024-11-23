import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Text,
  Linking,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Keyboard,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/types";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { setUserId } from '../constants/User'; 
import axios from 'axios'; 
import { API_BASE_URL } from '../constants/ApiConfig';

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

export default function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const usernameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const isFocused = useIsFocused();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = response.data;

      if (response.status === 200) {
        await SecureStore.setItemAsync('authToken', data.token);

        setUserId(data.id_usuario);

        navigation.navigate("Profile");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
 
          if (error.response.status === 404) {
            Alert.alert("Error", "Usuario o contraseña incorrectos. Inténtelo nuevamente.");
          } else if (error.response.status === 401) {
            Alert.alert("Error", "Credenciales incorrectas.");
          } else {
            Alert.alert("Error", "Error de autenticación. Por favor, intente nuevamente.");
          }
          setUsername("");
          setPassword("");
          usernameInputRef.current?.blur();  
    
        } else {

          Alert.alert("Error", "Hubo un problema con la autenticación. Por favor, intente nuevamente.");
    
 
          setUsername("");
          setPassword("");
          usernameInputRef.current?.blur();  
        }
      } else {

        Alert.alert("Error", "Hubo un error inesperado. Inténtelo nuevamente.");
    
 
        setUsername("");
        setPassword("");
        usernameInputRef.current?.blur();  
      }
    }
  };

  useEffect(() => {
    if (isFocused) {
      setUsername("");
      setPassword("");
    }
  }, [isFocused]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const openURL = (url: string) => {
    Linking.openURL(url);
  };

  const handleKeyPress = (key: string) => {
    if (key === "Enter") {
      if (username && !password) {
        passwordInputRef.current?.focus();
      } else if (username && password) {
        handleLogin();
        Keyboard.dismiss();
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SafeAreaView style={styles.container}>
            <Image
              source={require("../assets/images/header_png.png")}
              style={styles.topImage}
              resizeMode="cover"
            />
            <View style={styles.logoContainer}>
              <Text style={styles.appName}>ApoloSport</Text>
              <Ionicons name="barbell-outline" size={90} color="black" />
              <Text style={styles.byText}>By Denki_FIt</Text>
            </View>
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={24} color="white" />
                <TextInput
                  ref={usernameInputRef}
                  style={styles.input}
                  placeholder="Usuario"
                  placeholderTextColor="#ccc"
                  value={username}
                  onChangeText={setUsername}
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  blurOnSubmit={false}
                  returnKeyType="next"
                />
              </View>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={24} color="white" />
                <TextInput
                  ref={passwordInputRef}
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor="#ccc"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  onSubmitEditing={() => handleKeyPress("Enter")}
                  returnKeyType="done"
                />
              </View>
              <Pressable
                style={[styles.loginButton, { backgroundColor: username && password ? "#2c3e50" : "#4e5e6e" }]}
                onPress={handleLogin}
                disabled={!username || !password}
              >
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </ScrollView>
        {!isKeyboardVisible && (
          <View style={styles.socialMediaContainer}>
            <Text style={styles.socialText}>Nuestras Redes</Text>
            <View style={styles.socialIcons}>
              <Pressable onPress={() => openURL("https://www.facebook.com/p/Gimnasio-Apolo-Sport-100054291979390/")}
                style={styles.socialIconPressable}>
                <Ionicons name="logo-facebook" size={30} color="black" />
              </Pressable>
              <Pressable onPress={() => openURL("https://www.google.com")}
                style={styles.socialIconPressable}>
                <Ionicons name="logo-whatsapp" size={30} color="black" />
              </Pressable>
              <Pressable onPress={() => openURL("https://www.google.com")}
                style={styles.socialIconPressable}>
                <Ionicons name="logo-instagram" size={30} color="black" />
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  topImage: {
    width: "100%",
    height: 130,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  appName: {
    fontSize: 45,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  formContainer: {
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c3e50",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginVertical: 10,
    width: "80%",
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingLeft: 10,
  },
  loginButton: {
    paddingVertical: 10,
    borderRadius: 25,
    width: "60%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  socialMediaContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#ffffff',
  },
  socialText: {
    fontSize: 16,
    marginBottom: 10,
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  socialIconPressable: {
    marginHorizontal: 10,
  },
  socialIcon: {
    marginHorizontal: 5,
  },
  byText: {
    fontSize: 16,
    marginTop: 10,
  },
});
