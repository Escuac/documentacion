import { Button } from "@/components/shadcn/button"
import { ModalContext } from "@/context";
import { useContext } from "react";
import { RegistroAlumno } from "@/features/alumnos/components/RegistroAlumno";
import st from './styles/DashboardPage.module.css';
import { FaCirclePlus } from "react-icons/fa6";
import { PaymentForm } from "@/features/pagos/components/PaymentForm";
import { PageTitle, SearchBar } from "@/components";
import { toast, useFetch3, useSearch } from "@/hooks";
import { getOneUser, searchUsers, deleteUserAttendance } from "@/api/alumnosApi";
import { getDashboardMetrics } from '@api/dashboardApi'
import { getExpiringSoon } from '@api/pagosApi';
import { FORM_MODES, BASE_API_URL } from "@/constants";
import { MeasurementsForm } from "@/features/mediciones/components/MeasurementsForm";
import { format, isSameWeek } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { AttendanceForm } from "@/features/asistencia/AttendanceForm";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const labels = ["lunes", "martes", "miércoles", "jueves", "viernes"];

const chartInitial = {
  labels,
  datasets: [
    {
      label: "Asistencias",
      data: [],
      backgroundColor: ["rgba(4,88,118,1)"],
      borderColor: "rgba(4,88,118,1)",
      borderWidth: 2,
    }]
};

export const DashboardPage = () => {
  const { showModal } = useContext(ModalContext);
  const [attendanceList, setAttendanceList] = useState([]);
  const [chartData, setChartData] = useState(chartInitial);
  const {
    data: metricsData,
    error: metricsError,
    fetchData: fetchMetrics,
    isLoading: isMetricsLoading
  } = useFetch3();

  const {
    data: userDetailsData,
    error: userDetailsError,
    fetchData: fetchUserDetails,
    isLoading: isUserDetailsLoading
  } = useFetch3();

  const {
    data: expiringPaymentsData,
    error: expiringPaymentsError,
    fetchData: fetchExpiringPayments,
    isLoading: isExpiringPaymentsLoading
  } = useFetch3();

  const { query, setQuery, results, error, isLoading, onSearchChange, onReset, executeSearch } = useSearch('',
    {
      endpoint: searchUsers,
      limit: 10,
      page: 1,
      searchOnEmptyQuery: false
    });

  useEffect(() => {
    fetchMetrics(getDashboardMetrics);
    fetchExpiringPayments(getExpiringSoon);

    // Crear una conexión SSE al servidor
    const eventSource = new EventSource(`${BASE_API_URL}/attendances/new-attendences-event`);

    // Manejar mensajes recibidos desde el servidor
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setAttendanceList(data.asistencias);
    };

    // Manejar errores de conexión
    eventSource.onerror = () => {
      console.error('Error en la conexión SSE');
      eventSource.close();
    };

    // Cerrar la conexión al desmontar el componente
    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    if (!attendanceList) return;
    fetchMetrics(getDashboardMetrics);

    const values = [];
    const attendancesThisWeek = attendanceList.filter(asistencia =>
      isSameWeek(new Date(asistencia.fecha_asistencia), new Date(), { weekStartsOn: 1 })
    );

    labels.forEach(day => {
      const dayAttendances = attendancesThisWeek.filter(attendance => {
        const formatedData = format(new Date(attendance.fecha_asistencia), 'EEEE', { locale: es });
        return formatedData === day;
      });
      values.push(dayAttendances.length);
    });

    setChartData({
      ...chartData,
      datasets: [
        {
          ...chartData.datasets[0],
          data: values
        }
      ]
    });

  }, [attendanceList]);

  const handleNewUserClick = () => {
    showModal(<RegistroAlumno />);
  }

  const handleNewPago = () => {
    showModal(<PaymentForm />);
  }

  const handleNewMeasurement = () => {
    showModal(<MeasurementsForm />, null, 'max-w-[700px]');
  }

  const onResultClick = async (user_id) => {
    fetchUserDetails(getOneUser, { user_id }, (data) => {
      if (data.basic.fecha_nacimiento) {
        data.basic.fecha_nacimiento = format(new Date(data.basic.fecha_nacimiento), 'yyyy-MM-dd');
      }
      showModal(<RegistroAlumno defaultValues={data} mode={FORM_MODES.EDIT} />);
    });
  }

  const handleOnDeleteAttendance = async (id_usuario, id_asistencia) => {

    const dialogResponse = window.confirm('¿Estás seguro de eliminar esta asistencia? Esta acción no se puede deshacer.');

    if (dialogResponse) {
      const response = await deleteUserAttendance({ id_usuario, id_asistencia });
      if (response.ok) {
        toast({
          title: "Se ha eliminado con éxito.",
          description: "La asistencia se ha eliminado correctamente.",
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

  const handleNewAttendance = () => {
    showModal(<AttendanceForm />, null, 'max-w-[700px]');
  }

  return (
    <div className="w-[90%] mx-auto xl:w-[85%] mb-7">
      <div className={st.container}>
        <PageTitle
          title={"Dashboard"}
          className="mb-10"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 mb-7">
          <SearchBar
            onSearchChange={onSearchChange}
            onReset={onReset}
            placeholder='Buscar Alumno...'
            showResultsContainer={true}
            query={query}
            setQuery={setQuery}
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
                    onResultClick={onResultClick}
                  />
                ))
              )}
          </SearchBar>
          <div className={st["action-button"]}>
            <Button type="button" onClick={handleNewUserClick}>
              <FaCirclePlus className="mr-2 h-4 w-4" /> Alumno
            </Button>
            <Button
              type="button"
              onClick={handleNewPago}
            >
              <FaCirclePlus className="mr-2 h-4 w-4" /> Pago
            </Button>
            <Button
              type="button"
              onClick={handleNewMeasurement}
            >
              <FaCirclePlus className="mr-2 h-4 w-4" /> Medición
            </Button>
            <Button
              type="button"
              onClick={handleNewAttendance}
            >
              <FaCirclePlus className="mr-2 h-4 w-4" /> Asistencia
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-y-6 gap-x-10">
          <div>
            <h2 className="text-xl font-semibold mb-4">Ultimos registros asistencia</h2>
            <table>
              <thead>
                <th>Hora</th>
                <th>Asistencias</th>
                <th className="hidden lg:table-cell">Plan</th>
                <th>Alumno</th>
                <th></th>
              </thead>
              <tbody>
                {
                  attendanceList && attendanceList.length > 0 && attendanceList.slice(0, 6).map((attendance) => (
                    <tr key={attendance.id_asistencia}>
                      <td>{format(new Date(attendance.fecha_asistencia), 'k:mm EEE-dd', { locale: es })}</td>
                      <td>{attendance.dias_totales === 31 ? attendance.dias_ocupados : `${attendance.dias_ocupados}/${attendance.dias_totales}`}</td>
                      <td className="hidden lg:table-cell">{attendance.pago_info.nombre_plan}</td>
                      <td>{attendance.nombre_completo}</td>
                      <td className="text-center w-9">
                        <div className="flex gap-[10px] justify-center">
                          <button
                            className={`w-[25px] h-[25px] p-0 text-white flex justify-center items-center bg-destructive`}
                            onClick={(e) => handleOnDeleteAttendance(attendance.id_usuario, attendance.id_asistencia)}
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          <StatBoxes metrics={metricsData} />
          <div>
            <h2 className="text-xl font-semibold mb-4">Asistencia - Actividad semanal</h2>
            <LineChart className="h-full" chartData={chartData} />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Proximos Vencimientos <span className="text-base">(7d)</span></h2>
            <UpcomingExpirations payments={expiringPaymentsData}/>
          </div>
        </div>
      </div>
    </div>
  )
}

const LineChart = ({ className, chartData }) => {


  const options = {
    // animation: {
    //   duration: 0
    // },
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Día de la semana",
        },
      },
      y: {
        min: 0,
        title: {
          display: true,
          text: "Cantidad alumnos",
        },
        ticks: {
          stepSize: 1,
        }
      }
    }
  };

  return (
    <div className={className}>
      <Line data={chartData} options={options} />
    </div>);
}

function genRandomNumber(min, max) {
  if (min > max) {
    throw new Error("El valor mínimo no puede ser mayor que el valor máximo");
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const defaultMetricsValues = {
  dayAttendance: 20,
  monthIncome: 1940000,
  monthPayments: 70,
  monthMeasurements: 38
};
const StatBoxes = ({ metrics = defaultMetricsValues }) => {
  return (
    <div className="grid grid-cols-3 gap-3 content-center w-full py-5">
      <div className="border h-20 flex flex-col justify-center items-center px-5 rounded-md">
        <p className="text-lg font-semibold">${metrics ? metrics.monthIncome : "-"}</p>
        <p className="text-sm text-center text-muted-foreground">Ingresos Mes</p>
      </div>
      <div className="border h-20 flex flex-col justify-center items-center px-5 rounded-md">
        <p className="text-lg font-semibold">{metrics ? metrics.dayAttendance : "-"}</p>
        <p className="text-sm text-center text-muted-foreground">Asistencias día</p>
      </div>
      <div className="border h-20 flex flex-col justify-center items-center px-5 rounded-md">
        <p className="text-lg font-semibold">{metrics ? metrics.monthPayments : "-"}</p>
        <p className="text-sm text-center text-muted-foreground">Pagos mes</p>
      </div>
      <div className="border h-20 flex flex-col justify-center items-center px-5 rounded-md">
        <p className="text-lg font-semibold">{metrics ? metrics.monthMeasurements : "-"}</p>
        <p className="text-sm text-center text-muted-foreground">Mediciones mes</p>
      </div>
    </div>
  )
}

const UpcomingExpirations = ({payments}) => {
  return (
    <div className="max-h-[290px] overflow-y-auto">
      <table>
        <thead>
          <th>Alumno</th>
          <th>Plan</th>
          <th>Fecha de vencimiento</th>
        </thead>
        <tbody>
          {
            payments && payments.length > 0 && payments.map((payment) => (
              <tr key={payment.id_pago}>
                <td>{payment.nombre_completo}</td>
                <td>{payment.nombre_plan}</td>
                <td>{format(new Date(payment.fecha_vencimiento), 'dd/MM/yyyy')}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}