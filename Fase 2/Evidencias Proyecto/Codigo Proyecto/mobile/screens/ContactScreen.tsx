import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking, StatusBar, Dimensions } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window'); 


const gymLocation = {
  latitude: -33.502684,
  longitude: -70.766266,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function ContactScreen() {
  const handleMapPress = () => {
    const address = encodeURIComponent('Pje. Arq. Eduardo Jedlicki 265, Maipú, Región Metropolitana');
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    Linking.openURL(url);
  };

  const handleWhatsAppPress = () => {
    Linking.openURL('https://wa.me/56951344485');
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:denkifit@correo.com');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCFCFF" />

      <Text style={styles.title}>Servicio al Cliente</Text>


      <Pressable style={styles.button} onPress={handleWhatsAppPress}>
        <FontAwesome name="whatsapp" size={24} color="white" />
        <Text style={styles.buttonText}>WhatsApp</Text>
      </Pressable>


      <Pressable style={styles.button} onPress={handleEmailPress}>
        <FontAwesome name="envelope" size={24} color="white" />
        <Text style={styles.buttonText}>Correo Electrónico</Text>
      </Pressable>


      <View style={styles.addressContainer}>
        <Text style={styles.addressTitle}>Dirección:</Text>
        <Text style={styles.addressText}>Pje. Arq. Eduardo Jedlicki 265, Maipú, Región Metropolitana</Text>
      </View>


      <MapView
        style={styles.map}
        initialRegion={gymLocation} 
        onPress={handleMapPress} 
      >
        <Marker
          coordinate={gymLocation}
          title="DenkiFit"
          description="Pje. Arq. Eduardo Jedlicki 265, Maipú, Región Metropolitana"
        />
      </MapView>

 
      <Pressable onPress={() => Linking.openURL('https://example.com/terminos')}>
        <Text style={styles.link}>Términos y Políticas de Privacidad</Text>
      </Pressable>

      <Text style={styles.socialText}>Nuestras Redes</Text>


      <View style={styles.socialContainer}>
        <Pressable onPress={() => Linking.openURL('https://www.facebook.com/p/Gimnasio-Apolo-Sport-100054291979390/"')}>
          <Ionicons name="logo-facebook" size={30} color="black" />
        </Pressable>

        <Pressable onPress={() => Linking.openURL('https://instagram.com')}>
          <Ionicons name="logo-instagram" size={30} color="black" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#0E181E',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 25,
    marginBottom: 15,
    width: '80%',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
  },
  link: {
    color: '#6c63ff',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '25%',
    marginTop: 20,
  },
  socialText: {
    fontSize: 16,
    marginBottom: 10,
  },
  addressContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  map: {
    width: width * 0.9,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
});
