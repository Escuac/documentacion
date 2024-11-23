import { BASE_API_URL } from '@/constants';

export function getMeasurementTypes() {
  
  return fetch(`${BASE_API_URL}/measurements/types`, {
    credentials: 'include',
  });
}

export function getAllMeasurements(){
  return fetch(`${BASE_API_URL}/measurements`, {
    credentials: 'include',
  });
}