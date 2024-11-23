import { MdEdit, MdDelete } from "react-icons/md";
import st from '../styles/ResultTable.module.css';
import { PAYMENT_STATE } from '@/constants';
import { format } from 'date-fns';
export const ResultTable = ({ tableData = [], onClick, indexOffset, isLoading = false }) => {
  return (
    <table className={st["users-table"]}>
      <thead className={st["table-header"]}>
        <tr>
          <th>#</th>
          <th className='text-start pl-5'>Alumno</th>
          <th>Plan</th>
          <th>Estado Plan</th>
          <th>Ultima Asistencia</th>
          <th>Vencimiento Plan</th>
          <th></th>
        </tr>
      </thead>
      <tbody className='odd:bg-red'>
        {
          isLoading ? <tr><td colSpan={7} className="h-16">Cargando...</td></tr> : 
          (Array.isArray(tableData) && tableData.length > 0) ?
          tableData.map((user, index) =>
            <TableRow
              key={user.id_usuario}
              user={user}
              index={indexOffset + index + 1} 
              onClick={e=> onClick(user.id_usuario)}
              />) :
              <td colSpan={7} className="h-16">No se han encontrado resultados.</td>

        }

      </tbody>

    </table>
  );
};

const TableRow = ({ user, index, onClick }) => {

  return (
    <tr data-idusuario={user.id_usuario} className='cursor-pointer' onClick={onClick}>
      <td className='font-bold'>{index}</td>
      <td className='max-w-[330px] min-w-[200px]'>
        <div className={st["alumno-container"]}>
          <div>
            <div className={st.avatar}></div>
          </div>
          <div className='flex flex-col items-start'>
            <p className={`truncate-text max-w-[150px] md:max-w-[220px] xl:max-w-[250px] 2xl:max-w-[330px]`}>{`${user.nombres} ${user.apellidos}`}</p>
            {
              user.run &&
              <p className={st["run-tag"]}>{user.run}</p>
            }
          </div>
        </div>
      </td>
      <td>{user.lastPayment ? user.lastPayment.nombre_plan : '-'}</td>
      <td>{user.lastPayment ? PAYMENT_STATE[user.lastPayment.estado] : '-'}</td>
      <td>{user.lastPayment?.ultima_asistencia ? format(user.lastPayment.ultima_asistencia, 'yyyy-MM-dd') : '-'}</td>
      <td>{user.lastPayment ? user.lastPayment.fecha_vencimiento : '-'}</td>
      <td>
        <div className={st["action-button-container"]}>
          {/* <button className={`${st["action-button"]} bg-primary`}>
            <MdEdit />
          </button> */}
          <button className={`${st["action-button"]} bg-destructive`}>
            <MdDelete />
          </button>
        </div>
      </td>
    </tr>
  )
}
{/* <th>#</th>
          <th className='text-start pl-5'>Alumno</th>
          <th>Plan</th>
          <th>Estado Plan</th>
          <th>Ultima Asistencia</th>
          <th>Vencimiento Plan</th>
          <th></th> */}