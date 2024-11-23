import { useState, useEffect, useContext } from "react";
import { MdDelete } from "react-icons/md";
import { FaCirclePlus } from "react-icons/fa6";
import { PageTitle } from "@/components/PageTitle"
import st from "./styles/PagosPage.module.css";
import { Button } from "@/components/shadcn/button";
import { ModalContext } from "@/context";
import { PaymentForm } from "../features/pagos/components/PaymentForm";
import { NewPlan } from "@/features/planes/components/NewPlan";
import { SearchBar } from "@/components";
import { searchUsers, getPayments, deletePayment } from "@api/alumnosApi";
import { getAllPayments } from '@api/pagosApi';
import { getActivePlans, getAllPlans } from '@/api/planesApi';
import { useFetch3, useSearch, toast } from "@/hooks";
import { formatDate } from "@/lib/utils"
import { FORM_MODES, ACCESS_TYPE } from "@/constants";

export const PagosPage = () => {
  // la vida me obligo a poner este fetch aca
  const { data: plansData, fetchData: fetchPlans } = useFetch3();
  return (
    <div className="w-[90%] mx-auto xl:w-[85%] mb-7">
      <PageTitle
        title={"Planes y Pagos"}
        subtitule={"Administra fácilmente los pagos y planes de tus alumnos."}
        className="mb-16"
      />
      <div className={st["main-container"]}>
        <div className={st["pagos-container"]}>
          <LastPaymentsSection />
          <UserPaymentSection />
        </div>
        <div className={st["planes-container"]}>
          <ActivePlansSection fetchPlans={fetchPlans} />
          <AllPlansSection fetchPlans={fetchPlans} plansData={plansData} />
        </div>
      </div>
    </div>
  )
}



const UserPaymentSection = () => {
  const { showModal } = useContext(ModalContext);
  const [currentUser, setCurrentUser] = useState(null);
  const {
    data: userPaymentData,
    error: userPaymentError,
    fetchData: fetchUserPayments,
    isLoading: isUserPaymentsLoading,
    restartFetch: restartUserPayments
  } = useFetch3();

  const { setQuery, query, results, error, isLoading, onSearchChange, onReset } = useSearch('',
    {
      endpoint: searchUsers,
      limit: 10,
      page: 1
    });

  const handleOnResultClick = (id_usuario, nombre_completo) => {

    fetchUserPayments(getPayments, { id_usuario }, (data) => {
      setCurrentUser({ nombre_completo, id_usuario });
    });
  }

  const handleOnPaymentClick = (payment) => {
    showModal(<PaymentForm mode={FORM_MODES.EDIT} initialValues={{
      ...payment,
      fecha_inicio: formatDate(payment.fecha_inicio, 'long'),
      fecha_vencimiento: formatDate(payment.fecha_vencimiento, 'long')
    }} />, {
      fn: () => {
        fetchUserPayments(getPayments, { id_usuario: currentUser.id_usuario });
      }
    });
  }

  const handleOnReset = () => {
    onReset();
    restartUserPayments();
    setCurrentUser(null);
  }

  const handleOnDeletePayment = async (e, id_pago, id_usuario) => {
    e.stopPropagation();

    const dialogResponse = window.confirm('¿Estás seguro de eliminar este pago? Esta acción no se puede deshacer.');

    if (dialogResponse) {
      const response = await deletePayment({ id_pago, id_usuario });
      if (response.ok) {
        toast({
          title: "Se ha eliminado con éxito.",
          description: "El pago se ha eliminado correctamente.",
        });
        fetchUserPayments(getPayments, { id_usuario: currentUser.id_usuario });
      } else {
        toast({
          variant: "destructive",
          title: "Eliminación fallida",
          description: "No fue posible completar la operación.",
        });
      }
    }
  }

  return (
    <>
      <h2 className="text-2xl mt-10 mb-2">Buscar Pagos Alumno</h2>
      <SearchBar
        placeholder="Buscar Alumno..."
        onSearchChange={onSearchChange}
        showResultsContainer={true}
        onReset={handleOnReset}
        query={query}
        setQuery={setQuery}
      >
        {isLoading && <div>Cargando resultados...</div>}
        {error && <div>{error}</div>}
        {
          (!isLoading && !error && results?.users?.length > 0) ? (
            results.users.map((result) => (
              <SearchBar.UserResultItem
                key={result.id_usuario}
                idUsuario={result.id_usuario}
                nombre={`${result.nombres} ${result.apellidos}`}
                run={result.run}
                onResultClick={() => handleOnResultClick(result.id_usuario, `${result.nombres} ${result.apellidos}`)}
              />
            ))
          ) : <p className="my-1 ml-2">No se encontraron resultados</p>}

      </SearchBar>
      {
        !currentUser ?
          <p className="mt-3 font-bold">No has seleccionado ningún alumno</p> :
          <p className="px-2 mt-3">Mostrando pagos de: <span className="font-bold">{currentUser.nombre_completo}</span></p>
      }
      <table className="mt-3">
        <thead>
          <tr>
            <th>Fecha Pago</th>
            <th>Inicio</th>
            <th>Vencimiento</th>
            <th>Plan</th>
            <th>Monto</th>
            <th></th>
          </tr>
        </thead>
        {isUserPaymentsLoading && <tr><td>Cargando resultados...</td></tr>}
        <tbody>
          {
            (!isUserPaymentsLoading && !userPaymentError) && (
              userPaymentData?.length > 0 ? (
                userPaymentData.map((result) => (
                  <tr
                    key={result.id_pago}
                    className={`cursor-pointer hover:bg-accent ${result.estado === 1 ? 'outline-1 outline-dashed outline-primary' : ''}`}
                    onClick={(_) => handleOnPaymentClick(result)}
                  >
                    <td>{formatDate(result.created_at)}</td>
                    <td>{formatDate(result.fecha_inicio)}</td>
                    <td>{formatDate(result.fecha_vencimiento)}</td>
                    <td>{result.nombre_plan}</td>
                    <td>{'$' + result.monto_pagado}</td>
                    <td className="text-center">
                      <div className={st["action-button-container"]}>
                        <button 
                          className={`${st["action-button"]} bg-destructive`}
                          onClick={(e) => handleOnDeletePayment(e, result.id_pago, result.id_usuario)}
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-lg py-5">No hay pagos asociados</td>
                </tr>
              )
            )
          }
        </tbody>
      </table>
    </>
  );
}

const LastPaymentsSection = () => {
  const { showModal } = useContext(ModalContext);
  const {
    data: lastPaymentsData,
    error: lastPaymentsError,
    fetchData: fetchLastPayments,
    isLoading: isLastPaymentsLoading,
    restartFetch: restartLastPayments
  } = useFetch3();

  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetchLastPayments(getAllPayments);
  }, [])

  const handleNewPago = () => {
    showModal(<PaymentForm />, {
      fn: () => fetchLastPayments(getAllPayments)
    });
  }

  const handleOnPaymentClick = (payment) => {
    showModal(<PaymentForm mode={FORM_MODES.EDIT} initialValues={{
      ...payment,
      fecha_inicio: formatDate(payment.fecha_inicio, 'long'),
      fecha_vencimiento: formatDate(payment.fecha_vencimiento, 'long')
    }} />, {
      fn: () => {
        fetchLastPayments(getAllPayments);
      }
    });
  }

  const handleOnDeletePayment = async (e, id_pago, id_usuario) => {
    e.stopPropagation();

    const dialogResponse = window.confirm('¿Estás seguro de eliminar este pago? Esta acción no se puede deshacer.');

    if (dialogResponse) {
      const response = await deletePayment({ id_pago, id_usuario });
      if (response.ok) {
        toast({
          title: "Se ha eliminado con éxito.",
          description: "El pago se ha eliminado correctamente.",
        });
        fetchLastPayments(getAllPayments);
      } else {
        toast({
          variant: "destructive",
          title: "Eliminación fallida",
          description: "No fue posible completar la operación.",
        });
      }
    }
  }

  return (
    <div>
      <div className="flex items-end mb-4 overflow-auto">
        <h2 className="text-2xl">Últimos Pagos</h2>
        <Button
          type="button"
          className="ml-auto"
          onClick={handleNewPago}
        >
          <FaCirclePlus className="mr-2 h-4 w-4" /> Pago
        </Button>
      </div>
      <div className="max-h-[310px] overflow-y-scroll">
        <table>
          <thead>
            <tr>
              <th>Fecha Pago</th>
              <th>Plan</th>
              <th>Monto</th>
              <th className="text-start">Alumno</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {
              isLastPaymentsLoading ? (
                <tr><td colSpan={5}>Cargando resultados...</td></tr>
              ) : Array.isArray(lastPaymentsData) && lastPaymentsData.length > 0 ? (
                lastPaymentsData.slice(0, 7).map((result) => (
                  <tr
                    key={result.id_pago}
                    className="cursor-pointer"
                    onClick={(_) => handleOnPaymentClick(result)}
                  >
                    <td>{formatDate(result.created_at)}</td>
                    <td>{result.nombre_plan}</td>
                    <td>{'$' + result.monto_pagado}</td>
                    <td className="text-start">{result.nombre_completo}</td>
                    <td className="text-center">
                      <div className={st["action-button-container"]}>
                        {/* <button className={`${st["action-button"]} bg-primary`}>
                          <MdEdit />
                        </button> */}
                        <button
                          className={`${st["action-button"]} bg-destructive`}
                          onClick={(e) => handleOnDeletePayment(e, result.id_pago, result.id_usuario)}
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-lg py-5">{
                    Array.isArray(lastPaymentsData) ? "No hay pagos registrados" : "Error al cargar los datos"
                  }</td>
                </tr>
              )
            }
          </tbody>

        </table>
      </div>
    </div>)
}

const ActivePlansSection = ({ fetchPlans }) => {
  const { showModal } = useContext(ModalContext);
  const {
    data: activePlansData,
    error: activePlansError,
    fetchData: fetchActivePlans,
    isLoading: isActivePlansLoading,
    restartFetch: restartActivePlans
  } = useFetch3();

  useEffect(() => {
    fetchActivePlans(getActivePlans);
  }, [])

  const handleNewPlan = () => {
    showModal(<NewPlan />, {
      fn: () => {
        fetchActivePlans(getActivePlans)
        fetchPlans(getAllPlans);
      }
    });
  }

  const handleOnPlanClick = (result) => {
    const data = {
      ...result,
      modalidad_acceso: result.modalidad_acceso.toString()
    }

    showModal(<NewPlan mode={FORM_MODES.EDIT} defaultValues={data} />, {
      fn: () => fetchActivePlans(getActivePlans)
    })
  }

  return (
    <>
      <div className="flex items-end mb-4">
        <h2 className="text-2xl">Planes Activos</h2>
        <Button
          type="button"
          className="ml-auto"
          onClick={handleNewPlan}
        >
          <FaCirclePlus className="mr-2 h-4 w-4" /> Plan
        </Button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Clases Mes</th>
            <th>Valor Base</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {
            isActivePlansLoading ?
              <tr>
                <td colSpan={4}>Cargando resultados...</td>
              </tr>
              :
              (Array.isArray(activePlansData) && activePlansData.length > 0) ? (
                activePlansData.map((result) => (
                  <tr
                    key={result.id_plan}
                    className="cursor-pointer"
                    onClick={(_) => handleOnPlanClick(result)}
                  >
                    <td>{result.nombre}</td>
                    <td>{ACCESS_TYPE[result.modalidad_acceso]}</td>
                    <td>{'$' + result.valor_base}</td>
                    <td className="text-center">
                      <div className={st["action-button-container"]}>
                        <button className={`${st["action-button"]} bg-destructive`}>
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>))
              ) :
                <tr>
                  <td colSpan={4} className="text-center text-lg py-5">{
                    Array.isArray(activePlansData) ? "No hay planes activos en este momento" : "Error al cargar los datos"
                  }</td>
                </tr>
          }
        </tbody>
      </table>
    </>
  )
}

const AllPlansSection = ({ fetchPlans, plansData }) => {
  const { showModal } = useContext(ModalContext);

  useEffect(() => {
    fetchPlans(getAllPlans);
  }, []);

  const handleOnPlanClick = (result) => {
    const data = {
      ...result,
      modalidad_acceso: result.modalidad_acceso.toString()
    }

    showModal(<NewPlan mode={FORM_MODES.EDIT} defaultValues={data} />, {
      fn: () => fetchPlans(getAllPlans)
    })
  }

  return (
    <>
      <h2 className="text-2xl mt-10 mb-3">Todos los Planes</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Clases</th>
            <th>Valor</th>
            <th>Activo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {
            Array.isArray(plansData) && plansData.length > 0 ? (
              plansData.map((result) => (
                <tr
                  key={result.id_plan}
                  className="cursor-pointer"
                  onClick={(_) => handleOnPlanClick(result)}
                >
                  <td>{result.nombre}</td>
                  <td>{ACCESS_TYPE[result.modalidad_acceso]}</td>
                  <td>{'$' + result.valor_base}</td>
                  <td>{result.activo ? 'SI' : 'NO'}</td>
                  <td className="text-center">
                    <div className={st["action-button-container"]}>
                      <button className={`${st["action-button"]} bg-destructive`}>
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-lg py-5">{
                  Array.isArray(plansData) ? "No hay planes registrados" : "Error al cargar los datos"
                }</td>
              </tr>
            )
          }
        </tbody>
      </table>
    </>
  )
}