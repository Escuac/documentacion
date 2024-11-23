import { BASE_API_URL } from '@/constants';

export function getDashboardMetrics() {

  return fetch(`${BASE_API_URL}/dashboard`, {
    credentials: 'include',
  });
}