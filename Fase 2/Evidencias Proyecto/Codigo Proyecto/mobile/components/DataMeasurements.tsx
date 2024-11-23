import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import axios from "axios";
import { getUserId, getAuthToken } from "../constants/User";
import { API_BASE_URL } from "../constants/ApiConfig";

interface Measurement {
  id_sesion: number;
  fecha: string;
  mediciones: Record<string, {
    id_medicion: number;
    id_tipo_medicion: number;
    valor: number;
  }>;
}

const DataMeasurements = ({
  onDataFetched,
}: {
  onDataFetched: (data: Measurement[] | null) => void;
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeasurementData = async () => {
      try {
        const userId = await getUserId();
        if (!userId) {
          Alert.alert("Error", "No se encontró el ID del usuario.");
          return;
        }

        const authToken = await getAuthToken();
        if (!authToken) {
          Alert.alert("Error", "No se encontró el token de autenticación.");
          return;
        }

        const response = await axios.get<Measurement[]>(
          `${API_BASE_URL}/users/${userId}/measurements`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (Array.isArray(response.data)) {
          onDataFetched(response.data);
        } else {
          Alert.alert(
            "Error",
            "No se encontraron mediciones para el usuario en la respuesta del servidor."
          );
          onDataFetched(null);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los datos de mediciones:", error);
        Alert.alert("Error", "No se pudo obtener la información de las mediciones.");
        setLoading(false);
        onDataFetched(null);
      }
    };

    fetchMeasurementData();
  }, [onDataFetched]);

  return null;
};

export default DataMeasurements;
