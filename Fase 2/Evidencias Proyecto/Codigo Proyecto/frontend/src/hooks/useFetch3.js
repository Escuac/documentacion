import { useCallback } from "react";
import { useState } from "react";

export const useFetch3 = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback((apicall, apiParams = {}, callback) => {
    restartFetch();
    setIsLoading(true);
    apicall(apiParams)
      .then(response => {
        return response.json().then(data => {
          if (response.ok) {
            setData(data);
            if (callback) {
              callback(data);
            }
          } else {
            setData(null);
            const error = {
              status: response.status,
              message: data.error,
            }
            throw error;
          }
        });
      })
      .catch(error => setError(error))
      .finally(_ => setIsLoading(false));
  }, []);

  const fetchWithoutState = async (apicall, options = {}) => {
    restartFetch();
    const response = await apicall(options);
    const data = await response.json();

    if (response.ok) {
      return { ok: true, data, status: response.status };
    } else {
      return { ok: false, error: data.error, status: response.status };
    }
  };

  const restartFetch = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);


  return { data, error, isLoading, fetchData, fetchWithoutState, restartFetch }
}
