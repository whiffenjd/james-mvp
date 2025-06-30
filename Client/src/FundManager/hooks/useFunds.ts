// src/hooks/useFunds.ts

import { useEffect } from "react";
import { useGetAllFundsQuery } from "../../API/Endpoints/Funds/funds";
import { resetFunds, setAllFunds, setError, setLoading } from "../../Redux/features/Funds/fundsSlice";
import { useAppDispatch } from "../../Redux/hooks";
import { useAuth } from "../../Context/AuthContext";

export const useFunds = () => {
  const dispatch = useAppDispatch();
  const {user}=useAuth();
  
  const { 
    data: funds, // Assuming the data structure is { data: FundSummary[] }
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
      console.error("Funds error:", error);
    }
  }, [error, dispatch]);

  // Update Redux store when data loads
  useEffect(() => {
    if (funds && user?.id) {
      
      dispatch(setAllFunds(funds));
    }
  }, [funds, user?.id, dispatch]);

  useEffect(()=>{
    if(!user?.id){
      dispatch(resetFunds()); 
      // Clear funds if user is not authenticated
    }
  },[user?.id, dispatch])

  return {
    isLoading: isLoading || isFetching,
    error: error instanceof Error ? error.message : null
  };
};