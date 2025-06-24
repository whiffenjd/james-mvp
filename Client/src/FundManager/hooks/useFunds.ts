// src/hooks/useFunds.ts

import { useEffect } from "react";
import { useGetAllFundsQuery } from "../../API/Endpoints/Funds/funds";
import { setAllFunds, setError, setLoading } from "../../Redux/features/Funds/fundsSlice";
import { useAppDispatch } from "../../Redux/hooks";

export const useFunds = () => {
  const dispatch = useAppDispatch();
  
  const { 
    data: funds, 
    isLoading, 
    error,
    isFetching
  } = useGetAllFundsQuery();

  // Sync loading state
  useEffect(() => {
    dispatch(setLoading(isLoading || isFetching));
  }, [isLoading, isFetching, dispatch]);

  // Sync error state
  useEffect(() => {
    if (error) {
      dispatch(setError(error instanceof Error ? error.message : 'An error occurred'));
    }
  }, [error, dispatch]);

  // Update Redux store when data loads
  useEffect(() => {
    if (funds) {
      dispatch(setAllFunds(funds));
    }
  }, [funds, dispatch]);

  return {
    isLoading: isLoading || isFetching,
    error: error instanceof Error ? error.message : null
  };
};