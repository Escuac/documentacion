import { useState, useCallback } from "react";

export const useFetch = (includeCredentials = true) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (url, options) => {
      setIsLoading(true);

      if (options.method === "POST") {
        options.headers = {
          ...options.headers,
          "Content-Type": "application/json",
        };
      }

      try {
        const response = await fetch(url, {
          ...options,
          credentials: includeCredentials ? "include" : "omit",
        });

        const result = await response.json();

        if (response.ok) {
          setData(result);
          setError(null);
        } else {
          setError({
            code: response.status,
            body: result,
          });
        }
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [includeCredentials]
  );

  return { isLoading, error, data, fetchData };
};