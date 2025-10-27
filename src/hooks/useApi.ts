import { useState, useEffect, useCallback } from 'react'; 
import type { AxiosResponse, AxiosError } from 'axios';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...params: unknown[]) => Promise<T | undefined>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export const useApi = <T,>(
  apiFunction: (...params: unknown[]) => Promise<AxiosResponse<T>>,
  autoLoad: boolean = true
): UseApiResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(autoLoad);
  const [error, setError] = useState<string | null>(null);

  //callback actualizado
  const execute = useCallback(async (...params: unknown[]): Promise<T | undefined> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction(...params);
      setData(response.data);
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Error en la petición';
      setError(errorMessage);
      throw axiosError;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]); 

  useEffect(() => {
    if (autoLoad) {
      void execute();
    }
  }, [autoLoad, execute]); 

  return { data, loading, error, execute, setData };
};