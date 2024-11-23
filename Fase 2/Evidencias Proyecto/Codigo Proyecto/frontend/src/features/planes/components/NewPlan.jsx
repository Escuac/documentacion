import { Button } from "@/components/shadcn/button"
import st from '../styles/NewPlan.module.css';
import { FORM_MODES, ACCESS_TYPE } from '@/constants'
import { toast, useFetch3, useForm } from "@/hooks";
import { useState } from "react";
import { createPlan, updatePlan } from "@/api/planesApi";
import { useContext } from "react";
import { ModalContext } from "@/context";
import { useEffect } from "react";

const initialValues = {
  valor_base: '',
  nombre: '',
  modalidad_acceso: '',
  descripcion: ''
}

export const NewPlan = ({ defaultValues = initialValues, mode = FORM_MODES.CREATE }) => {
  const { hideModal } = useContext(ModalContext);
  const { fetchWithoutState } = useFetch3();
  const [isLoading, setIsLoading] = useState(false);
  const { formState, setFormState, onInputChange } = useForm(defaultValues);

  const { valor_base, nombre, modalidad_acceso, descripcion } = formState;

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const planData = {
      valor_base,
      nombre,
      modalidad_acceso,
      descripcion
    }

    if (mode === FORM_MODES.CREATE) {
      const response = await fetchWithoutState(createPlan, planData);
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Registro fallido",
          description: "No fue posible completar la operación.",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Se ha guardado con éxito.",
        description: "El plan se ha registrado correctamente.",
      });
    } 
    else if (mode === FORM_MODES.EDIT) {
      const response = await fetchWithoutState(updatePlan, {id_plan: defaultValues.id_plan, planData});
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Registro fallido",
          description: "No fue posible completar la operación.",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Se ha guardado con éxito.",
        description: "El plan se ha registrado correctamente.",
      });
    }

    hideModal();
    setIsLoading(false);
  }

  return (
    <form className={st["contenedor-form"]} onSubmit={handleOnSubmit}>
      <h2 className='mb-6'>Crear Nuevo Plan</h2>
      <div className='flex justify-between w-[100%] gap-5'>
        <div className='input-group'>
          <label htmlFor="">Nombre Plan</label>
          <input
            onChange={onInputChange}
            name="nombre"
            value={nombre}
            type="text"
            id=""
            required
            maxLength={50}
          />
        </div>
        <div className='input-group'>
          <label htmlFor="">Clases por mes</label>
          <select
            id=""
            onChange={onInputChange}
            name="modalidad_acceso"
            value={modalidad_acceso}
            required
          >
            <option value="">Seleccionar</option>
            <option value="1">{ACCESS_TYPE["1"]}</option>
            <option value="2">{ACCESS_TYPE["2"]}</option>
            <option value="3">{ACCESS_TYPE["3"]}</option>
          </select>
        </div>
      </div>

      <div className='flex justify-between w-[100%] gap-5'>
        <div className='input-group'>
          <label htmlFor="">Valor base</label>
          <input
            onChange={onInputChange}
            name="valor_base"
            value={valor_base}
            type="number"
            id=""
            required
            min={0}
            max={1000000}
            step={500}
          />
        </div>
        <div className='input-group'>
          <label htmlFor="">Descripción</label>
          <input
            onChange={onInputChange}
            name="descripcion"
            value={descripcion}
            type="text"
            id=""
            maxLength={250}
          />
        </div>
      </div>

      <div className='flex justify-end gap-x-5 mt-5'>
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={hideModal}
        >Cancelar</Button>
        <Button
          type='submit'
          disabled={isLoading}
        >Guardar</Button>
      </div>
    </form>
  )
}
