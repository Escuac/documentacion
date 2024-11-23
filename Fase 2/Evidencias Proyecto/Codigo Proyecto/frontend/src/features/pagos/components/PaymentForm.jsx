import { Button } from '@/components/shadcn/button';
import st from '../styles/PaymentForm.module.css';
import { useEffect, useState } from 'react';
import { addDays, format } from 'date-fns';
import { toast, useFetch3, useForm, useSearch } from '@/hooks';
import { PAYMENT_METHOD, FORM_MODES } from '@/constants';
import { getTodayDate, calculateEndDate, formatDate } from "@/lib/utils";
import { searchUsers, createPayment, updatePayment, getPayments } from '@/api/alumnosApi';
import { SearchBar } from '@/components';
import { getActivePlans } from '@/api/planesApi';
import { useContext } from 'react';
import { ModalContext } from '@/context';
import { FakeSearchBar } from '@/components/FakeSearchBar';

const defaultValues = {
  id_usuario: null,
  id_plan: '',
  duracion_meses: '1',
  metodo_pago: PAYMENT_METHOD.CASH,
  fecha_inicio: getTodayDate(),
  fecha_vencimiento: calculateEndDate(getTodayDate()),
  porcentaje_descuento: '0',
  detalle_descuento: '',
  monto_pagado: '',
  notas: ''
}
const useSearchOptions = {
  endpoint: searchUsers,
  limit: 10,
  page: 1
}

export const PaymentForm = ({ initialValues = defaultValues, mode = FORM_MODES.CREATE }) => {
  const { hideModal } = useContext(ModalContext);
  const { formState, setformState, onInputChange } = useForm(initialValues);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { setQuery, query, results, error, isLoading, onSearchChange } = useSearch('', useSearchOptions);
  const {
    data: activePaymentData,
    error: activePaymentDataError,
    fetchData: fetchActivePaymentData,
    isLoading: activePaymentDataIsLoading,
    restartFetch: restartActivePaymentDataFetch
  } = useFetch3();

  const {
    id_plan,
    duracion_meses,
    metodo_pago,
    fecha_inicio,
    fecha_vencimiento,
    porcentaje_descuento,
    detalle_descuento,
    monto_pagado,
    valor_base,
    notas
  }
    = formState;

  const {
    data: plansData,
    error: plansError,
    fetchData: fetchPlans,
    isLoading: isPlansLoading,
    restartFetch: restartPlansFetch
  } = useFetch3();

  const { fetchWithoutState } = useFetch3();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormDisabled, setIsFormDisabled] = useState(false);

  useEffect(() => {
    fetchPlans(getActivePlans, {}, (data) => {
      /* si al cargar el formulario la variable initialValues ya tiene un id de plan asociado, se asume que se esta editando un pago
      por lo que se debe cargar la informacion del plan asociado al pago y del usuario */

      // TODO: validaciones de datos
      // TODO: implementar logica de cuando el plan actual del alumno esta desactivado en el sistema
      if (initialValues.id_plan !== '') {
        const plan = data.find(plan => plan.id_plan === parseInt(initialValues.id_plan));
        setSelectedPlan(plan);
        setSelectedUser({ id_usuario: initialValues.id_usuario });

        setformState({
          id_plan: plan.id_plan,
          valor_base: plan.valor_base,
          monto_pagado: initialValues.monto_pagado,
          porcentaje_descuento: initialValues.porcentaje_descuento || '0',
          fecha_inicio: initialValues.fecha_inicio,
          fecha_vencimiento: initialValues.fecha_vencimiento,
        });
      }
    });
  }, [fetchPlans]);

  useEffect(() => {
    if (fecha_inicio === '') return;

    setformState({
      ...formState,
      fecha_vencimiento: calculateEndDate(fecha_inicio)
    });
  }, [fecha_inicio])

  const handleOnResultClick = (user) => {
    setSelectedUser(user);
    fetchActivePaymentData(getPayments, { id_usuario: user.id_usuario, active: true }, (data) => {
      if (data.length === 0) {
        setformState({
          ...formState,
          fecha_inicio: format(new Date(), 'yyyy-MM-dd')
        });
        return;
      };

      if (data.activo) {
        const activePaymentEndDate = new Date(data.activo.fecha_vencimiento);
        const newStartDate = format(addDays(activePaymentEndDate, 1), 'yyyy-MM-dd');
        setformState({
          ...formState,
          fecha_inicio: newStartDate,
        });
      }

      if (data.futuro) {
        setIsFormDisabled(true)
      };
    });
  }

  const handleOnCancel = () => {
    hideModal();
  }

  const handlePlanChange = (e) => {
    onInputChange(e);
    if (e.target.value === '') {
      setSelectedPlan(null);
      setformState({
        ...formState,
        valor_base: '',
        porcentaje_descuento: '0',
        detalle_descuento: '',
        monto_pagado: ''
      });

      return;
    }

    const plan = plansData.find(plan => plan.id_plan === parseInt(e.target.value));
    setSelectedPlan(plan);
    setformState({
      ...formState,
      id_plan: plan.id_plan,
      valor_base: plan?.valor_base,
      monto_pagado: plan?.valor_base,
      porcentaje_descuento: '0'
    });
  }

  const handleTotalChange = (e) => {
    const value = parseInt(e.target.value);

    if (value === '' || isNaN(value)) {
      setformState({
        ...formState,
        monto_pagado: 0,
        porcentaje_descuento: 100
      });
      return;
    }


    const newPorcentage = 100 - ((value * 100) / parseInt(valor_base));

    setformState({
      ...formState,
      porcentaje_descuento: Number.isInteger(newPorcentage) ? newPorcentage : newPorcentage.toFixed(2),
      monto_pagado: value
    })
  }

  const handleDiscountChange = (e) => {
    const value = e.target.value;
    const porcentaje = value === '' ? 0 : parseInt(value);
    const monto_descuento = (parseInt(valor_base) * porcentaje) / 100;
    const newTotal = parseInt(valor_base) - monto_descuento;
    setformState({
      ...formState,
      porcentaje_descuento: value,
      monto_pagado: newTotal
    });
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser) {
      alert('Debe seleccionar un usuario');
      return;
    }

    const paymentData = {
      id_plan,
      fecha_inicio,
      fecha_vencimiento,
      monto_pagado,
      porcentaje_descuento: porcentaje_descuento === '0' ? null : porcentaje_descuento,
      detalle_descuento: detalle_descuento === '' ? null : detalle_descuento,
      metodo_pago,
      notas: notas === '' ? null : notas
    }

    if (mode === FORM_MODES.CREATE) {
      setIsSubmitting(true);
      const response = await fetchWithoutState(createPayment, { user_id: selectedUser.id_usuario, paymentData });

      if (response.error) {
        toast({
          variant: "destructive",
          title: "Registro fallido",
          description: "No fue posible completar la operación.",
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Se ha guardado con éxito.",
        description: "El pago se ha registrado correctamente.",
      });
    } else if (mode === FORM_MODES.EDIT) {
      setIsSubmitting(true);
      const response = await fetchWithoutState(updatePayment, {
        user_id: selectedUser.id_usuario,
        payment_id: initialValues.id_pago,
        paymentData
      });

      if (response.error) {
        let message = "No fue posible completar la operación.";

        if (response.status === 409) {
          message = "El intervalo de fechas elegido se superpone con el de otro pago registrado."
        }

        toast({
          variant: "destructive",
          title: "Registro fallido",
          description: message,
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Se ha guardado con éxito.",
        description: "El pago se ha registrado correctamente.",
      });
    }

    setIsSubmitting(false);
    hideModal();
  }

  return (
    <form className={st["contenedor-form"]} onSubmit={handleFormSubmit}>
      {
        mode === FORM_MODES.CREATE ? (
          <>
            <h2>Registrar Pago</h2>
            <label className='self-start mb-2 text-muted-foreground'>Registrar pago a</label>
            {
              selectedUser ?
                <FakeSearchBar
                  className='mb-3'
                  text={`${selectedUser.nombres} ${selectedUser.apellidos}`}
                  onClean={() => {
                    setSelectedUser(null);
                    setQuery('');
                    restartActivePaymentDataFetch();
                    setIsFormDisabled(false);
                    activePaymentData
                    setformState({
                      ...formState,
                      fecha_inicio: format(new Date(), 'yyyy-MM-dd')
                    })
                  }} />
                :
                <SearchBar
                  className='mb-3'
                  placeholder="Buscar Alumno..."
                  onSearchChange={onSearchChange}
                  showResultsContainer={true}
                  // onReset={handleOnReset}
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
                          onResultClick={() => handleOnResultClick(result)}
                        />
                      ))
                    )}
                </SearchBar>
            }
          </>
        ) : (
          <>
            <h2 className='mb-6'>Editar Pago</h2>
            <label className='self-start mb-2 text-muted-foreground'>Alumno</label>
            <FakeSearchBar
              className='mb-3'
              text={initialValues.nombre_completo}
              showCloseIcon={false}
            />
          </>
        )
      }
      {
        activePaymentData?.activo && activePaymentData?.futuro ? (
          // Muestra el mensaje especial si ambos, `activo` y `futuro`, están presentes
          <div className='bg-yellow-100 w-full py-3 px-2 lg:px-5 border-yellow-300 border-x-4 rounded-lg my-5'>
            <h3 className='font-bold text-lg text-yellow-800'>¡Atención!</h3>
            <p className='text-yellow-800 text-justify text-[0.9rem]'>
              No es posible agregar más pagos para este alumno, ya que cuenta con un pago activo y uno programado a futuro.
            </p>
          </div>
        ) : activePaymentData?.activo ? (
          // Muestra el mensaje de plan activo si solo `activo` está presente
          <div className='bg-yellow-100 w-full py-3 px-2 lg:px-5 border-yellow-300 border-x-4 rounded-lg mb-3'>
            <h3 className='font-bold text-lg text-yellow-800'>Pago activo existente</h3>
            <p className='text-yellow-800 text-justify text-[0.9rem]'>
              Alumno ya cuenta con el plan <strong>{activePaymentData.activo.nombre_plan}</strong> activo. Fecha de inicio: <strong>{formatDate(activePaymentData.activo.fecha_inicio)}</strong>, con fecha de finalización el <strong>{formatDate(activePaymentData.activo.fecha_vencimiento)}</strong>.
            </p>
          </div>
        ) : activePaymentData?.futuro ? (
          // Muestra el mensaje para `futuro` si solo `futuro` está presente
          <div className='bg-yellow-100 w-full py-3 px-2 lg:px-5 border-yellow-300 border-x-4 rounded-lg mb-3'>
            <h3 className='font-bold text-lg text-yellow-800'>Pago futuro programado</h3>
            <p className='text-yellow-800 text-justify text-[0.9rem]'>
              El alumno tiene un pago futuro programado para el plan <strong>{activePaymentData.futuro.nombre_plan}</strong> con inicio: <strong>{formatDate(activePaymentData.futuro.fecha_inicio)}</strong> y termino <strong>{formatDate(activePaymentData.futuro.fecha_vencimiento)}</strong> por lo cual no es posible registrar mas pagos.
            </p>
          </div>
        ) : null
      }
      {
        !isFormDisabled &&
        (

          <div className='flex flex-col gap-3 w-[100%]'>
            <div className='flex justify-between gap-5'>
              <div className='input-group'>
                <label htmlFor="">Plan</label>
                <select
                  name="id_plan"
                  value={id_plan}
                  onChange={handlePlanChange}
                  required
                  disabled={isFormDisabled}
                >
                  <option value="">Seleccione un plan</option>
                  {
                    Array.isArray(plansData) && plansData.map(plan => (
                      <option key={plan.id_plan} value={plan.id_plan}>{plan.nombre}</option>
                    ))
                  }
                </select>
              </div>

              <div className='input-group'>
                <label htmlFor="">Meses Plan</label>
                <select value="0" disabled>
                  <option value="0">Mensual</option>
                  {/* <option value="">Trimestral</option>
                <option value="">Semestral</option>
                <option value="">Anual</option> */}
                </select>
              </div>

              <div className='input-group'>
                <label htmlFor="">Medio Pago</label>
                <select
                  name="metodo_pago"
                  id=""
                  onChange={onInputChange}
                  value={metodo_pago}
                  disabled={isFormDisabled}
                >
                  <option value={PAYMENT_METHOD.CASH}>Efectivo</option>
                  <option value={PAYMENT_METHOD.BANK_TRANSFER}>Transferencia</option>
                  <option value={PAYMENT_METHOD.DEBIT_CARD}>Debito</option>
                  <option value={PAYMENT_METHOD.CREDIT_CARD}>Credito</option>
                  <option value={PAYMENT_METHOD.DEBT}>Deuda</option>
                </select>
              </div>
            </div>

            <div className='flex justify-between gap-5'>
              <div className='input-group'>
                <label htmlFor="">Fecha Inicio</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  id=""
                  min={activePaymentData?.length > 0 ? fecha_inicio : ''}
                  onChange={onInputChange}
                  value={fecha_inicio}
                  disabled={isFormDisabled}
                />
              </div>

              <div className='input-group'>
                <label htmlFor="">Fecha Vencimiento</label>
                <input
                  type="date"
                  name="fecha_vencimiento"
                  id=""
                  onChange={onInputChange}
                  value={fecha_vencimiento}
                  min={fecha_inicio ? format(addDays(new Date(fecha_inicio), 24), 'yyyy-MM-dd') : ''}
                  max={(fecha_vencimiento && fecha_inicio) ? format(addDays(new Date(fecha_inicio), 54), 'yyyy-MM-dd') : ''}
                  disabled={isFormDisabled}
                />
              </div>
            </div>
            <div className='flex gap-2'>
              <div className='input-group'>
                <label htmlFor="">Valor Base</label>
                <input
                  type="number"
                  disabled
                  onChange={onInputChange}
                  value={valor_base}
                  name="valor_base"
                />
              </div>
              <div className='input-group'>
                <label htmlFor="">Multiplicador</label>
                <input type="text" value="1" disabled />
              </div>
              <div className='input-group'>
                <label htmlFor="">% Descuento</label>
                <input
                  type="number"
                  onChange={handleDiscountChange}
                  value={porcentaje_descuento}
                  name="porcentaje_descuento"
                  max={100}
                  min={0}
                  step="any"
                  disabled={!selectedPlan || isFormDisabled}
                />
              </div>
              <div className='input-group'>
                <label htmlFor="">Total</label>
                <input
                  type="text"
                  value={monto_pagado}
                  onChange={handleTotalChange}
                  name="monto_pagado"
                  disabled={!selectedPlan || isFormDisabled}
                  required
                  max={valor_base}
                />
              </div>
            </div>
            {
              porcentaje_descuento > 0 && (

                <div className='input-group'>
                  <label htmlFor="">Razón Descuento</label>
                  <input
                    type="text"
                    name="detalle_descuento"
                    id=""
                    onChange={onInputChange}
                    value={detalle_descuento}
                    maxLength={200}
                    disabled={isFormDisabled}
                  />
                </div>
              )
            }
            <div className='input-group'>
              <label htmlFor="">Notas</label>
              <textarea
                className='h-20 resize-none'
                name="notas"
                id=""
                maxLength={200}
                onChange={onInputChange}
                value={notas}
                disabled={isFormDisabled}
              ></textarea>
            </div>
          </div>
        )
      }
      <div className='flex justify-end gap-x-5 mt-5'>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={handleOnCancel}
        >Cancelar</Button>
        <Button
          type='submit'
          disabled={isSubmitting || isFormDisabled}
        >Guardar</Button>
      </div>
    </form>
  )
}
