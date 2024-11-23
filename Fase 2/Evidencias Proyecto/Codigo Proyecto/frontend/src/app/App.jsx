import { useState, createContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from "@/components/shadcn/toaster"
import { Layout } from '../components/Layout';
import { PrivateRoute } from '../components/PrivateRoute';
import { LoginPage } from '../pages/LoginPage';

import './App.css'
import { useEffect } from 'react';
import { DashboardPage } from '@/pages/DashboardPage';
import { ModalProvider } from '@/context';
import { Modal } from '@/components/Modal';
import { AlumnosPage } from '@/pages/AlumnosPage';
import { PagosPage } from '@/pages/PagosPage';
import { BASE_API_URL } from '@/constants'
import { MedicionesPage } from '@/pages/MedicionesPage';
export const AuthContext = createContext();

function App() {
  //TODO: Separar el contexto de autenticación del componente
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch(`${BASE_API_URL}/auth/check`, {
          method: 'GET',
          credentials: 'include', // para enviar cookies con la solicitud
        });

        const resp = await response.json();
        if (response.ok) {
          setIsAuthenticated(true);
          setLoggedInUser(resp.user);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error(error);
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{auth: [isAuthenticated, setIsAuthenticated], loggedInUser}}>
      <ModalProvider>
      <BrowserRouter>
        <Routes>
          {
            isAuthenticated 
            ?
            //rutas protegidas
            <Route path='/*' element={
              <PrivateRoute>
                <Layout>
                  <Toaster />
                  <Routes>
                    <Route path='/' element={<DashboardPage />} />
                    <Route path='/alumno' element={<AlumnosPage />} />
                    <Route path='/pago' element={<PagosPage />} />
                    <Route path='/medicion' element={<MedicionesPage />} />
                    <Route path='/ingreso' element={<Ingresos />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }/>
            :
            // Si no está autenticado, redirige al login
            <Route path='/*' element={<LoginPage />}/> 
          }
        </Routes>
      </BrowserRouter>
      <Modal/>
      </ModalProvider>
    </AuthContext.Provider>
  )
}

export default App

function Plan() {
  return (
    <h1 className='text-2xl'>Plan</h1>
  )
}

function Ingresos() {
  return (
    <h1 className='text-2xl'>Ingresos</h1>
  )
}
