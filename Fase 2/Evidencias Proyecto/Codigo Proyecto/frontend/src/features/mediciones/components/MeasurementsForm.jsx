import { getMeasurementTypes } from '@/api/medicionesApi';
import { Button } from '@/components/shadcn/button';
import { FORM_MODES, MEASUREMENT_TYPE, GENDER, defaultMeasurementFormValues } from '@/constants';
import { toast, useFetch3, useForm, useSearch } from '@/hooks';
import { useState, useContext, useEffect } from 'react';
import { calculateAge } from '@/lib/utils';
import { searchUsers, createMeasurementSesion, updateUserMeasurementSession } from '@/api/alumnosApi';
import { FakeSearchBar } from '@/components/FakeSearchBar';
import { SearchBar } from '@/components';
import { FaCircleMinus, FaCirclePlus } from 'react-icons/fa6';
import { ModalContext } from '@/context';


const useSearchOptions = {
  endpoint: searchUsers,
  limit: 10,
  page: 1
}

export const MeasurementsForm = ({ initialValues = defaultMeasurementFormValues, mode = FORM_MODES.CREATE, currentUser=null }) => {
  const [formState, setformState] = useState(structuredClone(initialValues));
  const [selectedUser, setSelectedUser] = useState(null);
  const [toDelete, setToDelete] = useState([]);
  const { edad, altura, peso, imc, genero, p_suprailiaco, p_subescapular, p_bicipital, p_tricipital, porcentaje_grasa } = formState;
  const [isFetchLoading, setIsFetchLoading] = useState(false);
  const [measurements, setMeasurements] = useState([{
    id_medicion: "n" + Date.now(),
    id_tipo_medicion: "",
    valor: "",
    nota: "",
  }]);
  const { fetchWithoutState } = useFetch3();
  const { setQuery, query, results, error, isLoading, onSearchChange } = useSearch('', useSearchOptions);
  const { hideModal } = useContext(ModalContext);

  useEffect(() => {
    if (mode === FORM_MODES.EDIT) {
      setSelectedUser({
        id_usuario: initialValues.id_usuario,
        nombre_completo: initialValues.nombre_completo
      });

      setMeasurements([...initialValues.mediciones])
    }

    if (mode === FORM_MODES.CREATE && currentUser) {
      setSelectedUser(currentUser);
    }

  }, []);

  const onInputChangeBase = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    const prevState = { ...formState }
    prevState[name] = {
      id_medicion: e.target.dataset.id,
      id_tipo_medicion: MEASUREMENT_TYPE[name.toUpperCase()],
      valor: value
    };
    setformState(prevState);
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser) {
      alert('Debes seleccionar un usuario');
      return;
    }
    //TODO cambiar la forma de crear y editar una sesión para que tenga la misma forma que al hacer un get
    const sesionDate = new Date();
    const formatedSesionDate = sesionDate.toLocaleDateString('en-CA');
    const measurementData = {
      'id_usuario': formState.id_usuario,
      'id_sesion': formState.id_sesion,
      'fecha': formState.fecha,
      'nombre_completo': formState.nombre_completo,
      mediciones: {}
    };

    // arreglo contiene el nombre de las propiedades que no queremos que se agreguen dentro de mediciones mas adelante
    const sessionMetaKeys = ['id_usuario', 'id_sesion', 'fecha', 'nombre_completo', 'mediciones'];
    // Agrega las mediciones base
    for (const prop in formState) {
      if (formState[prop]?.valor === '') continue;
      if (sessionMetaKeys.includes(prop)) continue;

      measurementData.mediciones[prop] = { ...formState[prop] }
    }

    // Agrega las mediciones extra
    measurements.forEach(e => {
      if (e.valor === '') return;
      const measurementName = mapMeasurementType(e.id_tipo_medicion)
      measurementData.mediciones[measurementName] = { ...e }
    })

    if (Object.keys(measurementData.mediciones).length === 0) {
      alert('Debes ingresar al menos 1 medición');
      return;
    }
    if (mode === FORM_MODES.CREATE) {
      setIsFetchLoading(true);
      const response = await fetchWithoutState(createMeasurementSesion, {
        id_usuario: selectedUser.id_usuario,
        sessionData: {
          fecha: formatedSesionDate,
          mediciones: Object.values(measurementData.mediciones)
        }
      });

      if (response.error) {
        toast({
          variant: "destructive",
          title: "Registro fallido",
          description: "No fue posible completar el registro de la Medición. Intenta de nuevo más tarde.",
        });

        setIsFetchLoading(false);
        return;
      }

      toast({
        title: "Se ha guardado con éxito.",
        description: "Las mediciones del alumno se han guardado correctamente.",
      });
    }

    if (mode === FORM_MODES.EDIT) {
      setIsFetchLoading(true);
      const response = await fetchWithoutState(updateUserMeasurementSession, {
        id_usuario: selectedUser.id_usuario,
        id_sesion: initialValues.id_sesion,
        sessionData: {
          fecha: initialValues.fecha,
          mediciones: Object.values(measurementData.mediciones),
          toDelete
        }
      });

      if (response.error) {
        toast({
          variant: "destructive",
          title: "Registro fallido",
          description: "No fue posible completar la actualización de la Medición. Intenta de nuevo más tarde.",
        });

        setIsFetchLoading(false);
        return;
      }

      toast({
        title: "Se ha guardado con éxito.",
        description: "Las mediciones del alumno se han guardado correctamente.",
      });
    }

    hideModal();
    setIsFetchLoading(false);
  }

  const handleOnResultClick = (usuario) => {

    setSelectedUser({
      id_usuario: usuario.id_usuario,
      nombre_completo: `${usuario.nombres} ${usuario.apellidos}`
    });

    const age = usuario.fecha_nacimiento ? calculateAge(usuario.fecha_nacimiento) : '';
    const sex = usuario.genero ? usuario.genero : '';

    setformState({
      ...formState,
      edad: {
        ...formState.edad,
        valor: age
      },
      genero: {
        ...formState.genero,
        valor: sex
      }
    });
  }

  const handleSearchBarClear = () => {
    setSelectedUser(null);
    setQuery('');
    setformState(structuredClone(initialValues));

    setMeasurements([{
      id_medicion: "n" + Date.now(),
      id_tipo_medicion: "",
      valor: "",
      nota: "",
    }]);
  }

  return (
    <form className='contenedor-form pr-10' onSubmit={handleFormSubmit}>

      <h2>Mediciones</h2>
      {
        mode === FORM_MODES.CREATE && (
          <>
            <label className='self-start mb-2 text-muted-foreground'>Registrar medición a</label>
            {
              selectedUser ? (
                <FakeSearchBar
                  className='mb-5'
                  text={`${selectedUser.nombre_completo}`}
                  onClean={handleSearchBarClear}
                />
              ) :
                <SearchBar
                  className='mb-5'
                  placeholder="Buscar Alumno..."
                  onSearchChange={onSearchChange}
                  showResultsContainer={true}
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
                          onResultClick={() => handleOnResultClick(result)}
                        />
                      ))
                    ) : <p className="my-1 ml-2">No se encontraron resultados</p>}
                </SearchBar>
            }
          </>
        )
      }
      {
        (mode === FORM_MODES.EDIT && selectedUser) && (
          <FakeSearchBar
            className='mb-5'
            text={`${selectedUser.nombre_completo}`}
            onClean={handleSearchBarClear}
            showCloseIcon={false}
          />
        )
      }

      <BasicInfoSection
        formState={formState}
        onInputChange={onInputChangeBase}
        setformState={setformState}
      />
      <MeasurementsSection
        measurementsData={measurements}
        setMeasurements={setMeasurements}
        setToDelete={setToDelete}
        toDelete={toDelete}
      />
      <FatMeasurementSection
        formState={formState}
        setformState={setformState}
        onInputChange={onInputChangeBase}
      />
      <div className='flex justify-end gap-x-5 mt-12'>
        <Button
          type="button"
          variant="outline"
          disabled={isFetchLoading}
        >Cancelar</Button>
        <Button
          type='submit'
          disabled={isFetchLoading}
        >Guardar</Button>
      </div>
    </form>
  )
}

function BasicInfoSection({ formState, setformState, onInputChange }) {
  const { altura, peso, genero, imc, edad } = formState;
  useEffect(() => {
    if (altura.valor === '' || peso.valor === '') {
      setformState({
        ...formState,
        imc: {
          ...formState.imc,
          valor: '',
        }
      });
      return
    };

    // si ambos son numeros, calcula el IMC
    setformState({
      ...formState,
      imc: {
        ...formState.imc,
        id_tipo_medicion: MEASUREMENT_TYPE.IMC,
        valor: calculateBMI(peso.valor, altura.valor)
      }
    });
  }, [altura.valor, peso.valor]);

  return (<><p className='self-start font-semibold'>Datos Generales</p>
    <hr className='border w-[100%] mb-4' />
    <div className='flex w-[100%] flex-col gap-2 mb-6'>
      <div className='flex gap-5'>
        <div className='input-group'>
          <label htmlFor="">Edad</label>
          <input
            {...(edad.id_medicion ? { "data-id": edad.id_medicion } : {})}
            type="number"
            name="edad"
            value={edad.valor}
            min={10}
            max={110}
            onChange={onInputChange}
          />
        </div>
        <div className='input-group'>
          <label htmlFor="">Sexo</label>
          <select
            {...(genero.id_medicion ? { "data-id": genero.id_medicion } : {})}
            name='genero'
            value={genero.valor}
            onChange={onInputChange}
          >
            <option value=''>---</option>
            <option value={GENDER.MASCULINO}>Masculino</option>
            <option value={GENDER.FEMENINO}>Femenino</option>
          </select>
        </div>
        <div className='input-group'>
          <label htmlFor="">Altura <span className='text-sm text-muted-foreground'>(cm)</span></label>
          <input
            {...(altura.id_medicion ? { "data-id": altura.id_medicion } : {})}
            type="number"
            name="altura"
            min={50}
            max={250}
            step="any"
            value={altura.valor}
            onChange={onInputChange}
          />
        </div>
        <div className='input-group'>
          <label htmlFor="">Peso <span className='text-sm text-muted-foreground'>(kg)</span></label>
          <input
            {...(peso.id_medicion ? { "data-id": peso.id_medicion } : {})}
            type="number"
            name="peso"
            min={20}
            max={400}
            step="any"
            value={peso.valor}
            onChange={onInputChange}
          />
        </div>
      </div>
      <div className='flex gap-5'>

      </div>
      <div className='flex w-[22%] self-start'>
        <div className='input-group' title="Altura y peso son necesarios para calcular el IMC.">
          <label htmlFor="">IMC</label>
          <input
            {...(imc.id_medicion ? { "data-id": imc.id_medicion } : {})}
            type="number"
            name="imc"
            min={5}
            max={70}
            value={imc.valor}
            onChange={onInputChange}
            disabled
          />
        </div>
      </div>
    </div></>);
}

function MeasurementsSection({ measurementsData = [], setMeasurements, setToDelete, toDelete }) {
  const handleInputChange = (e, index) => {
    const newMeasurement = [...measurementsData];
    newMeasurement[index][e.target.name] = e.target.value;

    setMeasurements(newMeasurement);
  }

  const handleItemDelete = (index, idMeasurement) => {
    const newMeasurement = [...measurementsData];
    newMeasurement.splice(index, 1)
    setMeasurements(newMeasurement);

    setToDelete([...toDelete, idMeasurement])

  }

  const handleItemAdd = () => {

    const newMeasurement = [...measurementsData];
    newMeasurement.push({
      id_medicion: 'n' + Date.now(),
      id_tipo_medicion: '',
      valor: '',
      nota: ''
    });
    setMeasurements(newMeasurement);
  }

  return (
    <>
      <p className='self-start font-semibold'>Mediciones Corporales</p>
      <hr className='border w-[100%] mb-7' />
      <div className='flex mb-3 w-[100%] gap-2 flex-col'>
        {
          measurementsData.map((measurement, index) => (
            <MeasurementItem
              key={measurement.id_medicion}
              measurementData={measurement}
              onInputChange={handleInputChange}
              index={index}
              onDelete={handleItemDelete}
              onAdd={handleItemAdd}
            />
          ))
        }
        <div className="flex-1 min-w-[100%]">
          <Button
            type="button"
            className="ml-auto mt-1 w-9 h-9 p-0 flex"
            onClick={handleItemAdd}
          >
            <FaCirclePlus className='w-4 h-4' />
          </Button>
        </div>
      </div>
    </>
  );
}

function FatMeasurementSection({ formState, setformState, onInputChange }) {
  const { p_suprailiaco, p_subescapular, p_bicipital, p_tricipital, porcentaje_grasa, edad, genero } = formState;

  useEffect(() => {
    const prevState = { ...formState };
    if (!p_suprailiaco.valor || !p_subescapular.valor || !p_bicipital.valor || !p_tricipital.valor) {
      prevState.porcentaje_grasa.valor = '';
      setformState(prevState);
      return;
    }

    if (!edad.valor || !genero.valor) {
      prevState.porcentaje_grasa.valor = '';
      setformState(prevState);
      return;
    }

    const sex = parseInt(genero.valor) === 2 ? 'female' : 'male';
    prevState.porcentaje_grasa.valor = calculateBodyFatPercentage(sex, edad.valor, [p_suprailiaco.valor, p_subescapular.valor, p_bicipital.valor, p_tricipital.valor]);
    prevState.porcentaje_grasa.id_tipo_medicion = MEASUREMENT_TYPE.PORCENTAJE_GRASA;
    setformState(prevState);

  }, [p_suprailiaco.valor, p_subescapular.valor, p_bicipital.valor, p_tricipital.valor, genero.valor, edad.valor]);


  return (
    <>
      <p className='self-start font-semibold'>Evaluación de Grasa Corporal</p>
      <hr className='border w-[100%] mb-4' />
      <div className='flex flex-col gap-3 w-[100%]'>
        <div className='flex gap-3'>
          <div className='input-group'>
            <label htmlFor="">Pliegue Suprailiaco <span className='text-sm text-muted-foreground'>(mm)</span></label>
            <input
              {...(p_suprailiaco.id_medicion ? { "data-id": p_suprailiaco.id_medicion } : {})}
              type="number"
              name="p_suprailiaco"
              min={1}
              max={80}
              step="any"
              value={p_suprailiaco.valor}
              onChange={onInputChange}
            />
          </div>
          <div className='input-group'>
            <label htmlFor="">Pliegue Subescapular <span className='text-sm text-muted-foreground'>(mm)</span></label>
            <input
              {...(p_subescapular.id_medicion ? { "data-id": p_subescapular.id_medicion } : {})}
              type="number"
              name="p_subescapular"
              min={1}
              max={80}
              step="any"
              value={p_subescapular.valor}
              onChange={onInputChange}
            />
          </div>
        </div>
        <div className='flex gap-3'>
          <div className='input-group'>
            <label htmlFor="">Pliegue Bicipital <span className='text-sm text-muted-foreground'>(mm)</span></label>
            <input
              {...(p_bicipital.id_medicion ? { "data-id": p_bicipital.id_medicion } : {})}
              type="number"
              name="p_bicipital"
              min={1}
              max={80}
              step="any"
              value={p_bicipital.valor}
              onChange={onInputChange}
            />
          </div>
          <div className='input-group'>
            <label htmlFor="">Pliegue Tricipital <span className='text-sm text-muted-foreground'>(mm)</span></label>
            <input
              {...(p_tricipital.id_medicion ? { "data-id": p_tricipital.id_medicion } : {})}
              type="number"
              name="p_tricipital"
              min={1}
              max={80}
              step="any"
              value={p_tricipital.valor}
              onChange={onInputChange}
            />
          </div>
        </div>
        <div className='w-[25%]'>
          <div className='input-group' title="Para calcular el % de grasa tienes que llenar edad, sexo y medir al menos uno de los pliegues.">
            <label htmlFor="">% Grasa</label>
            <input
              {...(porcentaje_grasa.id_medicion ? { "data-id": porcentaje_grasa.id_medicion } : {})}
              type="number"
              name="porcentaje_grasa"
              min={1}
              max={80}
              step="any"
              value={porcentaje_grasa.valor}
              onChange={onInputChange}
              disabled
            />
            <p className='text-sm text-muted-foreground h-4 mt-1'
            >{
                (formState.edad && formState.edad < 17) ? 'Edad mínima: 17 años' : ''}
            </p>

          </div>
        </div>
      </div>
    </>
  );
}

const MeasurementItem = ({ measurementData, onInputChange, index, onDelete }) => {

  return (
    <div className='flex gap-2 items-end'>
      <div
        className='input-group'
        style={{ width: '15.5rem' }}
      >
        <label htmlFor="">Medida</label>
        <select
          value={measurementData.id_tipo_medicion}
          onChange={(e) => onInputChange(e, index)}
          name='id_tipo_medicion'
          required={measurementData.valor !== '' || measurementData.nota !== ''}
        >
          <option value=''>---</option>
          <option value={MEASUREMENT_TYPE.ABDOMEN}>Abdomen</option>
          <option value={MEASUREMENT_TYPE.PECHO}>Pecho</option>
          <option value={MEASUREMENT_TYPE.BICEPS}>Biceps</option>
          <option value={MEASUREMENT_TYPE.HOMBROS}>Hombros</option>
          <option value={MEASUREMENT_TYPE.GLUTEOS}>Gluteos</option>
          <option value={MEASUREMENT_TYPE.CINTURA}>Cintura</option>
          <option value={MEASUREMENT_TYPE.MUSLOS}>Muslos</option>
          <option value={MEASUREMENT_TYPE.PANTORRILLAS}>Pantorrillas</option>
          <option value={MEASUREMENT_TYPE.CUELLO}>Cuello</option>
          <option value={MEASUREMENT_TYPE.ANTEBRAZO}>Antebrazo</option>
        </select>
      </div>
      <div
        className='input-group'
        style={{ width: '15rem' }}
      >
        <label htmlFor="">Valor <span className='text-sm text-muted-foreground'>(cm)</span></label>
        <input
          type='number'
          value={measurementData.valor}
          name='valor'
          min={0}
          max={300}
          step="any"
          onChange={(e) => onInputChange(e, index)}
          required={measurementData.id_tipo_medicion !== '' || measurementData.nota !== ''}
        />
      </div>
      <div className='input-group'>
        <label htmlFor="">Nota</label>
        <input
          type="text"
          maxLength="200"
          value={measurementData.nota}
          name='nota'
          onChange={(e) => onInputChange(e, index)}
        />

      </div>
      <Button
        className="flex-none p-0 w-9 h-9 mb-[.1rem]"
        onClick={() => onDelete(index, measurementData.id_medicion)}
        type="button"
        variant="destructive"
      >
        <FaCircleMinus className="h-4 w-4" />
      </Button>
    </div>
  )
}

const calculateBMI = (weight, height) => {
  if (!weight || !height) return '';

  const parsedWeight = parseFloat(weight);
  const parsedHeight = parseFloat(height) / 100;

  return (parsedWeight / (parsedHeight * parsedHeight)).toFixed(2);
}

const durninWomersleyCoefficients = {
  male: {
    "17-19": { base: 1.1620, factor: 0.0630 },
    "20-29": { base: 1.1631, factor: 0.0632 },
    "30-39": { base: 1.1422, factor: 0.0544 },
    "40-49": { base: 1.1620, factor: 0.0700 },
    "50+": { base: 1.1715, factor: 0.0779 },
  },
  female: {
    "17-19": { base: 1.1549, factor: 0.0678 },
    "20-29": { base: 1.1599, factor: 0.0717 },
    "30-39": { base: 1.1423, factor: 0.0632 },
    "40-49": { base: 1.1333, factor: 0.0612 },
    "50+": { base: 1.1339, factor: 0.0645 },
  }
};

function getAgeRange(age) {
  if (age >= 17 && age <= 19) return "17-19";
  if (age >= 20 && age <= 29) return "20-29";
  if (age >= 30 && age <= 39) return "30-39";
  if (age >= 40 && age <= 49) return "40-49";
  if (age >= 50) return "50+";
  return "17-19";
}

function calculateBodyFatPercentage(sex, age, skinfolds) {
  const parcedSkinfolds = skinfolds.map(skinfold => parseFloat(skinfold));

  const skinfoldsSum = parcedSkinfolds.reduce((acc, skinfold) => acc + skinfold, 0);
  const logSkinfoldsSum = Math.log10(skinfoldsSum);

  // Determina el rango de edad
  const ageRange = getAgeRange(age);
  const coefficients = durninWomersleyCoefficients[sex][ageRange];

  // Calcula la densidad corporal
  const bodyDensity = coefficients.base - coefficients.factor * logSkinfoldsSum;

  // Calcula el porcentaje de grasa corporal
  const bodyFatPercentage = ((4.95 / bodyDensity) - 4.5) * 100;
  const bodyFatPercentageRounded = Math.round(bodyFatPercentage * 100) / 100;

  return bodyFatPercentageRounded > 0 ? bodyFatPercentageRounded : 0;
}

const mapMeasurementType = (id) => {
  const measurementIdToNameMap = {};
  for (const key in MEASUREMENT_TYPE) {
    measurementIdToNameMap[MEASUREMENT_TYPE[key]] = key.toLowerCase();
  }

  return measurementIdToNameMap[id]
}