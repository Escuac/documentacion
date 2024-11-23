import { useEffect, useContext, useState } from 'react';
import { Button } from '@/components/shadcn/button';
import { getOneUser, searchUsers } from '@/api/alumnosApi';
import { FORM_MODES } from '@/constants';
import { ModalContext } from '@/context';
import { useSearch, useFetch3 } from '@/hooks';
import { PageTitle } from '@/components/PageTitle';
import { ResultTable, Paginator, RegistroAlumno } from '../features/alumnos/components';
import { SearchBar } from "@components";
import { FaCirclePlus } from 'react-icons/fa6';
import { formatDate } from '@/lib/utils';

const resultsPerPage = 10;

export const AlumnosPage = () => {
  const { showModal } = useContext(ModalContext)
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { query, setQuery, onSearchChange, onReset, results, executeSearch, isLoading }
    = useSearch('', {
      endpoint: searchUsers,
      limit: resultsPerPage,
      page: currentPage,
      searchOnEmptyQuery: true,
      special: {
        lastPayment: true
      }
    });
  const {
    data: userDetails,
    error: userDetailsError,
    fetchData: fetchUserDetails,
    isLoading: isLoadingUserDetails
  } = useFetch3();

  // trae la data al cargar la pagina
  useEffect(() => {
    executeSearch();
  }, [])

  useEffect(() => {
    if (results) {
      setTotalPages(results.totalPages);
      setTableData(results.users);
    }
  }, [results]);

  useEffect(() => {
    executeSearch();
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query])


  const handlePageChange = (page) => {
    setCurrentPage(page);
  }

  const onResultClick = (user_id) => {
    if (isLoadingUserDetails) return;

    fetchUserDetails(getOneUser, { user_id }, (data) => {
      if (data.basic.fecha_nacimiento) {
        data.basic.fecha_nacimiento = formatDate(data.basic.fecha_nacimiento, 'long');
      }
      showModal(
        <RegistroAlumno
          defaultValues={data}
          mode={FORM_MODES.EDIT}
        />, { fn: executeSearch })
    });
  }

  const handleOpenAddUserModal = () => {
    showModal(<RegistroAlumno />, {
      fn: executeSearch
    });
  }

  return (
    <div className='w-[90%] mx-auto xl:w-[85%] mb-7'>
      <PageTitle
        title="Gestión de Alumnos"
        subtitule="Gestiona perfiles de alumnos: crea, edita y elimina personas fácilmente."
        className="mb-20"
      />
      <div>
        <div className='mb-5 md:flex md:justify-between md:items-center'>
          <p className='text-xl font-bold text-foreground mb-2 min-w-[195px]'>Alumnos encontrados:
            {
              results &&
              <span> {results.totalEntries}</span>
            }
          </p>
          <div className='flex gap-3'>
            <SearchBar
              className="h-10"
              onSearchChange={onSearchChange}
              query={query}
              setQuery={setQuery}
            />
            <Button
              className="h-10"
              onClick={handleOpenAddUserModal}
            >
              <FaCirclePlus className="mr-2 h-4 w-4" />
              Alumno</Button>
          </div>
        </div>
        <div>
        <ResultTable
                    tableData={tableData}
                    onClick={onResultClick}
                    indexOffset={(currentPage - 1) * resultsPerPage}
                    isLoading={isLoading}
                  />
          {
            tableData && (
              <>
                {
                  Array.isArray(tableData) && tableData.length !== 0 &&
                  <Paginator
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    className='mb-5'
                  />
                }
               
              </>
            )
          }
        </div>
      </div>
    </div>
  )
}


