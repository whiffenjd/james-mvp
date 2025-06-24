// src/hooks/useInvestors.ts
import { useEffect } from "react";
// import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useGetInvestors } from "../../API/Endpoints/Funds/investors";
import { setInvestors,setLoading, setError } from "../../Redux/features/investors/investorsSlice";
import { useAppDispatch, useAppSelector } from "../../Redux/hooks";

export const useInvestors = () => {
  const dispatch = useAppDispatch();
  const { investors, loading, error } = useAppSelector((state) => state.investors);
  
  // TanStack Query for server state
  const { 
    data: queryData, 
    isLoading: queryLoading, 
    error: queryError 
  } = useGetInvestors();

  // Sync TanStack Query data with Redux
  useEffect(() => {
    if (queryData) {
      dispatch(setInvestors(queryData));
    }
  }, [queryData, dispatch]);

  useEffect(() => {
    if (queryLoading) {
      dispatch(setLoading());
    }
  }, [queryLoading, dispatch]);

  useEffect(() => {
    if (queryError) {
      dispatch(setError(queryError.message));
    }
  }, [queryError, dispatch]);

  return {
    investors,
    loading,
    error,
    refetch: () => {
      // You can add refetch logic here if needed
    },
  };
};