import { useState, useContext } from 'react';
import { Button } from '@components/shadcn/button';
import { FaCirclePlus, FaCircleMinus } from "react-icons/fa6";
import { useForm } from '@/hooks';
import { ModalContext } from "@/context";
import { useToast } from '@/hooks';
import st from '../styles/RegistroAlumno.module.css';
import { USER_ROLES, SOCIAL_TYPE, PHONE_TYPE, GENDER, FORM_MODES, BASE_API_URL } from '@/constants';
import { useFetch3 } from '@/hooks/useFetch3';
import { update } from '@/api/alumnosApi';

const initialValues = {
  basic: {
    id_rol: USER_ROLES.ALUMNO,
    nombres: '',
    apellidos: '',
    run: '',
    genero: '',
    correo: '',
    direccion: '',
    nacimiento: '',
    fecha_nacimiento: ''
  },
  telefonos: [{
    id_telefono: 'n' + Date.now(),
    id_tipo_telefono: '', //TODO: Usar constante
    numero: ''
  }],
  redes: [{
    id_red_social: 'n' + Date.now(),
    id_tipo_red: '', //TODO: Usar constante
    handle: ''
  }]
}

export const RegistroAlumno = ({ defaultValues = initialValues, mode = FORM_MODES.CREATE }) => {
  const { formState, onInputChange, setformState } = useForm(defaultValues.basic);
  const { nombres, apellidos, run, id_rol, fecha_nacimiento } = formState;
  const [telefonos, setTelefonos] = useState(structuredClone(defaultValues.telefonos));
  const [redes, setRedes] = useState(structuredClone(defaultValues.redes));
  const [toDelete, setToDelete] = useState({ redes: [], telefonos: [] })
  const { fetchWithoutState } = useFetch3();
  const [isLoading, setIsLoading] = useState(false);
  const { hideModal, setModalContent, setModalStyle } = useContext(ModalContext);
  const { toast } = useToast();

  const onRedChange = (e, index) => {
    const newArray = [...redes];
    if (e.target.dataset.tipo === 'red') {
      newArray[index].id_tipo_red = e.target.value;
    } else {
      newArray[index].handle = e.target.value;
    }
    setRedes(newArray);
  };

  const onAddRedes = () => {
    setRedes([...redes, {
      id_red_social: 'n' + Date.now(),
      id_tipo_red: '',
      handle: ''
    }]);
  };

  const onPhoneChange = (e, index) => {
    const newArray = [...telefonos];
    if (e.target.dataset.tipo === 'tipo') {
      newArray[index].id_tipo_telefono = e.target.value;
    } else {
      newArray[index].numero = e.target.value;
    }
    setTelefonos(newArray);
  };

  const onAddPhone = () => {
    setTelefonos([...telefonos, {
      id_telefono: 'n' + Date.now(),
      id_tipo_telefono: '',
      numero: ''
    }]);
  };

  const onDeleteElement = (dataSet, setFunction, id, type) => {
    const typeMap = {
      phone: "id_telefono",
      red: "id_red_social"
    }

    setFunction(dataSet.filter(e => e[typeMap[type]] !== id));
    if (type === "phone") {
      setToDelete({ ...toDelete, telefonos: [...toDelete.telefonos, id] })
    } else {
      setToDelete({ ...toDelete, redes: [...toDelete.redes, id] })
    }
  };

  const onFormSubmit = async (e) => {

    e.preventDefault();

    if (mode === FORM_MODES.EDIT) {
      const toUpdateUser = removeEmpty({ ...formState, redes, telefonos, toDelete });
      const updatedUser = await fetchWithoutState(update, toUpdateUser);

      if (updatedUser.error) {
        toast({
          variant: "destructive",
          title: "Registro fallido",
          description: "No fue posible completar la operación. Verifica la información e intenta otra vez.",
        });

        setIsLoading(false);
        return;
      }

      toast({
        title: "Se ha guardado con éxito.",
        description: "Los cambios del alumno se han guardado correctamente.",
      });
      hideModal();
    }

    if (mode === FORM_MODES.CREATE) {
      const newUser = removeEmpty({ ...formState, redes, telefonos })
      const response = await fetch(`${BASE_API_URL}/users/`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(newUser),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const responseData = await response.json();
      if (response.ok) {
        setModalContent(
        <NewUserInfo 
          username={responseData.username} 
          password={responseData.password}
          hideModal={hideModal}
        />)
        setModalStyle('max-w-[400px]')
        toast({
          title: "Se ha guardado con éxito.",
          description: "Alumno se ha registrado correctamente.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Registro fallido",
          description: "No fue posible completar la operación. Verifica la información e intenta otra vez.",
        });
      }
    };

    setIsLoading(false);
  }

  return (
    <form className={st["contenedor-form"]} onSubmit={onFormSubmit}>

      <ModalHeader
        userName={`${nombres} ${apellidos}`}
        userRun={run}
        userRol={id_rol}
        onInputChange={onInputChange}
      />
      <div className={st["info-section"]}>
        <BasicInfoForm formState={formState} onInputChange={onInputChange} />
        <ContactForm
          telefonos={telefonos}
          onPhoneChange={onPhoneChange}
          onAddPhone={onAddPhone}
          onDeletePhone={id_telefono => onDeleteElement(telefonos, setTelefonos, id_telefono, "phone")}
        />
        <SocialNetworksForm
          redes={redes}
          onRedChange={onRedChange}
          onAddRedes={onAddRedes}
          onDeleteRed={id_red_social => onDeleteElement(redes, setRedes, id_red_social, "red")}
        />
        <div className='flex justify-end gap-x-5 mt-12'>
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
      </div>
    </form>
  );
};

function ModalHeader({ userName, userRun, userRol, onInputChange }) {
  return (
    <div className={st["form-header"]}>
      <div className={st["avatar-role-container"]}>
        <div className={st.avatar}>
          <div className={st["add-button"]}>+</div>
        </div>
        <select name="id_rol" value={userRol} onChange={onInputChange}>
          <option value={USER_ROLES.ADMIN}>Admin</option>
          {/* <option value={USER_ROLES.OPERADOR}>Operador</option> */}
          <option value={USER_ROLES.ALUMNO}>Alumno</option>
        </select>
      </div>

      <div className={st["profile-info-container"]}>
        <div className={st["user-info"]}>
          {
            userName.trim() === '' ?
              <h1 className='text-muted-foreground'>[Nombre Apellido]</h1> :
              <h1>{userName}</h1>
          }
          <p>{userRun === '' ? '[RUN]' : userRun}</p>
        </div>
        {/* <div className={st["action-btns"]}>
          <Button type="button">
            <FaCirclePlus className="mr-2 h-4 w-4" /> Medición
          </Button>
          <Button type="button">
            <FaCirclePlus className="mr-2 h-4 w-4" /> Pago
          </Button>
        </div> */}
      </div>
    </div>
  );
}

function FormSection({ children, title }) {
  return (
    <>
      <h2>{title}</h2>
      <hr className='mb-5' />
      <div className="flex gap-4 flex-wrap mb-5">
        {children}
      </div>
    </>
  );
}

function BasicInfoForm({ formState, onInputChange }) {
  const { nombres, apellidos, run, genero, correo, direccion, fecha_nacimiento } = formState;
  return (
    <FormSection title="Información Básica">
      <div className="flex-1 min-w-[200px] gap-2">
        <div className='input-group mb-2'>
          <label htmlFor="">Nombres <span className='text-red-700 font-bold'>*</span></label>
          <input
            type="text"
            name="nombres"
            value={nombres}
            onChange={onInputChange}
            minLength="2"
            maxLength="50"
            required
          />
        </div>
        <div className='flex gap-x-3'>
          <div className='input-group'>
            <label htmlFor="">RUN</label>
            <input
              type="text"
              name="run"
              value={run}
              onChange={onInputChange}
              maxLength="11"
            />
          </div>
          <div className='input-group'>
            <label htmlFor="">Género <span className='text-red-700 font-bold'>*</span></label>
            <select
              name="genero"
              value={genero}
              onChange={onInputChange}
              required
            >
              <option value={GENDER.NONE} disabled>Seleccionar</option>
              <option value={GENDER.MASCULINO}>Masculino</option>
              <option value={GENDER.FEMENINO}>Femenino</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-[200px]">
        <div className='input-group mb-2'>
          <label htmlFor="">Apellidos <span className='text-red-700 font-bold'>*</span></label>
          <input
            type="text"
            name="apellidos"
            value={apellidos}
            onChange={onInputChange}
            minLength="2"
            maxLength="50"
            required
          />
        </div>
        <div className='input-group'>
          <label htmlFor="">Correo</label>
          <input
            name="correo"
            value={correo}
            onChange={onInputChange}
            type="email"
            maxLength="100"
          />
        </div>
      </div>

      <div className="flex gap-3 min-w-[200px] w-[100%]">
        <div className='input-group'>
          <label htmlFor="">Fecha de Nacimiento <span className='text-red-700 font-bold'>*</span></label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={fecha_nacimiento}
            onChange={onInputChange}
          />
        </div>
        <div className='input-group'>
          <label htmlFor="">Dirección</label>
          <input
            name="direccion"
            value={direccion}
            onChange={onInputChange}
            type="text"
            maxLength="150"
          />
        </div>
      </div>
    </FormSection>
  );
}

function ContactForm({ telefonos, onPhoneChange, onAddPhone, onDeletePhone }) {
  return (
    <FormSection title="Contacto">
      <div className='w-[100%]'>
        {
          telefonos.map((fono, index) => (
            <div className="flex w-[100%] gap-5" key={fono.id_telefono}>
              <div className='input-group'>
                <label htmlFor="">Tipo Teléfono</label>
                <select
                  data-tipo="tipo"
                  value={fono.id_tipo_telefono}
                  onChange={e => onPhoneChange(e, index)}
                  required={fono.numero !== ''}
                >
                  <option value="">Selecciona Tipo</option>
                  <option value={PHONE_TYPE.MOVIL}>Móvil</option>
                  <option value={PHONE_TYPE.FIJO}>Fijo</option>
                  <option value={PHONE_TYPE.EMERGENCIA}>Emergencia</option>
                </select>
              </div>
              <div className='input-group'>
                <label htmlFor="">Número</label>
                <div className='flex items-center gap-4'>
                  <input
                    data-tipo="numero"
                    value={fono.numero}
                    type="text"
                    onChange={e => onPhoneChange(e, index)}
                    maxLength="15"
                    required={fono.id_tipo_telefono !== ''}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => onDeletePhone(fono.id_telefono)}
                  >
                    <FaCircleMinus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        }
      </div>
      <div className="flex-1 min-w-[100%]">
        <Button
          type="button"
          className="ml-auto mt-3 block"
          onClick={onAddPhone}
        >
          <FaCirclePlus className='w-4 h-4' />
        </Button>
      </div>
    </FormSection>
  );
}

function SocialNetworksForm({ redes, onRedChange, onAddRedes, onDeleteRed }) {

  return (
    <FormSection title="Redes Sociales">
      <div className='w-[100%]'>
        {
          redes.map((red, index) => (
            <div className="flex w-[100%] gap-5" key={red.id_red_social}>
              <div className='input-group '>
                <label htmlFor="">Red Social</label>
                <select
                  data-tipo="red"
                  value={red.id_tipo_red}
                  onChange={e => onRedChange(e, index)}
                  required={red.handle !== ''}
                >
                  <option value="">Selecciona Red</option>
                  <option value={SOCIAL_TYPE.INSTAGRAM}>Instagram</option>
                  <option value={SOCIAL_TYPE.FACEBOOK}>Facebook</option>
                </select>
              </div>

              <div className='input-group'>
                <label htmlFor="">Handle</label>
                <div className='flex items-center gap-4'>
                  <input
                    data-tipo="handle"
                    value={red.handle}
                    type="text"
                    onChange={e => onRedChange(e, index)}
                    required={red.id_tipo_red !== ''}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => onDeleteRed(red.id_red_social)}
                  >
                    <FaCircleMinus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        }
      </div>
      <div className="flex-1 min-w-[100%]">
        <Button
          type="button"
          className="ml-auto block mt-3"
          onClick={onAddRedes}
        >
          <FaCirclePlus className='w-4 h-4' />
        </Button>
      </div>
    </FormSection>
  );
}

function removeEmpty(obj) {

  const filtered = {};

  for (const property in obj) {
    const value = obj[property];

    if (property === 'telefonos' && Array.isArray(value)) {
      const filteredPhones = value.filter(e => e.numero.trim() !== '');
      filtered.telefonos = filteredPhones;
    } else if (property === 'redes' && Array.isArray(value)) {
      const filteredSocials = value.filter(e => e.handle.trim() !== '');
      filtered.redes = filteredSocials;
    } else if (value === '') {
      filtered[property] = undefined;
    }
    else if (value != null) {
      filtered[property] = value;
    }
  }
  return filtered;
}

const NewUserInfo = ({username, password, hideModal}) => {
  return (
    <div className="flex justify-center flex-col px-3">
      <h2 className="text-xl text-center mb-7">Información Inicio de sesión</h2>
      <p><strong className="inline-block w-[6.3rem]">Usuario:</strong> {username}</p>
      <p><strong className="inline-block w-[6.3rem]">Contraseña:</strong> {password}</p>
      <Button
        onClick={hideModal}
        className="mt-7 w-[150px] mx-auto"
      >
        Cerrar</Button>
    </div>
  )
}