import { useMemo, useState } from 'react';

export const useForm = (initialForm = {}) => {

  const normalizedInitialForm = useMemo(() => normalizeInputData(initialForm), [initialForm]);
  const [formState, setformState] = useState(normalizedInitialForm);

  const onInputChange = ({ target }) => {
    const { name, value } = target;
    setformState({
      ...formState,
      [name]: value
    })
  }

  const onResetForm = () => {
    setformState(initialForm);
  }

  return {
    ...formState,
    formState,
    setformState,
    onInputChange,
    onResetForm
  }
}

const normalizeInputData = (inputObject) => {
  const normalizedObject = { ...inputObject };
  Object.keys(normalizedObject).forEach(key => {
    normalizedObject[key] = normalizedObject[key] ? normalizedObject[key] : '';
  });
  return normalizedObject;
};