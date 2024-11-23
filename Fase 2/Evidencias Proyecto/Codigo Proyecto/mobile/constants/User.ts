  import * as SecureStore from 'expo-secure-store';  

  let userId: string | null = null;
  
  export const setUserId = (id: string) => {
    userId = id;
  };
  
  // Funcon para obtener el id_usuario 
  export const getUserId = () => {
    return userId;
  };
  
  // Funcio para guardar el token JWT 
  export const setAuthToken = async (token: string) => {
    try {
      await SecureStore.setItemAsync('authToken', token);
    } catch (error) {
      console.error("Error al guardar el token en SecureStore:", error);
    }
  };
  
  // Funcion para obtener el token JWT 
  export const getAuthToken = async () => {
    try {
        const token = await SecureStore.getItemAsync('authToken');
        return token;
    } catch (error) {
        console.error("Error al obtener el token desde SecureStore:", error);
        return null;
    }
};

  
  // Funcion para eliminar el token JWT
  export const removeAuthToken = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
    } catch (error) {
      console.error("Error al eliminar el token de SecureStore:", error);
    }
  };
  