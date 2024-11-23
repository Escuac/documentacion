import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, StatusBar } from 'react-native';
import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
import DataPay, { Payment } from '../components/DataPay';

interface FormattedPayment extends Omit<Payment, 'created_at'> {
  created_at: Date;
}

const paymentMethods: { [key: number]: string } = {
  1: 'Efectivo',
  2: 'Transferencia',
  3: 'Débito',
  4: 'Crédito',
  5: 'Deuda'
};

export default function PaymentsScreen() {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [paymentsData, setPaymentsData] = useState<FormattedPayment[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMembershipActive, setIsMembershipActive] = useState(false);

  const toggleExpand = (itemId: number) => {
    setSelectedItem(selectedItem === itemId ? null : itemId);
  };

  const handleDataFetched = (data: Payment[] | null): void => {
    if (data) {
      const formattedData: FormattedPayment[] = data.map(payment => ({
        ...payment,
        created_at: new Date(payment.created_at) 
      }));
      setPaymentsData(formattedData);


      const isActive = data.some(payment => payment.estado === 1);
      setIsMembershipActive(isActive);
    } else {
      setPaymentsData(null);
      setIsMembershipActive(false); 
    }
    setLoading(false);
  };

  useEffect(() => {

    const interval = setInterval(() => {
      if (paymentsData && paymentsData.length > 0) {
        const isActive = paymentsData.some(payment => payment.estado === 1);
        setIsMembershipActive(isActive);
      } else {
        setIsMembershipActive(false);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [paymentsData]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'America/Santiago', 
    }).format(date);
  };

  const renderPaymentItem = ({ item }: { item: FormattedPayment }) => (
    <>
      <Pressable onPress={() => toggleExpand(item.id_pago)} style={styles.rowPressable}>
        <View style={styles.row}>
          <View style={styles.statusIcon}>
            <AntDesign name="checkcircle" size={16} color="green" />
          </View>
          <Text style={styles.cell}>{formatDate(item.created_at)}</Text>
          <Text style={styles.cell}>{item.nombre_plan}</Text>
          <Text style={styles.cell}>${item.monto_pagado}</Text>
        </View>
      </Pressable>

      {selectedItem === item.id_pago && (
        <View style={styles.cardContainer}>
          <Text style={styles.detailTitle}>Detalle del Pago</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Plan: </Text>
            <Text style={styles.detailText}>{item.nombre_plan}</Text> 
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha de Pago: </Text>
            <Text style={styles.detailText}>{formatDate(item.created_at)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Monto: </Text>
            <Text style={styles.detailText}>${item.monto_pagado}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Método de Pago: </Text>
            <Text style={styles.detailText}>{paymentMethods[item.metodo_pago]}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha de Inicio: </Text>
            <Text style={styles.detailText}>{formatDate(new Date(item.fecha_inicio))}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha de Vencimiento: </Text>
            <Text style={styles.detailText}>{formatDate(new Date(item.fecha_vencimiento))}</Text>
            
          </View>

          <View style={styles.containerButton}> 
            <Pressable style={styles.assistanceButton} >
            <Ionicons name="eye-outline" size={20} color="#d5e2d5" marginLeft={15}/>
            <Text style={styles.detailButtonText}>Ver Asistencia</Text>
            </Pressable>
            </View>
          
        </View>
        
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <DataPay onDataFetched={handleDataFetched} />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Historial de Pagos</Text>
        <View style={styles.membershipStatusContainer}>
          <Text style={styles.membershipStatusText}>
            Membresía: {isMembershipActive ? "Activa  " : "Inactiva  "}
          </Text>
          <FontAwesome
            name="circle"
            size={12}
            color={isMembershipActive ? "green" : "red"}
          />
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.headerCell}>Fecha</Text>
          <Text style={styles.headerCell}>Plan</Text>
          <Text style={styles.headerCell}>Monto</Text>
        </View>
      </View>

      {loading ? (
        <Text>Cargando...</Text>
      ) : paymentsData ? (
        <FlatList
          data={paymentsData}
          keyExtractor={(item) => item.id_pago.toString()}
          renderItem={renderPaymentItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <Text>No se encontraron pagos para mostrar.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    marginBottom: 10,
  },
  detailButtonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
    marginRight: 20,
    
  },
  assistanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    paddingVertical: 6,
    borderRadius: 20,

  },
  containerButton:{
    flex: 1,
    alignItems: 'center', // Alínea el botón a la derecha
    justifyContent: 'center', // Centra verticalmente el botón en la pantalla
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  membershipStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  membershipStatusText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
    marginBottom: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  headerCell: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'center',
  },
  rowPressable: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  cell: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    flex: 1,
  },
  statusIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2c3e50',
  },
  detailText: {
    fontSize: 16,
    marginLeft: 5,
    color: '#333',
  },
  listContent: {
    paddingBottom: 20,
  },
});
