import React, { useEffect } from "react";
import { Alert } from "react-native";
import axios from "axios";
import { getUserId, getAuthToken } from "../constants/User";
import { API_BASE_URL } from "../constants/ApiConfig";

export interface Payment { 
  id_pago: number;
  nombre_plan: string;
  monto_pagado: number;
  metodo_pago: number;
  created_at: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  estado: number;
}

const DataPay = ({
  onDataFetched,
}: {
  onDataFetched: (data: Payment[] | null) => void;
}) => {
  useEffect(() => {
    const fetchPaymentData = async () => {
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

        const response = await axios.get<Payment[]>(
          `${API_BASE_URL}/users/${userId}/payments`,
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
            "No se encontraron pagos para el usuario en la respuesta del servidor."
          );
          onDataFetched(null);
        }
      } catch (error) {
        console.error("Error al obtener los datos de pagos:", error);
        Alert.alert("Error", "No se pudo obtener la información de los pagos.");
        onDataFetched(null);
      }
    };

    fetchPaymentData();
  }, [onDataFetched]);

  return null;
};

export default DataPay;
