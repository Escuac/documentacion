import { BASE_API_URL } from '@/constants';

export function getActivePlans() {
  const status = "active";
  const params = new URLSearchParams({status}).toString();
  
  return fetch(`${BASE_API_URL}/plans?${params}`, {
    credentials: 'include',
  });
}


export function getAllPlans() {  
  return fetch(`${BASE_API_URL}/plans`, {
    credentials: 'include',
  });
}

export function createPlan(planData) {
  return fetch(`${BASE_API_URL}/plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(planData),
    credentials: 'include',
  });
}

export function updatePlan({id_plan, planData}) {
  return fetch(`${BASE_API_URL}/plans/${id_plan}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(planData),
    credentials: 'include',
  });
}