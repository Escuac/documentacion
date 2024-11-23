import { useState, useEffect, useCallback } from 'react';
import { useFetch3 } from './useFetch3';

export const useSearch = (
  initialQuery = '',
  {
    endpoint,
    limit = null,
    page = null,
    searchOnEmptyQuery = false,
    debounceTime = 300,
    special = {},
  } = {}
) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const { data, error, isLoading, fetchData: originalFetchData, restartFetch } = useFetch3();

  // Memoizamos fetchData para asegurarnos de que su referencia sea estable
  const fetchData = useCallback(originalFetchData, []);

  const onSearchChange = async (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
  };

  const executeSearch = useCallback(
    async (manualQuery = query) => {
      if (manualQuery.trim() === '' && !searchOnEmptyQuery) {
        setResults([]);
        return;
      }
      await fetchData(endpoint, { query: manualQuery, limit, page, ...special });
    },
    [fetchData, endpoint, limit, page, query, searchOnEmptyQuery]
  );

  const onReset = () => {
    restartFetch();
    setQuery('');
    setResults(null);
  };

  useEffect(() => {
    if (query.trim() === '' && !searchOnEmptyQuery) {
      setResults(null);
      return;
    }

    const handler = setTimeout(() => {
      executeSearch(query);
    }, debounceTime);

    return () => {
      clearTimeout(handler);
    };
  }, [query, debounceTime, executeSearch]);

  useEffect(() => {
    if (data && Array.isArray(data.users)) {
      setResults(data);
    }
  }, [data]);

  return {
    query,
    setQuery,
    onReset,
    onSearchChange,
    results,
    isLoading,
    error,
    executeSearch,
  };
};
