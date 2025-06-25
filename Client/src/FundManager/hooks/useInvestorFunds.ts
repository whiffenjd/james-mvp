// src/hooks/useInvestorFunds.ts
import { useEffect } from "react";
// import { useGetInvestorFunds } from "../API/Endpoints/Funds/funds";

import { useAppDispatch } from "../../Redux/hooks";
import { useGetInvestorFunds } from "../../API/Endpoints/Funds/funds";
import { resetInvestorFunds , setInvestorFunds, 
    setLoading, 
    setError,} from "../../Redux/features/InvestorFunds/investorFundsSlice";
import { useAuth } from "../../Context/AuthContext";

export const useInvestorFunds = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  
  const { 
    data: funds, 
    isLoading, 
    error,
    isFetching,
    refetch
  } = useGetInvestorFunds();

  // Reset funds when user logs out
  useEffect(() => {
    if (!user) {
      dispatch(resetInvestorFunds());
    }
  }, [user, dispatch]);

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
    if (funds && user) {
      dispatch(setInvestorFunds(funds));
    }
  }, [funds, user, dispatch]);

  // Function to manually refetch funds
  const refreshInvestorFunds = () => {
    refetch();
  };

  return {
    isLoading: isLoading || isFetching,
    error: error instanceof Error ? error.message : null,
    refreshInvestorFunds
  };
};