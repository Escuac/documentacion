// DataProfile Component
import React, { useEffect } from "react";
import { Alert } from "react-native";
import axios from "axios";
import { getUserId, getAuthToken } from "../constants/User"; // Importamos getAuthToken desde User.ts
import { API_BASE_URL } from "../constants/ApiConfig";

interface User {
  id_usuario: string;
  nombres: string;
  apellidos: string;
  run: string;
  activo: number;
  numero?: string;
  direccion: string;
  correo: string;
}

interface UserDataResponse {
  basic: User;
  telefonos: {
    id_telefono: number;
    id_tipo_telefono: number;
    nombre_contacto: string | null;
    correo: string | null;
    numero: string;
    run: string;
  }[];
}

const DataProfile = ({
  onDataFetched,
}: {
  onDataFetched: (data: User | null) => void;
}) => {
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = getUserId();
        if (!userId) {
          Alert.alert("Error", "No se encontró el ID del usuario.");
          onDataFetched(null);
          return;
        }

        const authToken = await getAuthToken(); // Usamos getAuthToken para obtener el token
        if (!authToken) {
          Alert.alert("Error", "No se encontró el token de autenticación.");
          onDataFetched(null);
          return;
        }

        const response = await axios.get<UserDataResponse>(
          `${API_BASE_URL}/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (response.data) {
          const basicUserData = response.data.basic;

          const phoneNumber =
            response.data.telefonos.length > 0
              ? response.data.telefonos[0].numero
              : undefined;

          const userDataWithPhone: User = {
            ...basicUserData,
            numero: phoneNumber,
          };

          onDataFetched(userDataWithPhone);
        } else {
          Alert.alert(
            "Error",
            "No se encontró la información esperada en la respuesta del servidor."
          );
          onDataFetched(null);
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        Alert.alert("Error", "No se pudo obtener la información del usuario.");
        onDataFetched(null);
      }
    };

    fetchUserData();
  }, [onDataFetched]);

  return null;
};

export default DataProfile;
