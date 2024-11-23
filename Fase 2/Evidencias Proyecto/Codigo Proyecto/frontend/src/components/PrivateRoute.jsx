import { useContext, useEffect } from "react";
import { AuthContext } from '../app/App';
import { Navigate } from "react-router-dom";
import { BASE_API_URL } from '@/constants'
export const PrivateRoute = ({ children }) => {
  const contextData = useContext(AuthContext);
  const [isAuthenticated, setIsAuthenticated] = contextData.auth;

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch(`${BASE_API_URL}/auth/check`, {
          method: 'GET',
          credentials: 'include',
        });
    
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
};

