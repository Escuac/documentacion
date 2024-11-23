import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import DataProfile from '../components/DataProfile';
import DataMeasurements from '../components/DataMeasurements';
import moment from 'moment-timezone';

interface MeasurementSession {
  id_sesion: number;
  fecha: string;
  mediciones: Record<string, {
    id_medicion: number;
    id_tipo_medicion: number;
    valor: number;
  }>;
}

const MEASUREMENT_ICONS: { [key: string]: React.ReactNode } = {
  'edad': <Ionicons name="person-outline" size={24} color="#2E86C1" />, 
  'altura': <MaterialCommunityIcons name="human-male-height" size={24} color="#2E86C1" />,
  'peso': <FontAwesome5 name="weight" size={24} color="#2E86C1" />,
  'imc': <Ionicons name="fitness-outline" size={24} color="#2E86C1" />,
  'pecho': <Ionicons name="body-outline" size={24} color="#2E86C1" />,
  'biceps': <MaterialCommunityIcons name="arm-flex" size={24} color="#2E86C1" />,
  'cintura': <MaterialCommunityIcons name="tape-measure" size={24} color="#2E86C1" />,
  'gluteos': <Ionicons name="body-outline" size={24} color="#2E86C1" />,
  'muslos': <MaterialCommunityIcons name="arm-flex" size={24} color="#2E86C1" />,
  'pantorrillas': <Ionicons name="walk-outline" size={24} color="#2E86C1" />,
  'cuello': <MaterialCommunityIcons name="human" size={24} color="#2E86C1" />,
  'antebrazo': <MaterialCommunityIcons name="arm-flex" size={24} color="#2E86C1" />,
  'abdomen': <Ionicons name="body-outline" size={24} color="#2E86C1" />,
};

const MEASUREMENT_UNITS: { [key: string]: string } = {
  'edad': 'años',
  'altura': 'cm',
  'peso': 'kg',
  'imc': '',
  'pecho': 'cm',
  'biceps': 'cm',
  'cintura': 'cm',
  'gluteos': 'cm',
  'muslos': 'cm',
  'pantorrillas': 'cm',
  'cuello': 'cm',
  'antebrazo': 'cm',
  'abdomen': 'cm',
  'hombros': 'cm',
};


const MEASUREMENT_KEYS = [
  'peso', 
  'abdomen', 
  'pecho', 
  'biceps', 
  'hombros', 
  'gluteos', 
  'cintura', 
  'muslos', 
  'pantorrillas', 
  'cuello', 
  'antebrazo'
];

export default function MeasurementsScreen() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null); 
  const [measurementData, setMeasurementData] = useState<MeasurementSession[] | null>(null);
  const [loading, setLoading] = useState(true);

  const toggleExpand = (itemId: string) => {
    setSelectedItem(selectedItem === itemId ? null : itemId);
  };

  const handleDataFetched = (data: MeasurementSession[] | null) => {
    setMeasurementData(data);
    setLoading(false);
  };

  const renderMeasurement = ({ item }: { item: { tipo: string; registros: { fecha: string; valor: number }[] } }) => (
    <View>
      <Pressable onPress={() => toggleExpand(item.tipo)} style={styles.measurementItem}>
        <View style={styles.iconContainer}>
          {MEASUREMENT_ICONS[item.tipo.toLowerCase()] || <Ionicons name="analytics-outline" size={24} color="#2E86C1" />}
        </View>
        <View style={styles.measurementInfo}>
          <Text style={styles.measurementType}>{item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}</Text>
          <Text style={styles.measurementValue}>
            {item.registros[0].valor} {MEASUREMENT_UNITS[item.tipo.toLowerCase()]}
          </Text>
        </View>
      </Pressable>
  
      {selectedItem === item.tipo && item.registros.length > 0 && (
        <View style={styles.logContainer}>
          <Text style={styles.detailTitle}>Detalle de {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}</Text>
          {item.registros.map((registro, index) => (
            <View key={`${item.tipo}-${index}`} style={styles.logRow}>
              <Text style={styles.logText}>Fecha de Medición: {moment(registro.fecha).format('DD-MM-YYYY')}</Text>
              <Text style={styles.logText}>Medida: {registro.valor} {MEASUREMENT_UNITS[item.tipo.toLowerCase()]}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
  
  const transformedData = measurementData ? Object.entries(measurementData.reduce((acc, session) => {
    Object.entries(session.mediciones).forEach(([key, value]) => {
      if (MEASUREMENT_KEYS.includes(key)) {
        if (!acc[key]) {
          acc[key] = { tipo: key, registros: [] };
        }
        acc[key].registros.push({ fecha: session.fecha, valor: value.valor });
      }
    });
    return acc;
  }, {} as Record<string, { tipo: string; registros: { fecha: string; valor: number }[] }>))
  .sort((a, b) => MEASUREMENT_KEYS.indexOf(a[0]) - MEASUREMENT_KEYS.indexOf(b[0]))
  .map(([key, value]) => value) : [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCFCFF" />

      <DataProfile onDataFetched={(data) => {
        if (data) {
          setUserName(`${data.nombres} ${data.apellidos}`);
        }
      }} />

      <DataMeasurements onDataFetched={handleDataFetched} />

      <Text style={styles.userName}>{userName ? userName : 'Cargando...'}</Text>

      <Text style={styles.title}>Medidas</Text>

      {loading ? (
        <Text>Cargando...</Text>
      ) : transformedData.length > 0 ? (
        <FlatList
          data={transformedData}
          keyExtractor={(item) => item.tipo}
          renderItem={renderMeasurement}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <Text>No se encontraron mediciones para mostrar.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#02112b',
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  measurementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderColor: '#cfd4d8',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
  iconContainer: {
    marginRight: 20,
  },
  measurementInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  measurementType: {
    fontSize: 18,
    color: '#02112b',
  },
  measurementValue: {
    fontSize: 18,
    color: '#333333',
  },
  logContainer: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
  },
  logRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdc',
  },
  logText: {
    fontSize: 16,
    color: '#333333',
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  listContent: {
    paddingBottom: 20,
  },
});
