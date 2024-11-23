import { useState, useEffect, useContext } from "react";
import { getPayments, registerUserAttendance, searchUsers } from "@/api/alumnosApi";
import { FakeSearchBar, SearchBar } from "@/components";
import { useFetch3, useSearch } from "@/hooks";
import { Button } from "@/components/shadcn/button";
import { ModalContext } from "@/context";

const useSearchOptions = {
  endpoint: searchUsers,
  limit: 10,
  page: 1
}

export const AttendanceForm = () => {
  const { hideModal } = useContext(ModalContext);
  const { setQuery, query, results, error, isLoading, onSearchChange } = useSearch('', useSearchOptions);
  const [selectedUser, setSelectedUser] = useState(null);
  const {
    data: activePaymentData,
    error: activePaymentDataError,
    fetchData: fetchActivePaymentData,
    isLoading: activePaymentDataIsLoading,
    restartFetch: restartActivePaymentDataFetch
  } = useFetch3();

  const {
    data: attendanceSaveData,
    error: attendanceSaveError,
    fetchData: fetchAttendanceSaveData,
    isLoading: attendanceSaveIsLoading,
    restartFetch: restartAttendanceSaveFetch
  } = useFetch3();

  const handleOnResultClick = (user) => {
    setSelectedUser(user);
    fetchActivePaymentData(getPayments, { id_usuario: user.id_usuario, active: true });
  }

  const handleOnFormSubmit = async (e) => {
    e.preventDefault();
    fetchAttendanceSaveData(registerUserAttendance, {id_usuario: selectedUser.id_usuario}, () => {
      hideModal();
    });

  };

  return (
    <form
      onSubmit={handleOnFormSubmit}
      className="flex flex-col items-center  w-full px-1 py-4 min-h-[350px]"
    >
      <h2 className="text-[1.7rem] font-semibold mb-5">Registrar Asistencia</h2>
      {
        selectedUser ?
          <FakeSearchBar
            className='mb-4'
            text={`${selectedUser.nombres} ${selectedUser.apellidos}`}
            onClean={() => {
              setSelectedUser(null);
              setQuery('');
              restartActivePaymentDataFetch();
              restartAttendanceSaveFetch();
            }} />
          :
          <SearchBar
            className='mb-4'
            placeholder="Buscar Alumno..."
            onSearchChange={onSearchChange}
            showResultsContainer={true}
            query={query}
            setQuery={setQuery}
            resultContainerHeight="max-h-[200px]"
          >
            {isLoading && <div>Cargando resultados...</div>}
            {error && <div>{error}</div>}
            {
              (!isLoading && !error && results?.users?.length > 0) && (
                results.users.map((result) => (
                  <SearchBar.UserResultItem
                    key={result.id_usuario}
                    idUsuario={result.id_usuario}
                    nombre={`${result.nombres} ${result.apellidos}`}
                    run={result.run}
                    onResultClick={() => handleOnResultClick(result)}
                  />
                ))
              )}
          </SearchBar>
      }
      {activePaymentData && !activePaymentData.activo &&
        <div className='bg-yellow-100 w-full py-3 px-2 lg:px-5 border-yellow-300 border-x-4 rounded-lg mb-4'>
          <h3 className='font-bold text-lg text-yellow-800'>No se puede registrar asistencia</h3>
          <p className='text-yellow-800 text-justify text-[0.9rem]'>
            Alumno no cuenta con membresia activa.</p>
        </div>
      }
      {
        attendanceSaveError && 
        <div className='bg-red-100 w-full py-3 px-2 lg:px-5 border-red-300 border-x-4 rounded-lg mb-4'>
          <h3 className='font-bold text-lg text-red-800'>Error.</h3>
          <p className='text-red-800 text-justify text-[0.9rem]'>
          {attendanceSaveError.message}</p>
        </div>
      }
      <Button
        type="submit"
        className="mt-auto"
        disabled={!selectedUser || (activePaymentData && !activePaymentData.activo) || attendanceSaveIsLoading}
      >
        Registrar
      </Button>
    </form>
  )
}