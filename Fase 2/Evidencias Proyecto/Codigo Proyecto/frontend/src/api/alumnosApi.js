import { BASE_API_URL } from '@/constants';

export function getAll({ limit = null, page = null }) {
  const params = new URLSearchParams({
    limit, page
  }).toString();

  return fetch(`${BASE_API_URL}/users?${params}`, {
    credentials: 'include',
  });
}

export function getOneUser({ user_id }) {
  return fetch(`${BASE_API_URL}/users/${user_id}`, {
    credentials: 'include',
  });
}

export function create(newUser) {
  return fetch(`${BASE_API_URL}/users`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newUser),
  });
}

export function searchUsers({ query = '', limit = null, page = null, lastPayment = null }) {

  const paramsObject = {
    q: query,
    ...(limit !== null && { limit }),
    ...(page !== null && { page }),
    ...(lastPayment !== null && { lastPayment })
  };

  const params = new URLSearchParams(paramsObject).toString();

  return fetch(`${BASE_API_URL}/users/search?${params}`, {
    credentials: 'include',
  });
}

export function update(user) {
  return fetch(`${BASE_API_URL}/users`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  });
}

export function getPayments({ id_usuario, active = null }) {
  const paramsObject = {
    ...(active !== null && { active })
  };
  const params = new URLSearchParams(paramsObject).toString();
  return fetch(`${BASE_API_URL}/users/${id_usuario}/payments?${params}`, {
    credentials: 'include',
  });

}

export function createPayment({ user_id, paymentData }) {

  return fetch(`${BASE_API_URL}/users/${user_id}/payments`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(paymentData)
  })
}

export function updatePayment({ user_id, payment_id, paymentData }) {
  return fetch(`${BASE_API_URL}/users/${user_id}/payments/${payment_id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(paymentData)
  })
}

export function deletePayment({ id_pago, id_usuario }) {
  return fetch(`${BASE_API_URL}/users/${id_usuario}/payments/${id_pago}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}

export function createMeasurementSesion({ id_usuario, sessionData }) {
  return fetch(`${BASE_API_URL}/users/${id_usuario}/measurements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sessionData),
    credentials: 'include',
  });
}

export function getAllUserMeasurements({ id_usuario }) {
  return fetch(`${BASE_API_URL}/users/${id_usuario}/measurements`, {
    credentials: 'include',
  });
}

export function updateUserMeasurementSession({ id_usuario, id_sesion, sessionData }) {
  return fetch(`${BASE_API_URL}/users/${id_usuario}/measurements/${id_sesion}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sessionData),
    credentials: 'include',
  });
}

export function deleteUserMeasurementSession({ id_sesion }) {
  return fetch(`${BASE_API_URL}/measurements/${id_sesion}`, {
    method: 'DELETE',
    credentials: 'include',
  });

}

export function deleteUserAttendance({ id_usuario, id_asistencia }) {
  return fetch(`${BASE_API_URL}/users/${id_usuario}/attendances/${id_asistencia}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}

export function registerUserAttendance({ id_usuario }) {
  return fetch(`${BASE_API_URL}/users/${id_usuario}/attendances`, {
    method: 'POST',
    credentials: 'include',
  });
}