import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, AppState, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment-timezone';
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/types";
import DataProfile from "../components/DataProfile";
import DataPay from "../components/DataPay";

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, "Profile">;
type Props = {
  navigation: ProfileScreenNavigationProp;
};

export default function ProfileScreen({ navigation }: Props) {
  const [qrValue, setQrValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [qrVisible, setQrVisible] = useState(false);
  const [token, setToken] = useState('');
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [userData, setUserData] = useState<{ correo: string, direccion: string, run: string, nombres: string, apellidos: string, activo: number, numero?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isMembershipActive, setIsMembershipActive] = useState(false);

  const generateRandomToken = () => {
    const randomValue = Math.random().toString(36).substring(2, 15);
    const createdAt = moment().tz("America/Santiago").format();
    return { token: randomValue, createdAt };
  };

  const generateQRCode = () => {
    const { token, createdAt } = generateRandomToken();
    setToken(token);

    const qrData = {
      token,
      createdAt,
      generatedBy: userData ? `${userData.nombres} ${userData.apellidos}` : 'Usuario',
    };

    setQrValue(JSON.stringify(qrData));
    setQrVisible(true);
    setTimeLeft(60);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let lastTime: number = Date.now();

    if (qrVisible && timeLeft > 0) {
      interval = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        setTimeLeft((prevTime) => Math.max(prevTime - elapsed, 0));
      }, 1000);
    }

    if (timeLeft === 0) {
      setQrVisible(false);
      setToken('');
    }

    return () => clearInterval(interval);
  }, [qrVisible, timeLeft]);

  const handlePaymentsFetched = (payments: any) => {
    // Verifica si hay algún pago con estado 1 (activo)
    const isActive = payments.some((payment: any) => payment.estado === 1);
    setIsMembershipActive(isActive);
  };

  const handleDataFetched = (data: any) => {
    setUserData(data);
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <DataProfile onDataFetched={handleDataFetched} />
      <DataPay onDataFetched={handlePaymentsFetched} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E86C1" />
          <Text>Cargando información del usuario...</Text>
        </View>
      ) : (
        <View style={styles.headerContainer}>
          <View style={[styles.avatar, { backgroundColor: userData ? '#ccc' : '#f0f0f0' }]} />
          <View style={styles.userInfo}>
            <Text style={styles.name}>
              {userData ? `${userData.nombres} ${userData.apellidos}` : 'Cargando...'}
            </Text>
            <Text style={styles.phone}>
              {userData && userData.numero ? `Teléfono: ${userData.numero}` : 'Sin número de teléfono registrado'}
            </Text>
            {userData && (
              <View style={styles.membershipContainer}>
                <Text style={styles.membershipText}>
                  Membresía: {isMembershipActive ? 'Activa' : 'Inactiva'}
                </Text>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: isMembershipActive ? 'green' : 'red' },
                  ]}
                />
              </View>
            )}
          </View>
          <Pressable style={styles.editButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="eye-outline" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Ver</Text>
          </Pressable>
        </View>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Información del Perfil</Text>
            {userData ? (
              <>
                <View style={styles.modalRow}>
                  <Ionicons name="person-outline" size={20} color="#2E86C1" />
                  <Text style={styles.modalText}>Nombre: {userData.nombres} {userData.apellidos}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Ionicons name="call-outline" size={20} color="#2E86C1" />
                  <Text style={styles.modalText}>Teléfono: {userData.numero || 'No registrado'}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Ionicons name="body-outline" size={20} color="#2E86C1" />
                  <Text style={styles.modalText}>Membresía: {isMembershipActive ? 'Activa' : 'Inactiva'}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Ionicons name="document-text-outline" size={20} color="#2E86C1" />
                  <Text style={styles.modalText}>RUT: {userData.run || 'No registrado'}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Ionicons name="home-outline" size={20} color="#2E86C1" />
                  <Text style={styles.modalText}>Dirección: {userData.direccion || 'No registrado'}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Ionicons name="mail-outline" size={20} color="#2E86C1" />
                  <Text style={styles.modalText}>Correo: {userData.correo || 'No registrado'}</Text>
                </View>
              </>
            ) : (
              <Text>Cargando información...</Text>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {isMembershipActive ? (
        <View style={styles.qrContainer}>
          {qrVisible && typeof qrValue === "string" && qrValue ? (
            <>
              <QRCode value={qrValue} size={200} />
              <Text style={styles.timerText}>Código expira en: {Math.floor(timeLeft)} segundos</Text>
            </>
          ) : (
            <Pressable style={styles.activateButton} onPress={generateQRCode}>
              <Text style={styles.activateButtonText}>Generar QR de acceso</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <Text style={styles.noAccessText}>
          {userData ? 'No tienes un plan activo.' : 'Cargando...'}
        </Text>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>

        <Pressable style={styles.sectionItem} onPress={() => navigation.navigate('Payments')}>
          <Ionicons name="card-outline" size={24} color='#2E86C1' />
          <Text style={styles.sectionItemText}>Pagos</Text>
        </Pressable>

        <Pressable style={styles.sectionItem} onPress={() => navigation.navigate('Measurements')}>
          <Ionicons name="fitness-outline" size={24} color='#2E86C1' />
          <Text style={styles.sectionItemText}>Mediciones</Text>
        </Pressable>

        <Pressable style={styles.sectionItem} onPress={() => navigation.navigate('Ads')}>
          <Ionicons name="megaphone-outline" size={24} color='#2E86C1' />
          <Text style={styles.sectionItemText}>Anuncios</Text>
        </Pressable>

        <Pressable style={styles.sectionItem} onPress={() => navigation.navigate('Schedule')}>
          <Ionicons name="calendar-outline" size={24} color='#2E86C1' />
          <Text style={styles.sectionItemText}>Horarios</Text>
        </Pressable>

        <Pressable style={styles.sectionItem} onPress={() => navigation.navigate('Contact')}>
          <Ionicons name="call-outline" size={24} color='#2E86C1' />
          <Text style={styles.sectionItemText}>Contacto</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  phone: {
    fontSize: 14,
    color: '#777',
  },
  membershipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  membershipText: {
    fontSize: 14,
    color: '#777',
    marginRight: 10,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  qrContainer: {
    marginTop: 40,
    alignItems: 'center',
    marginVertical: 20,
  },
  timerText: {
    marginTop: 10,
    fontSize: 14,
    color: '#333',
  },
  noAccessText: {
    textAlign: 'center',
    color: 'red',
    marginVertical: 20,
  },
  activateButton: {
    backgroundColor: '#2c3e50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  activateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionItemText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 350,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E86C1',
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  closeButton: {
    backgroundColor: '#2c3e50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
