import { useState, useEffect, useContext } from "react";
import { MdDelete } from "react-icons/md";
import { FaCirclePlus } from "react-icons/fa6";
import { PageTitle, SearchBar } from "@/components"
import { Button } from "@/components/shadcn/button";
import { ModalContext } from "@/context";
import { searchUsers, getAllUserMeasurements, deleteUserMeasurementSession } from "@api/alumnosApi";
import { getAllMeasurements } from "@api/medicionesApi";
import { useFetch3, useSearch, toast } from "@/hooks";
import { formatDate } from "@/lib/utils"
import { FORM_MODES } from "@/constants";
import { MeasurementsForm } from "@/features/mediciones/components/MeasurementsForm";

export const MedicionesPage = () => {

  return (
    <div className="w-[90%] mx-auto xl:w-[85%] mb-7 max-w-[1000px]">
      <PageTitle
        title={"Mediciones"}
        subtitule={"Consulta fácilmente el progreso físico de tus alumnos."}
        className="mb-16"
      />
      <UserMeasurementSection />
      <LastMeasurementsTable />

    </div>
  );
}

const UserMeasurementSection = () => {
  const { showModal } = useContext(ModalContext);
  const [currentUser, setCurrentUser] = useState(null);
  const {
    data: userMeasurementsData,
    error: userMeasurementsError,
    fetchData: fetchUserMeasurements,
    isLoading: isUserMeasurementsLoading,
    restartFetch: restartUserMeasurements,
    fetchWithoutState
  } = useFetch3();
  const { setQuery, query, results, error, isLoading, onSearchChange, onReset } = useSearch('', {
    endpoint: searchUsers,
    limit: 10,
    page: 1
  });

  const handleOnUserResultClick = (user) => {
    setCurrentUser(user);

    fetchUserMeasurements(getAllUserMeasurements, { id_usuario: user.id_usuario });
  }

  const handleNewMeasurementClick = () => {
    if (!currentUser) {
      showModal(<MeasurementsForm />)
      return;
    }

    const userData = {
      id_usuario: currentUser.id_usuario,
      nombre_completo: `${currentUser.nombres} ${currentUser.apellidos}`,
      fecha_nacimiento: formatDate(currentUser.fecha_nacimiento, 'long'),
      genero: currentUser.genero
    }

    showModal(<MeasurementsForm currentUser={userData} />, {
      fn: () => {
        fetchUserMeasurements(getAllUserMeasurements, { id_usuario: currentUser.id_usuario });
      }
    })
  }

  const handleOnMeasurementClick = (session) => {
    openUserMeasurementsForm(session, showModal, () => {
      fetchUserMeasurements(getAllUserMeasurements, { id_usuario: currentUser.id_usuario });
    });
  }

  const handleOnReset = () => {
    setCurrentUser(null);
    onReset();
    restartUserMeasurements();
  }

  const handleOnDeleteMeasurement = async (e, id_sesion) => {
    e.stopPropagation();
    const dialogResponse = window.confirm('¿Estás seguro de eliminar esta medición? Esta acción no se puede deshacer.');
    
    if (dialogResponse) {
      const response = await fetchWithoutState(deleteUserMeasurementSession, { id_sesion});
      if (response.ok){
        fetchUserMeasurements(getAllUserMeasurements, { id_usuario: currentUser.id_usuario });
      }
    }
  }

  return (
    <>
      <h2 className="text-2xl mt-10 mb-2">Buscar Mediciones Alumno</h2>
      <div className="flex gap-3 lg:w-[60%]">
        <SearchBar
          className="h-10"
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
                  onResultClick={() => handleOnUserResultClick(result)}
                />
              ))
            ) : <p className="my-1 ml-2">No se encontraron resultados</p>}

        </SearchBar>
        <Button
          type="button"
          className="h-10"
          onClick={handleNewMeasurementClick}
        >
          <FaCirclePlus className="mr-2 h-4 w-4" /> Medición
        </Button>
      </div>
      {
        !currentUser ?
          <p className="my-3 font-bold">No has seleccionado ningún alumno</p> :
          <p className="px-2 my-3">Mostrando Mediciones de: <span className="font-bold">{`${currentUser.nombres} ${currentUser.apellidos}`}</span></p>
      }
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Peso
              <span className="text-sm font-normal text-muted-foreground"> kg</span>
            </th>
            <th>IMC</th>
            <th>% Grasa</th>
            <th className='hidden lg:table-cell leading-none'>Abdomen
              <span className="text-sm font-normal text-muted-foreground"> cm</span>
            </th>
            <th className='hidden lg:table-cell leading-none'>Pecho
              <span className="text-sm font-normal text-muted-foreground"> cm</span>
            </th>
            <th className='hidden lg:table-cell leading-none'>Biceps
              <span className="text-sm font-normal text-muted-foreground"> cm</span>
            </th>
            <th className='hidden lg:table-cell leading-none'>Hombros
              <span className="text-sm font-normal text-muted-foreground"> cm</span>
            </th>
            <th className='hidden lg:table-cell leading-none'>Gluteos
              <span className="text-sm font-normal text-muted-foreground"> cm</span>
            </th>
            <th className='hidden lg:table-cell leading-none'>Cintura
              <span className="text-sm font-normal text-muted-foreground"> cm</span>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {
            Array.isArray(userMeasurementsData) && userMeasurementsData.map((session) => {
              return (
                <tr
                  key={session.id_sesion}
                  className="cursor-pointer"
                  onClick={() => handleOnMeasurementClick(session)}
                >
                  <td>{formatDate(session.fecha)}</td>
                  <td>{session.mediciones.peso?.valor || '-'}</td>
                  <td>{session.mediciones.imc?.valor || '-'}</td>
                  <td>{session.mediciones.porcentaje_grasa?.valor || '-'}</td>
                  <td className='hidden lg:table-cell'>{session.mediciones.abdomen?.valor || '-'}</td>
                  <td className='hidden lg:table-cell'>{session.mediciones.pecho?.valor || '-'}</td>
                  <td className='hidden lg:table-cell'>{session.mediciones.biceps?.valor || '-'}</td>
                  <td className='hidden lg:table-cell'>{session.mediciones.hombros?.valor || '-'}</td>
                  <td className='hidden lg:table-cell'>{session.mediciones.gluteos?.valor || '-'}</td>
                  <td className='hidden lg:table-cell'>{session.mediciones.cintura?.valor || '-'}</td>
                  <td className="w-[30px]">
                    <Button
                      onClick={(e) => handleOnDeleteMeasurement(e, session.id_sesion)}
                      variant="destructive"
                      className="w-6 h-6 p-0">
                      <MdDelete className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              )
            })
          }{
            isUserMeasurementsLoading && (
              <tr>
                <td colSpan="10">Cargando Resultados...</td>
              </tr>
            )
          }          {
            !isUserMeasurementsLoading && userMeasurementsData?.length === 0 && (
              <tr>
                <td colSpan="10" className="text-center text-lg py-5">No hay mediciones asociadas</td>
              </tr>
            )
          }
          {
            !currentUser && (
              <tr>
                <td colSpan="10" className="text-center text-lg py-5">Selecciona un alumno para ver sus mediciones</td>
              </tr>
            )
          }
        </tbody>
      </table>
    </>
  );
}


const LastMeasurementsTable = () => {
  const { showModal } = useContext(ModalContext);
  const { data, error, fetchData, isLoading, fetchWithoutState } = useFetch3();
  const [userMeasurements, setUserMeasurements] = useState([]);

  useEffect(() => {
    fetchData(getAllMeasurements, {}, (data) => {
      setUserMeasurements(data);
    });
  }, []);

  const handleOnResultClick = (session) => {
    openUserMeasurementsForm(session, showModal, () => {
      fetchData(getAllMeasurements, {}, (data) => {
        setUserMeasurements(data);
      });
    })
  }

  const handleOnDeleteMeasurement = async (e, id_sesion) => {
    e.stopPropagation();
    const dialogResponse = window.confirm('¿Estás seguro de eliminar esta medición? Esta acción no se puede deshacer.');

    if (dialogResponse) {
      const response = await fetchWithoutState(deleteUserMeasurementSession, { id_sesion });
      if (response.ok) {
        toast({
          title: "Se ha eliminado con éxito.",
          description: "La medición se ha eliminado correctamente.",
        });
        fetchData(getAllMeasurements, {}, (data) => {
          setUserMeasurements(data);
        });
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
      <h2 className="text-2xl mt-10 mb-2">Últimas Mediciones</h2>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Nombre Completo</th>
            <th>Edad</th>
            <th>Peso
              <span className="text-sm font-normal text-muted-foreground"> kg</span>
            </th>
            <th>IMC</th>
            <th>% Grasa</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {
            Array.isArray(userMeasurements) && userMeasurements.slice(0,11).map((session) => {
              return (
                <tr
                  key={session.id_sesion}
                  className="cursor-pointer"
                  onClick={() => handleOnResultClick(session)}
                >
                  <td>{session.fecha}</td>
                  <td>{session.nombre_completo}</td>
                  <td>{session.mediciones.edad?.valor || '-'}</td>
                  <td>{session.mediciones.peso?.valor || '-'}</td>
                  <td>{session.mediciones.imc?.valor || '-'}</td>
                  <td>{session.mediciones.porcentaje_grasa?.valor || '-'}</td>
                  <td className="w-[30px]">
                    <Button
                      variant="destructive"
                      className="w-6 h-6 p-0"
                      onClick={(e) => handleOnDeleteMeasurement(e, session.id_sesion)}
                    >
                      <MdDelete className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              )
            })
          }
          {
            isLoading && (
              <tr>
                <td colSpan="7">Cargando Resultados...</td>
              </tr>
            )
          }
        </tbody>
      </table>
    </>
  )
}


const openUserMeasurementsForm = (session, showModal, onExitModal) => {
  // se estructura el objecto de tal forma que el modal lo reciba correctamente
  const defaultValues = {
    id_usuario: session.id_usuario,
    id_sesion: session.id_sesion,
    fecha: formatDate(session.fecha, 'long'),
    nombre_completo: session.nombre_completo,
    edad: { ...session.mediciones.edad },
    genero: { ...session.mediciones.genero },
    altura: { ...session.mediciones.altura },
    peso: { ...session.mediciones.peso },
    imc: { ...session.mediciones.imc },
    p_bicipital: { ...session.mediciones.p_bicipital },
    p_suprailiaco: { ...session.mediciones.p_suprailiaco },
    p_subescapular: { ...session.mediciones.p_subescapular },
    p_tricipital: { ...session.mediciones.p_tricipital },
    porcentaje_grasa: { ...session.mediciones.porcentaje_grasa },
    mediciones: []
  }
  // se borran los valores que ya asignamos y estan fuera del arrego mediciones
  const toDelete = ['edad', 'genero', 'altura', 'peso', 'imc', 'p_bicipital', 'p_suprailiaco', 'p_subescapular', 'p_tricipital', 'porcentaje_grasa'];
  const sessionMeasurements = { ...session.mediciones }
  toDelete.forEach(key => delete sessionMeasurements[key]);

  // agregamos los elementos que quedan despues de la limpieza al arreglo de mediciones de defaultValues
  for (const medicion in sessionMeasurements) {
    defaultValues.mediciones.push({
      id_medicion: sessionMeasurements[medicion].id_medicion,
      id_tipo_medicion: sessionMeasurements[medicion].id_tipo_medicion,
      valor: sessionMeasurements[medicion].valor,
      nota: sessionMeasurements[medicion].nota
    })
  }

  showModal(<MeasurementsForm mode={FORM_MODES.EDIT} initialValues={defaultValues} />, {
    fn: onExitModal
  }, 'max-w-[700px]')
}