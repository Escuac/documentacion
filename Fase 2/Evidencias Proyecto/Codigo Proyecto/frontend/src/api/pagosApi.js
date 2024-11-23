import { BASE_API_URL } from '@/constants';

export function getAllPayments({ limit = null, page = null }) {
  const params = new URLSearchParams({
    limit, page
  }).toString();

  return fetch(`${BASE_API_URL}/payments?${params}`, {
    credentials: 'include',
  });
}

export function getExpiringSoon(){
  return fetch(`${BASE_API_URL}/payments/expiring-soon`, {
    credentials: 'include',
  });
}